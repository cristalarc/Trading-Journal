/**
 * Hook for fetching configuration data (timeframes, patterns, tooltips)
 */

import { useState, useEffect, useCallback } from 'react';

// Define types based on our Prisma schema
export type Timeframe = {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
};

export type Pattern = {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
};

export type Tooltip = {
  text: string;
  maxLength: number;
};

export type TooltipMap = Record<string, Tooltip>;

export type Source = {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
};

export type Strategy = {
  id: string;
  name: string;
  tagValue: string;
  sourcingValues?: string[];
  recordingSystem?: string;
  enterCriteria?: string;
  earlyEntryCriteria?: string;
  exitCriteria?: string;
  confirmationCriteria?: string;
  qualityConsiderations?: string;
  qualityCriteria?: string;
  kaizen?: string;
  executionReviewCriteria?: string;
  retrospectivePeriod?: number;
  taggingSystem?: string;
  displayOrder: number;
  isActive: boolean;
};

export type Tag = {
  id: string;
  name: string;
  category: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
};

export function useTimeframes() {
  const [timeframes, setTimeframes] = useState<Timeframe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchTimeframes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/config/timeframes');
      
      if (!response.ok) {
        throw new Error('Failed to fetch timeframes');
      }
      
      const data = await response.json();
      setTimeframes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching timeframes:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchTimeframes();
  }, [fetchTimeframes]);
  
  return {
    timeframes,
    isLoading,
    error,
    refreshTimeframes: fetchTimeframes
  };
}

export function usePatterns() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchPatterns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/config/patterns');
      
      if (!response.ok) {
        throw new Error('Failed to fetch patterns');
      }
      
      const data = await response.json();
      setPatterns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching patterns:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchPatterns();
  }, [fetchPatterns]);
  
  return {
    patterns,
    isLoading,
    error,
    refreshPatterns: fetchPatterns
  };
}

export function useTooltips() {
  const [tooltips, setTooltips] = useState<TooltipMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchTooltips = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/config/tooltips');
      
      if (!response.ok) {
        throw new Error('Failed to fetch tooltips');
      }
      
      const data = await response.json();
      setTooltips(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching tooltips:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchTooltips();
  }, [fetchTooltips]);
  
  return {
    tooltips,
    isLoading,
    error,
    refreshTooltips: fetchTooltips
  };
}

export function useSources() {
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchSources = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/config/sources');
      
      if (!response.ok) {
        throw new Error('Failed to fetch sources');
      }
      
      const data = await response.json();
      setSources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching sources:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchSources();
  }, [fetchSources]);
  
  return {
    sources,
    isLoading,
    error,
    refreshSources: fetchSources
  };
}

export function useStrategies() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchStrategies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/config/strategies');
      
      if (!response.ok) {
        throw new Error('Failed to fetch strategies');
      }
      
      const data = await response.json();
      setStrategies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching strategies:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchStrategies();
  }, [fetchStrategies]);
  
  return {
    strategies,
    isLoading,
    error,
    refreshStrategies: fetchStrategies
  };
}

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/config/tags');
      
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      
      const data = await response.json();
      setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching tags:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);
  
  return {
    tags,
    isLoading,
    error,
    refreshTags: fetchTags
  };
} 