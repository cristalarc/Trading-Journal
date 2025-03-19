"use client";

import Link from "next/link";
import { useState } from "react";
import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTimeframes, usePatterns } from "@/lib/hooks/useConfig";
import { createLogger } from "@/lib/logger";
import { ChangeEvent, FormEvent } from "react";

const logger = createLogger('NewJournalEntryPage');

export default function NewJournalEntryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    entryDate: new Date().toISOString().split('T')[0], // Default to current date
    ticker: '',
    price: '',
    timeframeId: '',
    direction: 'Bullish', // Default value
    sentiment: 'Neutral', // Default value
    patternId: '',
    support: '',
    resistance: '',
    comments: '',
    isWeeklyOnePagerEligible: false
  });

  // Fetch timeframes and patterns
  const { timeframes, isLoading: timeframesLoading } = useTimeframes();
  const { patterns, isLoading: patternsLoading } = usePatterns();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      logger.info('Submitting new journal entry', formData);
      
      // Format data for API with better validation
      const apiData = {
        ...formData,
        // Ensure price is a valid number
        price: formData.price 
          ? parseFloat(formData.price) 
          : undefined,
        
        // Ensure optional numeric fields are properly handled
        support: formData.support && formData.support !== '' 
          ? parseFloat(formData.support) 
          : undefined,
        
        resistance: formData.resistance && formData.resistance !== '' 
          ? parseFloat(formData.resistance) 
          : undefined,
        
        // Ensure entryDate is properly formatted for database
        entryDate: formData.entryDate 
          ? new Date(`${formData.entryDate}T12:00:00Z`).toISOString() 
          : undefined,
        
        // Ensure boolean fields are properly typed
        isWeeklyOnePagerEligible: Boolean(formData.isWeeklyOnePagerEligible),
        
        // Only include timeframeId if selected
        timeframeId: formData.timeframeId && formData.timeframeId !== '' 
          ? formData.timeframeId 
          : undefined,
        
        // Only include patternId if selected
        patternId: formData.patternId && formData.patternId !== '' 
          ? formData.patternId 
          : undefined
      };
      
      console.log('Sending data to server:', apiData);
      
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });
      
      // Handle response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        if (!response.ok) {
          const detailedMessage = data.details || data.error || 'Unknown error';
          throw new Error(detailedMessage);
        }
        
        logger.info('Journal entry created successfully', data);
      } else {
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
      }
      
      // Navigate back to journal page
      router.push('/journal');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error('Error creating journal entry', { error: errorMessage });
      alert(`Error creating journal entry: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = timeframesLoading || patternsLoading;

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-8">
        <Link 
          href="/journal" 
          className="text-primary hover:underline mr-4"
        >
          ← Back to Journal
        </Link>
        <h1 className="text-3xl font-bold">New Journal Entry</h1>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      ) : (
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Date Field */}
            <div className="space-y-2">
              <label htmlFor="entryDate" className="text-sm font-medium">
                Entry Date
              </label>
              <div className="relative">
                <input
                  id="entryDate"
                  name="entryDate"
                  type="date"
                  value={formData.entryDate}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md bg-background pr-10"
                  required
                />
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            {/* Ticker and Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="ticker" className="text-sm font-medium">
                  Ticker Symbol
                </label>
                <input
                  id="ticker"
                  name="ticker"
                  type="text"
                  value={formData.ticker}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md bg-background"
                  placeholder="e.g. AAPL"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium">
                  Current Price
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md bg-background"
                  placeholder="e.g. 150.25"
                  required
                />
              </div>
            </div>
            
            {/* Timeframe, Direction, and Sentiment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="timeframeId" className="text-sm font-medium">
                  Timeframe
                </label>
                <select
                  id="timeframeId"
                  name="timeframeId"
                  value={formData.timeframeId}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  <option value="">Select Timeframe</option>
                  {timeframes.map(timeframe => (
                    <option key={timeframe.id} value={timeframe.id}>
                      {timeframe.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="direction" className="text-sm font-medium">
                  Direction
                </label>
                <select
                  id="direction"
                  name="direction"
                  value={formData.direction}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md bg-background"
                  required
                >
                  <option value="Bullish">Bullish</option>
                  <option value="Bearish">Bearish</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="sentiment" className="text-sm font-medium">
                  Sentiment
                </label>
                <select
                  id="sentiment"
                  name="sentiment"
                  value={formData.sentiment}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md bg-background"
                  required
                >
                  <option value="Bullish">Bullish</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Bearish">Bearish</option>
                </select>
              </div>
            </div>
            
            {/* Pattern */}
            <div className="space-y-2">
              <label htmlFor="patternId" className="text-sm font-medium">
                Governing Pattern
              </label>
              <select
                id="patternId"
                name="patternId"
                value={formData.patternId}
                onChange={handleChange}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="">Select Pattern</option>
                {patterns.map(pattern => (
                  <option key={pattern.id} value={pattern.id}>
                    {pattern.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Support and Resistance Levels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="support" className="text-sm font-medium">
                  Key Support Level
                </label>
                <input
                  id="support"
                  name="support"
                  type="number"
                  step="0.01"
                  value={formData.support}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md bg-background"
                  placeholder="e.g. 145.50"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="resistance" className="text-sm font-medium">
                  Key Resistance Level
                </label>
                <input
                  id="resistance"
                  name="resistance"
                  type="number"
                  step="0.01"
                  value={formData.resistance}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md bg-background"
                  placeholder="e.g. 155.75"
                />
              </div>
            </div>
            
            {/* Comments */}
            <div className="space-y-2">
              <label htmlFor="comments" className="text-sm font-medium">
                Comments
              </label>
              <textarea
                id="comments"
                name="comments"
                rows={4}
                value={formData.comments}
                onChange={handleChange}
                className="w-full p-2 border rounded-md bg-background"
                placeholder="Enter your analysis and thoughts..."
              ></textarea>
            </div>
            
            {/* Toggle Options */}
            <div className="flex items-center space-x-2">
              <input
                id="isWeeklyOnePagerEligible"
                name="isWeeklyOnePagerEligible"
                type="checkbox"
                checked={formData.isWeeklyOnePagerEligible}
                onChange={handleChange}
                className="rounded"
              />
              <label htmlFor="isWeeklyOnePagerEligible" className="text-sm font-medium">
                Include in Weekly One Pager
              </label>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/journal')}
                className="px-4 py-2 border rounded-md hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Journal Entry'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 