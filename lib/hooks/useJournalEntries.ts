/**
 * Hook for fetching and managing journal entries
 */

import { useState, useEffect, useCallback } from 'react';

// Define types based on our Prisma schema
export type JournalEntry = {
  id: string;
  entryDate: string | Date;
  ticker: string;
  price: number;
  timeframe?: {
    id: string;
    name: string;
  };
  timeframeId?: string;
  direction: 'Bullish' | 'Bearish';
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  pattern?: {
    id: string;
    name: string;
  };
  patternId?: string;
  support?: number;
  resistance?: number;
  comments?: string;
  isWeeklyOnePagerEligible: boolean;
  retro7DStatus: 'pending' | 'completed' | 'overdue';
  retro7DCompletedAt?: string | Date;
  retro7DOutcome?: 'win' | 'loss';
  retro7DNotes?: string;
  retro30DStatus: 'pending' | 'completed' | 'overdue';
  retro30DCompletedAt?: string | Date;
  retro30DOutcome?: 'win' | 'loss';
  retro30DNotes?: string;
};

export type JournalEntryFilters = {
  timeframeId?: string;
  patternId?: string;
  ticker?: string;
  direction?: 'Bullish' | 'Bearish';
  sentiment?: 'Bullish' | 'Neutral' | 'Bearish';
};

export function useJournalEntries(initialFilters?: JournalEntryFilters) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JournalEntryFilters>(initialFilters || {});
  
  // Function to fetch entries with current filters
  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      
      if (filters.timeframeId) {
        queryParams.append('timeframeId', filters.timeframeId);
      }
      
      if (filters.patternId) {
        queryParams.append('patternId', filters.patternId);
      }
      
      if (filters.ticker) {
        queryParams.append('ticker', filters.ticker);
      }
      
      if (filters.direction) {
        queryParams.append('direction', filters.direction);
      }
      
      if (filters.sentiment) {
        queryParams.append('sentiment', filters.sentiment);
      }
      
      // Add a timestamp to prevent caching
      queryParams.append('_t', Date.now().toString());
      
      // Fetch entries from API
      console.log('Fetching journal entries with filters:', filters);
      const response = await fetch(`/api/journal?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch journal entries');
      }
      
      const data = await response.json();
      console.log('Fetched journal entries:', data);
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching journal entries:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);
  
  // Fetch entries when filters change
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);
  
  // Function to update filters
  const updateFilters = useCallback((newFilters: Partial<JournalEntryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  // Function to reset filters
  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);
  
  // Function to create a new entry
  const createEntry = useCallback(async (entryData: Omit<JournalEntry, 'id'>) => {
    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create journal entry');
      }
      
      const newEntry = await response.json();
      
      // Refresh entries to include the new one
      fetchEntries();
      
      return newEntry;
    } catch (err) {
      console.error('Error creating journal entry:', err);
      throw err;
    }
  }, [fetchEntries]);
  
  // Function to update an entry
  const updateEntry = useCallback(async (id: string, entryData: Partial<JournalEntry>) => {
    try {
      const response = await fetch(`/api/journal/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update journal entry');
      }
      
      const updatedEntry = await response.json();
      
      // Update the entry in the local state
      setEntries(prev => 
        prev.map(entry => 
          entry.id === id ? { ...entry, ...updatedEntry } : entry
        )
      );
      
      return updatedEntry;
    } catch (err) {
      console.error('Error updating journal entry:', err);
      throw err;
    }
  }, []);
  
  // Function to delete an entry
  const deleteEntry = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/journal/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete journal entry');
      }
      
      // Remove the entry from the local state
      setEntries(prev => prev.filter(entry => entry.id !== id));
      
      return true;
    } catch (err) {
      console.error('Error deleting journal entry:', err);
      throw err;
    }
  }, []);
  
  // Function to get overdue retrospectives count
  const getOverdueRetrospectivesCount = useCallback(() => {
    return entries.reduce((count, entry) => {
      if (entry.retro7DStatus === 'overdue') count++;
      if (entry.retro30DStatus === 'overdue') count++;
      return count;
    }, 0);
  }, [entries]);
  
  return {
    entries,
    isLoading,
    error,
    filters,
    updateFilters,
    resetFilters,
    createEntry,
    updateEntry,
    deleteEntry,
    getOverdueRetrospectivesCount,
    refreshEntries: fetchEntries
  };
} 