"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createLogger } from "@/lib/logger";

const logger = createLogger('IdeasEditForm');

interface Idea {
  id: string;
  ticker: string;
  date: string;
  currentPrice: any;
  targetEntry: any;
  targetPrice: any;
  stop: any;
  rrRatio: any;
  tradeDirection: 'Long' | 'Short';
  strategy?: { name: string };
  market: 'Bullish' | 'Bearish';
  relative: any;
  oneHourTrend: 'Bullish' | 'Bearish';
  oneHourCloud: 'Above' | 'Below';
  intendedPosition: number;
  toWinMoney: any;
  moneyRisk: any;
  notes?: string;
  sourced?: { name: string };
  quality: 'HQ' | 'MQ' | 'LQ';
  status: 'active' | 'inactive' | 'expired';
  tradeId?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

interface IdeasEditFormProps {
  idea: Idea | undefined;
  onClose: () => void;
  onSave: (ideaId: string, data: any) => Promise<void>;
}

export function IdeasEditForm({ idea, onClose, onSave }: IdeasEditFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    ticker: '',
    currentPrice: '',
    targetEntry: '',
    targetPrice: '',
    stop: '',
    rrRatio: '',
    tradeDirection: 'Long' as 'Long' | 'Short',
    market: 'Bullish' as 'Bullish' | 'Bearish',
    relative: '',
    oneHourTrend: 'Bullish' as 'Bullish' | 'Bearish',
    oneHourCloud: 'Above' as 'Above' | 'Below',
    intendedPosition: '',
    toWinMoney: '',
    moneyRisk: '',
    notes: '',
    quality: 'HQ' as 'HQ' | 'MQ' | 'LQ',
    status: 'active' as 'active' | 'inactive' | 'expired',
    tradeId: '',
    expiresAt: ''
  });

  // Handle ESC key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea) return;
    
    setIsSaving(true);
    try {
      // Convert date string to ISO DateTime for Prisma
      const dataToSave = {
        ...formData,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null
      };
      
      await onSave(idea.id, dataToSave);
      onClose();
    } catch (error) {
      console.error('Error saving idea:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Update form data when idea prop changes
  useEffect(() => {
    if (idea) {
      setFormData({
        ticker: idea.ticker,
        currentPrice: String(idea.currentPrice),
        targetEntry: String(idea.targetEntry),
        targetPrice: String(idea.targetPrice),
        stop: String(idea.stop),
        rrRatio: String(idea.rrRatio),
        tradeDirection: idea.tradeDirection,
    market: idea.market,
    relative: String(idea.relative),
    oneHourTrend: idea.oneHourTrend,
    oneHourCloud: idea.oneHourCloud,
    intendedPosition: String(idea.intendedPosition),
    toWinMoney: String(idea.toWinMoney),
    moneyRisk: String(idea.moneyRisk),
    notes: idea.notes || '',
        quality: idea.quality,
        status: idea.status,
        tradeId: idea.tradeId || '',
        expiresAt: idea.expiresAt ? new Date(idea.expiresAt).toISOString().split('T')[0] : ''
      });
    }
  }, [idea]);

  if (!idea) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background p-6 rounded-lg shadow-lg border m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Edit Trading Idea</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close edit form"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ticker</label>
                  <input
                    type="text"
                    name="ticker"
                    value={formData.ticker}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Current Price</label>
                  <input
                    type="number"
                    step="0.01"
                    name="currentPrice"
                    value={formData.currentPrice}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Trade Direction</label>
                  <select
                    name="tradeDirection"
                    value={formData.tradeDirection}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="Long">Long</option>
                    <option value="Short">Short</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Quality</label>
                  <select
                    name="quality"
                    value={formData.quality}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="HQ">High Quality</option>
                    <option value="MQ">Medium Quality</option>
                    <option value="LQ">Low Quality</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Price Targets */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Price Targets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Target Entry</label>
                  <input
                    type="number"
                    step="0.01"
                    name="targetEntry"
                    value={formData.targetEntry}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Target Price</label>
                  <input
                    type="number"
                    step="0.01"
                    name="targetPrice"
                    value={formData.targetPrice}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Stop Loss</label>
                  <input
                    type="number"
                    step="0.01"
                    name="stop"
                    value={formData.stop}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Risk/Reward Ratio</label>
                  <input
                    type="number"
                    step="0.01"
                    name="rrRatio"
                    value={formData.rrRatio}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Market Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Market Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Market Sentiment</label>
                  <select
                    name="market"
                    value={formData.market}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="Bullish">Bullish</option>
                    <option value="Bearish">Bearish</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Relative Strength</label>
                  <input
                    type="number"
                    step="0.01"
                    name="relative"
                    value={formData.relative}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">1hr Trend</label>
                  <select
                    name="oneHourTrend"
                    value={formData.oneHourTrend}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="Bullish">Bullish</option>
                    <option value="Bearish">Bearish</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">1hr Cloud</label>
                  <select
                    name="oneHourCloud"
                    value={formData.oneHourCloud}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="Above">Above</option>
                    <option value="Below">Below</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Position & Money */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Position & Money</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Intended Position</label>
                  <input
                    type="number"
                    name="intendedPosition"
                    value={formData.intendedPosition}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">To Win Money</label>
                  <input
                    type="number"
                    step="0.01"
                    name="toWinMoney"
                    value={formData.toWinMoney}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Money Risk</label>
                  <input
                    type="number"
                    step="0.01"
                    name="moneyRisk"
                    value={formData.moneyRisk}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Trade ID</label>
                  <input
                    type="text"
                    name="tradeId"
                    value={formData.tradeId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Expires At</label>
                  <input
                    type="date"
                    name="expiresAt"
                    value={formData.expiresAt}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border rounded-md bg-background"
                placeholder="Enter any additional notes about this trading idea..."
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
