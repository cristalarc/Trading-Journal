"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { createLogger } from "@/lib/logger";

const logger = createLogger('NewIdeaPage');

interface Strategy {
  id: string;
  name: string;
}

interface Source {
  id: string;
  name: string;
}

/**
 * NewIdeaPage Component
 * 
 * Page for creating new trading ideas.
 * Features:
 * - Form for all idea fields
 * - Automatic calculations for RR ratio, To Win Money, and Money Risk
 * - Integration with strategies and sources
 */
export default function NewIdeaPage() {
  logger.debug('Initializing NewIdeaPage component');

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    ticker: '',
    currentPrice: '',
    targetEntry: '',
    targetPrice: '',
    stop: '',
    tradeDirection: 'Long' as 'Long' | 'Short',
    strategyId: '',
    market: 'Bullish' as 'Bullish' | 'Bearish',
    relative: '',
    oneHourTrend: 'Bullish' as 'Bullish' | 'Bearish',
    oneHourCloud: 'Above' as 'Above' | 'Below',
    intendedPosition: '',
    notes: '',
    sourceId: '',
    quality: 'MQ' as 'HQ' | 'MQ' | 'LQ'
  });

  // Fetch strategies and sources
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const [strategiesRes, sourcesRes] = await Promise.all([
          fetch('/api/config/strategies'),
          fetch('/api/config/sources')
        ]);
        
        if (strategiesRes.ok) {
          const strategiesData = await strategiesRes.json();
          setStrategies(strategiesData);
        }
        
        if (sourcesRes.ok) {
          const sourcesData = await sourcesRes.json();
          setSources(sourcesData);
        }
      } catch (error) {
        console.error('Error fetching configs:', error);
      }
    };

    fetchConfigs();
  }, []);

  // Calculate derived fields
  const calculateDerivedFields = () => {
    const targetEntry = parseFloat(formData.targetEntry);
    const targetPrice = parseFloat(formData.targetPrice);
    const stop = parseFloat(formData.stop);
    const intendedPosition = parseInt(formData.intendedPosition);

    if (isNaN(targetEntry) || isNaN(targetPrice) || isNaN(stop) || isNaN(intendedPosition)) {
      return { rrRatio: 0, toWinMoney: 0, moneyRisk: 0 };
    }

    let rrRatio = 0;
    if (formData.tradeDirection === 'Long') {
      const risk = targetEntry - stop;
      const reward = targetPrice - targetEntry;
      rrRatio = risk > 0 ? reward / risk : 0;
    } else {
      const risk = stop - targetEntry;
      const reward = targetEntry - targetPrice;
      rrRatio = risk > 0 ? reward / risk : 0;
    }

    let toWinMoney = 0;
    if (formData.tradeDirection === 'Long') {
      toWinMoney = Math.abs((targetPrice - targetEntry) * intendedPosition);
    } else {
      toWinMoney = Math.abs((targetEntry - targetPrice) * intendedPosition);
    }

    let moneyRisk = 0;
    if (formData.tradeDirection === 'Long') {
      moneyRisk = Math.abs((targetEntry - stop) * intendedPosition);
    } else {
      moneyRisk = Math.abs((stop - targetEntry) * intendedPosition);
    }

    return { rrRatio, toWinMoney, moneyRisk };
  };

  const derivedFields = calculateDerivedFields();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          currentPrice: parseFloat(formData.currentPrice),
          targetEntry: parseFloat(formData.targetEntry),
          targetPrice: parseFloat(formData.targetPrice),
          stop: parseFloat(formData.stop),
          relative: parseFloat(formData.relative),
          intendedPosition: parseInt(formData.intendedPosition),
          // Convert empty strings to null for optional foreign keys
          strategyId: formData.strategyId && formData.strategyId.trim() !== '' ? formData.strategyId : null,
          sourceId: formData.sourceId && formData.sourceId.trim() !== '' ? formData.sourceId : null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to create idea');
      }

      const newIdea = await response.json();
      logger.info('Idea created successfully', { ideaId: newIdea.id });
      router.push('/ideas');
    } catch (error) {
      console.error('Error creating idea:', error);
      setError(error instanceof Error ? error.message : 'Failed to create idea');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">New Trading Idea</h1>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Ticker *</label>
              <input
                type="text"
                value={formData.ticker}
                onChange={(e) => handleInputChange('ticker', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Current Price *</label>
              <input
                type="number"
                step="0.01"
                value={formData.currentPrice}
                onChange={(e) => handleInputChange('currentPrice', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Entry *</label>
              <input
                type="number"
                step="0.01"
                value={formData.targetEntry}
                onChange={(e) => handleInputChange('targetEntry', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Price *</label>
              <input
                type="number"
                step="0.01"
                value={formData.targetPrice}
                onChange={(e) => handleInputChange('targetPrice', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Stop *</label>
              <input
                type="number"
                step="0.01"
                value={formData.stop}
                onChange={(e) => handleInputChange('stop', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Trade Direction *</label>
              <select
                value={formData.tradeDirection}
                onChange={(e) => handleInputChange('tradeDirection', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              >
                <option value="Long">Long</option>
                <option value="Short">Short</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Intended Position *</label>
              <input
                type="number"
                value={formData.intendedPosition}
                onChange={(e) => handleInputChange('intendedPosition', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              />
            </div>
          </div>

          {/* Market Analysis */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Market Analysis</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Strategy</label>
              <select
                value={formData.strategyId}
                onChange={(e) => handleInputChange('strategyId', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">Select Strategy</option>
                {strategies.map(strategy => (
                  <option key={strategy.id} value={strategy.id}>
                    {strategy.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Market *</label>
              <select
                value={formData.market}
                onChange={(e) => handleInputChange('market', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              >
                <option value="Bullish">Bullish</option>
                <option value="Bearish">Bearish</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Relative Strength *</label>
              <input
                type="number"
                step="0.01"
                value={formData.relative}
                onChange={(e) => handleInputChange('relative', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">1hr Trend *</label>
              <select
                value={formData.oneHourTrend}
                onChange={(e) => handleInputChange('oneHourTrend', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              >
                <option value="Bullish">Bullish</option>
                <option value="Bearish">Bearish</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">1hr Cloud *</label>
              <select
                value={formData.oneHourCloud}
                onChange={(e) => handleInputChange('oneHourCloud', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              >
                <option value="Above">Above</option>
                <option value="Below">Below</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Source</label>
              <select
                value={formData.sourceId}
                onChange={(e) => handleInputChange('sourceId', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">Select Source</option>
                {sources.map(source => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Quality *</label>
              <select
                value={formData.quality}
                onChange={(e) => handleInputChange('quality', e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              >
                <option value="HQ">High Quality (HQ)</option>
                <option value="MQ">Medium Quality (MQ)</option>
                <option value="LQ">Low Quality (LQ)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Calculated Fields */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Calculated Fields</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">RR Ratio</label>
              <div className="px-3 py-2 bg-background border rounded-md">
                {derivedFields.rrRatio.toFixed(2)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">To Win Money</label>
              <div className="px-3 py-2 bg-background border rounded-md">
                ${derivedFields.toWinMoney.toFixed(2)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Money Risk</label>
              <div className="px-3 py-2 bg-background border rounded-md">
                ${derivedFields.moneyRisk.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border rounded-md bg-background"
            placeholder="Additional notes about this idea..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded-md hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isLoading ? 'Creating...' : 'Create Idea'}
          </button>
        </div>
      </form>
    </div>
  );
}
