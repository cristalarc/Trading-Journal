"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Save, X, Settings } from 'lucide-react';
import Link from 'next/link';

interface Source {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
  category: string;
}

interface Trade {
  id: string;
  tradeId: number;
  ticker: string;
  status: 'OPEN' | 'CLOSED' | 'WIN' | 'LOSS';
  side: 'LONG' | 'SHORT';
  type: 'SHARE' | 'OPTION';
  size: number;
  openDate: string;
  closeDate?: string;
  sourceId?: string;
  entryPrice?: number;
  exitPrice?: number;
  avgBuy?: number;
  avgSell?: number;
  setup1Id?: string;
  setup2Id?: string;
  setup3Id?: string;
  setup4Id?: string;
  setup5Id?: string;
  setup6Id?: string;
  setup7Id?: string;
  mistake1Id?: string;
  mistake2Id?: string;
  mistake3Id?: string;
  mistake4Id?: string;
  mistake5Id?: string;
  mae?: number;
  mfe?: number;
}

export default function EditTradePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [setupTags, setSetupTags] = useState<Tag[]>([]);
  const [mistakeTags, setMistakeTags] = useState<Tag[]>([]);
  const [trade, setTrade] = useState<Trade | null>(null);
  
  const [formData, setFormData] = useState({
    ticker: '',
    size: '',
    openDate: '',
    closeDate: '',
    side: 'LONG' as 'LONG' | 'SHORT',
    type: 'SHARE' as 'SHARE' | 'OPTION',
    sourceId: '',
    entryPrice: '',
    exitPrice: '',
    avgBuy: '',
    avgSell: '',
    setup1Id: '',
    setup2Id: '',
    setup3Id: '',
    setup4Id: '',
    setup5Id: '',
    setup6Id: '',
    setup7Id: '',
    mistake1Id: '',
    mistake2Id: '',
    mistake3Id: '',
    mistake4Id: '',
    mistake5Id: '',
    mae: '',
    mfe: ''
  });

  useEffect(() => {
    if (params.id) {
      fetchTrade(params.id as string);
    }
    fetchSources();
    fetchTags();
  }, [params.id]);

  const fetchTrade = async (id: string) => {
    try {
      const response = await fetch(`/api/trades/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTrade(data);
        setFormData({
          ticker: data.ticker,
          size: data.size.toString(),
          openDate: data.openDate.split('T')[0],
          closeDate: data.closeDate ? data.closeDate.split('T')[0] : '',
          side: data.side,
          type: data.type,
          sourceId: data.sourceId || '',
          entryPrice: data.entryPrice ? data.entryPrice.toString() : '',
          exitPrice: data.exitPrice ? data.exitPrice.toString() : '',
          avgBuy: data.avgBuy ? data.avgBuy.toString() : '',
          avgSell: data.avgSell ? data.avgSell.toString() : '',
          setup1Id: data.setup1Id || '',
          setup2Id: data.setup2Id || '',
          setup3Id: data.setup3Id || '',
          setup4Id: data.setup4Id || '',
          setup5Id: data.setup5Id || '',
          setup6Id: data.setup6Id || '',
          setup7Id: data.setup7Id || '',
          mistake1Id: data.mistake1Id || '',
          mistake2Id: data.mistake2Id || '',
          mistake3Id: data.mistake3Id || '',
          mistake4Id: data.mistake4Id || '',
          mistake5Id: data.mistake5Id || '',
          mae: data.mae ? data.mae.toString() : '',
          mfe: data.mfe ? data.mfe.toString() : ''
        });
      }
    } catch (error) {
      console.error('Error fetching trade:', error);
    }
  };

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/config/sources');
      if (response.ok) {
        const data = await response.json();
        setSources(data);
      }
    } catch (error) {
      console.error('Error fetching sources:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/config/tags');
      if (response.ok) {
        const data = await response.json();
        setSetupTags(data.filter((tag: Tag) => tag.category === 'Setup'));
        setMistakeTags(data.filter((tag: Tag) => tag.category === 'Mistake'));
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert string values to appropriate types
      const submitData = {
        ...formData,
        size: parseFloat(formData.size),
        openDate: formData.openDate, // Keep as string, let service handle conversion
        closeDate: formData.closeDate || undefined, // Keep as string, let service handle conversion
        entryPrice: formData.entryPrice ? parseFloat(formData.entryPrice) : undefined,
        exitPrice: formData.exitPrice ? parseFloat(formData.exitPrice) : undefined,
        avgBuy: formData.avgBuy ? parseFloat(formData.avgBuy) : undefined,
        avgSell: formData.avgSell ? parseFloat(formData.avgSell) : undefined,
        mae: formData.mae ? parseFloat(formData.mae) : undefined,
        mfe: formData.mfe ? parseFloat(formData.mfe) : undefined,
        // Remove empty string IDs
        sourceId: formData.sourceId || undefined,
        setup1Id: formData.setup1Id || undefined,
        setup2Id: formData.setup2Id || undefined,
        setup3Id: formData.setup3Id || undefined,
        setup4Id: formData.setup4Id || undefined,
        setup5Id: formData.setup5Id || undefined,
        setup6Id: formData.setup6Id || undefined,
        setup7Id: formData.setup7Id || undefined,
        mistake1Id: formData.mistake1Id || undefined,
        mistake2Id: formData.mistake2Id || undefined,
        mistake3Id: formData.mistake3Id || undefined,
        mistake4Id: formData.mistake4Id || undefined,
        mistake5Id: formData.mistake5Id || undefined
      };

      const response = await fetch(`/api/trades/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        router.push(`/trades/${params.id}`);
      } else {
        const error = await response.json();
        alert(`Error updating trade: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating trade:', error);
      alert('Failed to update trade');
    } finally {
      setLoading(false);
    }
  };

  if (!trade) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading trade...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/trades/${params.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trade
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Trade #{trade.tradeId}</h1>
          <p className="text-gray-600 mt-1">Update trade information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ticker *
              </label>
              <input
                type="text"
                value={formData.ticker}
                onChange={(e) => handleInputChange('ticker', e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                required
                placeholder="e.g., AAPL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                required
                placeholder="Number of shares/contracts"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Open Date *
              </label>
              <input
                type="date"
                value={formData.openDate}
                onChange={(e) => handleInputChange('openDate', e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Close Date
              </label>
              <input
                type="date"
                value={formData.closeDate}
                onChange={(e) => handleInputChange('closeDate', e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Side *
              </label>
              <select
                value={formData.side}
                onChange={(e) => handleInputChange('side', e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                required
              >
                <option value="LONG">Long</option>
                <option value="SHORT">Short</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                required
              >
                <option value="SHARE">Share</option>
                <option value="OPTION">Option</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <select
                value={formData.sourceId}
                onChange={(e) => handleInputChange('sourceId', e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
              >
                <option value="">Select a source</option>
                {sources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Price Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Price Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entry Price
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.entryPrice}
                onChange={(e) => handleInputChange('entryPrice', e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                placeholder="Entry price per share/contract"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exit Price
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.exitPrice}
                onChange={(e) => handleInputChange('exitPrice', e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                placeholder="Exit price per share/contract"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Average Buy
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.avgBuy}
                onChange={(e) => handleInputChange('avgBuy', e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                placeholder="Average buy price"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Average Sell
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.avgSell}
                onChange={(e) => handleInputChange('avgSell', e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                placeholder="Average sell price"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MAE (Maximum Adverse Excursion)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.mae}
                onChange={(e) => handleInputChange('mae', e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                placeholder="Maximum adverse price movement"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MFE (Maximum Favorable Excursion)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.mfe}
                onChange={(e) => handleInputChange('mfe', e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                placeholder="Maximum favorable price movement"
              />
            </div>
          </div>
        </Card>

        {/* Setup Tags */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Setup Tags</h2>
            <Link href="/settings/tags">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Manage Tags
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <div key={num}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Setup {num}
                </label>
                <select
                  value={formData[`setup${num}Id` as keyof typeof formData] as string}
                  onChange={(e) => handleInputChange(`setup${num}Id`, e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                >
                  <option value="">Select setup {num}</option>
                  {setupTags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </Card>

        {/* Mistake Tags */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Mistake Tags</h2>
            <Link href="/settings/tags">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Manage Tags
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mistake {num}
                </label>
                <select
                  value={formData[`mistake${num}Id` as keyof typeof formData] as string}
                  onChange={(e) => handleInputChange(`mistake${num}Id`, e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
                >
                  <option value="">Select mistake {num}</option>
                  {mistakeTags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Link href={`/trades/${params.id}`}>
            <Button type="button" variant="outline">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Updating...' : 'Update Trade'}
          </Button>
        </div>
      </form>
    </div>
  );
}
