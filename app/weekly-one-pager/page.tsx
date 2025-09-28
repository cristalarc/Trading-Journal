"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Calendar, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface WeeklyOnePagerEntry {
  id: string;
  entryDate: string;
  ticker: string;
  comments: string | null;
  support: number | null;
  resistance: number | null;
  gamePlan: string | null;
  direction: 'Bullish' | 'Bearish';
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  timeframe?: {
    name: string;
  };
  pattern?: {
    name: string;
  };
}

export default function WeeklyOnePagerPage() {
  const [entries, setEntries] = useState<WeeklyOnePagerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [originalGamePlans, setOriginalGamePlans] = useState<Record<string, string>>({});
  const [showClearModal, setShowClearModal] = useState(false);
  const saveTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  // Fetch Weekly One Pager entries
  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/weekly-one-pager');
      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }
      const data = await response.json();
      setEntries(data);
      
      // Store original game plans for comparison
      const originalPlans: Record<string, string> = {};
      data.forEach((entry: WeeklyOnePagerEntry) => {
        originalPlans[entry.id] = entry.gamePlan || '';
      });
      setOriginalGamePlans(originalPlans);
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast.error('Failed to load Weekly One Pager entries');
    } finally {
      setLoading(false);
    }
  };

  // Update game plan for an entry with debouncing
  const updateGamePlan = async (id: string, gamePlan: string) => {
    // Clear any existing timeout for this entry
    if (saveTimeouts.current[id]) {
      clearTimeout(saveTimeouts.current[id]);
    }
    
    // Set a new timeout to save after 1 second of inactivity
    saveTimeouts.current[id] = setTimeout(async () => {
      setUpdating(id);
      try {
        const response = await fetch('/api/weekly-one-pager', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, gamePlan }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update game plan');
        }
        
        // Update original game plans to reflect the saved state
        setOriginalGamePlans(prev => ({
          ...prev,
          [id]: gamePlan
        }));
        
        toast.success('Game plan saved');
      } catch (error) {
        console.error('Error updating game plan:', error);
        toast.error('Failed to save game plan');
      } finally {
        setUpdating(null);
      }
    }, 1000);
  };

  // Remove entry from Weekly One Pager
  const removeEntry = async (id: string) => {
    setUpdating(id);
    try {
      const response = await fetch('/api/weekly-one-pager', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, isWeeklyOnePagerEligible: false }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove entry');
      }
      
      // Remove from local state
      setEntries(prev => prev.filter(entry => entry.id !== id));
      
      toast.success('Entry removed from Weekly One Pager');
    } catch (error) {
      console.error('Error removing entry:', error);
      toast.error('Failed to remove entry');
    } finally {
      setUpdating(null);
    }
  };

  // Clear all entries
  const clearAllEntries = async () => {
    setShowClearModal(false);
    
    try {
      const response = await fetch('/api/weekly-one-pager', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear entries');
      }
      
      setEntries([]);
      toast.success('All entries cleared from Weekly One Pager');
    } catch (error) {
      console.error('Error clearing entries:', error);
      toast.error('Failed to clear entries');
    }
  };

  useEffect(() => {
    fetchEntries();
    
    // Cleanup timeouts on unmount
    return () => {
      Object.values(saveTimeouts.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showClearModal) {
        setShowClearModal(false);
      }
    };

    if (showClearModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showClearModal]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDirectionIcon = (direction: 'Bullish' | 'Bearish') => {
    return direction === 'Bullish' ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getDirectionColor = (direction: 'Bullish' | 'Bearish') => {
    return direction === 'Bullish' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getSentimentColor = (sentiment: 'Bullish' | 'Neutral' | 'Bearish') => {
    switch (sentiment) {
      case 'Bullish': return 'bg-green-100 text-green-800';
      case 'Bearish': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading Weekly One Pager...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Weekly One Pager</h1>
          <p className="text-gray-600 mt-2">
            Quick summary of entries to prioritize for the week
          </p>
        </div>
        {entries.length > 0 && (
          <Button 
            onClick={() => setShowClearModal(true)}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear All Entries
          </Button>
        )}
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No entries in Weekly One Pager
              </h3>
              <p className="text-gray-600 mb-4">
                Mark entries as "Eligible for Weekly One Pager" in the Journal to see them here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {entries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getDirectionIcon(entry.direction)}
                      <span className="font-bold text-lg">{entry.ticker}</span>
                    </div>
                    <Badge className={getDirectionColor(entry.direction)}>
                      {entry.direction}
                    </Badge>
                    <Badge className={getSentimentColor(entry.sentiment)}>
                      {entry.sentiment}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {formatDate(entry.entryDate)}
                  </div>
                </div>
                {entry.timeframe && (
                  <div className="text-sm text-gray-600">
                    Timeframe: {entry.timeframe.name}
                    {entry.pattern && ` • Pattern: ${entry.pattern.name}`}
                  </div>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Entry Details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Comments</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                        {entry.comments || 'No comments'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Support Level</h4>
                        <p className="text-lg font-mono bg-green-50 p-2 rounded text-green-800">
                          {entry.support ? `$${entry.support}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Resistance Level</h4>
                        <p className="text-lg font-mono bg-red-50 p-2 rounded text-red-800">
                          {entry.resistance ? `$${entry.resistance}` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column - Game Plan */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">Game Plan</h4>
                      {updating === entry.id && (
                        <div className="flex items-center gap-1 text-sm text-blue-600">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Saving...</span>
                        </div>
                      )}
                    </div>
                    <Textarea
                      value={entry.gamePlan || ''}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        
                        // Update local state immediately for better UX
                        setEntries(prev => prev.map(prevEntry => 
                          prevEntry.id === entry.id ? { ...prevEntry, gamePlan: newValue } : prevEntry
                        ));
                        
                        // Trigger debounced save
                        updateGamePlan(entry.id, newValue);
                      }}
                      placeholder="Write your game plan for this trade..."
                      className="min-h-[120px] resize-none"
                      disabled={updating === entry.id}
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeEntry(entry.id)}
                        disabled={updating === entry.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove from Weekly One Pager
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Custom Clear All Confirmation Modal */}
      {showClearModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowClearModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Clear All Entries</h2>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to remove all {entries.length} entr{entries.length === 1 ? 'y' : 'ies'} from the Weekly One Pager? 
              This will also clear all game plans associated with these entries.
            </p>
            
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setShowClearModal(false)}
                variant="outline"
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={clearAllEntries}
                variant="destructive"
                className="px-4 py-2 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear All Entries
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
