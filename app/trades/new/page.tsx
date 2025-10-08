"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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

export default function NewTradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [setupTags, setSetupTags] = useState<Tag[]>([]);
  const [mistakeTags, setMistakeTags] = useState<Tag[]>([]);
  
  const [formData, setFormData] = useState({
    ticker: '',
    size: '',
    openDate: new Date().toISOString().split('T')[0],
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
    fetchSources();
    fetchTags();
  }, []);

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
        openDate: new Date(formData.openDate),
        closeDate: formData.closeDate ? new Date(formData.closeDate) : undefined,
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

      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const trade = await response.json();
        router.push(`/trades/${trade.id}`);
      } else {
        const error = await response.json();
        alert(`Error creating trade: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating trade:', error);
      alert('Failed to create trade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/trades">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trades
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Trade</h1>
          <p className="text-gray-600 mt-1">Create a new trade entry</p>
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
          <Link href="/trades">
            <Button type="button" variant="outline">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Trade'}
          </Button>
        </div>
      </form>
    </div>
  );
}

