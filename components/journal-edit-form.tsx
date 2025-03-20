"use client";

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTimeframes, usePatterns } from '@/lib/hooks/useConfig';
import { formatPrice } from '@/lib/utils';
import { createLogger } from '@/lib/logger';

const logger = createLogger('JournalEditForm');

interface JournalEditFormProps {
  entry: any;
  onClose: () => void;
  onSave: (entryId: string, data: any) => Promise<void>;
}

export function JournalEditForm({ entry, onClose, onSave }: JournalEditFormProps) {
  const { timeframes } = useTimeframes();
  const { patterns } = usePatterns();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    ticker: entry.ticker,
    price: String(entry.price),
    timeframeId: entry.timeframeId || '',
    patternId: entry.patternId || '',
    direction: entry.direction,
    sentiment: entry.sentiment,
    support: entry.support ? String(entry.support) : '',
    resistance: entry.resistance ? String(entry.resistance) : '',
    comments: entry.comments || '',
    isWeeklyOnePagerEligible: entry.isWeeklyOnePagerEligible || false
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
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onSave(entry.id, formData);
      onClose();
    } catch (error) {
      console.error('Error saving journal entry:', error);
      // Here you could add error handling UI feedback
    } finally {
      setIsSaving(false);
    }
  };

  // If the entry prop changes, update the form data
  useEffect(() => {
    setFormData({
      ticker: entry.ticker,
      price: String(entry.price),
      timeframeId: entry.timeframeId || '',
      patternId: entry.patternId || '',
      direction: entry.direction,
      sentiment: entry.sentiment,
      support: entry.support ? String(entry.support) : '',
      resistance: entry.resistance ? String(entry.resistance) : '',
      comments: entry.comments || '',
      isWeeklyOnePagerEligible: entry.isWeeklyOnePagerEligible || false
    });
  }, [entry]);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background p-6 rounded-lg shadow-lg border m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Edit Journal Entry</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close edit form"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="ticker" className="text-sm font-medium">Ticker</label>
              <input
                type="text"
                id="ticker"
                name="ticker"
                value={formData.ticker}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="price" className="text-sm font-medium">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="timeframeId" className="text-sm font-medium">Timeframe</label>
              <select
                id="timeframeId"
                name="timeframeId"
                value={formData.timeframeId}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">Select Timeframe</option>
                {timeframes.map(timeframe => (
                  <option key={timeframe.id} value={timeframe.id}>
                    {timeframe.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="patternId" className="text-sm font-medium">Pattern</label>
              <select
                id="patternId"
                name="patternId"
                value={formData.patternId}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">Select Pattern</option>
                {patterns.map(pattern => (
                  <option key={pattern.id} value={pattern.id}>
                    {pattern.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="direction" className="text-sm font-medium">Direction</label>
              <select
                id="direction"
                name="direction"
                value={formData.direction}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              >
                <option value="">Select Direction</option>
                <option value="Bullish">Bullish</option>
                <option value="Bearish">Bearish</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="sentiment" className="text-sm font-medium">Sentiment</label>
              <select
                id="sentiment"
                name="sentiment"
                value={formData.sentiment}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              >
                <option value="">Select Sentiment</option>
                <option value="Bullish">Bullish</option>
                <option value="Neutral">Neutral</option>
                <option value="Bearish">Bearish</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="support" className="text-sm font-medium">Support</label>
              <input
                type="number"
                id="support"
                name="support"
                step="0.01"
                value={formData.support}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="resistance" className="text-sm font-medium">Resistance</label>
              <input
                type="number"
                id="resistance"
                name="resistance"
                step="0.01"
                value={formData.resistance}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="comments" className="text-sm font-medium">Comments</label>
            <textarea
              id="comments"
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-md bg-background"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isWeeklyOnePagerEligible"
              name="isWeeklyOnePagerEligible"
              checked={formData.isWeeklyOnePagerEligible}
              onChange={handleChange}
              className="rounded border-gray-300"
            />
            <label htmlFor="isWeeklyOnePagerEligible" className="text-sm font-medium">
              Eligible for Weekly One Pager
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 