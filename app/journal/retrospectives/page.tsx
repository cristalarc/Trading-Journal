"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import { useJournalEntries } from "@/lib/hooks/useJournalEntries";
import { format } from "date-fns";
import { toast } from "sonner";

export default function RetrospectivesPage() {
  const { entries, refreshEntries } = useJournalEntries();
  const [selectedOutcomes, setSelectedOutcomes] = useState<Record<string, { type: '7d' | '30d', outcome: 'win' | 'loss' }>>({});

  // Filter entries that need retrospectives
  const overdueEntries = entries.filter(entry => {
    const entryDate = new Date(entry.entryDate);
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const needs7DRetro = entryDate <= sevenDaysAgo && entry.retro7DStatus === 'overdue';
    const needs30DRetro = entryDate <= thirtyDaysAgo && entry.retro30DStatus === 'overdue';

    return needs7DRetro || needs30DRetro;
  });

  const handleOutcomeSelect = async (entryId: string, type: '7d' | '30d', outcome: 'win' | 'loss') => {
    try {
      const response = await fetch(`/api/journal/${entryId}/retrospective`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          status: 'completed',
          outcome,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update retrospective');
      }

      // Update local state
      setSelectedOutcomes(prev => ({
        ...prev,
        [entryId]: { type, outcome }
      }));

      // Refresh entries to get updated data
      await refreshEntries();
      toast.success('Retrospective completed!');
    } catch (error) {
      console.error('Error updating retrospective:', error);
      toast.error('Failed to update retrospective.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Link 
          href="/journal" 
          className="text-primary hover:underline mr-4 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Journal
        </Link>
        <h1 className="text-2xl font-bold">Complete Retrospectives</h1>
      </div>
      
      <div className="bg-card p-6 rounded-lg shadow-sm border mb-6">
        <p className="mb-4">
          Retrospectives help you learn from your past trades. Please review each trade and mark whether your analysis was correct.
        </p>
        
        <div className="space-y-6">
          {overdueEntries.map((entry) => {
            const entryDate = new Date(entry.entryDate);
            const now = new Date();
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            const needs7DRetro = entryDate <= sevenDaysAgo && entry.retro7DStatus === 'overdue';
            const needs30DRetro = entryDate <= thirtyDaysAgo && entry.retro30DStatus === 'overdue';

            return (
              <div key={entry.id} className="border-b pb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{entry.ticker}</h2>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(entry.entryDate), 'MMM d, yyyy')} • {entry.timeframe?.name} • Entry
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium">${entry.price}</p>
                    <span className={`inline-block px-2 py-1 text-sm rounded-full ${
                      entry.direction === 'Bullish' 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {entry.direction}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">Pattern</p>
                  <p>{entry.pattern?.name}</p>
                </div>
                
                <div className="space-y-4">
                  {needs7DRetro && (
                    <div>
                      <p className="text-sm font-medium mb-2">7-Day Retrospective</p>
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleOutcomeSelect(entry.id, '7d', 'win')}
                          className={`flex items-center px-3 py-2 rounded-md ${
                            selectedOutcomes[entry.id]?.type === '7d' && selectedOutcomes[entry.id]?.outcome === 'win'
                              ? "bg-green-100 text-green-800 border border-green-300"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Win
                        </button>
                        <button 
                          onClick={() => handleOutcomeSelect(entry.id, '7d', 'loss')}
                          className={`flex items-center px-3 py-2 rounded-md ${
                            selectedOutcomes[entry.id]?.type === '7d' && selectedOutcomes[entry.id]?.outcome === 'loss'
                              ? "bg-red-100 text-red-800 border border-red-300"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Loss
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {needs30DRetro && (
                    <div>
                      <p className="text-sm font-medium mb-2">30-Day Retrospective</p>
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleOutcomeSelect(entry.id, '30d', 'win')}
                          className={`flex items-center px-3 py-2 rounded-md ${
                            selectedOutcomes[entry.id]?.type === '30d' && selectedOutcomes[entry.id]?.outcome === 'win'
                              ? "bg-green-100 text-green-800 border border-green-300"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Win
                        </button>
                        <button 
                          onClick={() => handleOutcomeSelect(entry.id, '30d', 'loss')}
                          className={`flex items-center px-3 py-2 rounded-md ${
                            selectedOutcomes[entry.id]?.type === '30d' && selectedOutcomes[entry.id]?.outcome === 'loss'
                              ? "bg-red-100 text-red-800 border border-red-300"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Loss
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 