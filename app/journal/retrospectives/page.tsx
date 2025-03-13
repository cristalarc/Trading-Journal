"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Check, X } from "lucide-react";

export default function RetrospectivesPage() {
  const [selectedOutcomes, setSelectedOutcomes] = useState<Record<string, string>>({});
  
  // Mock data for demonstration
  const overdueEntries = [
    {
      id: "3",
      date: "2023-06-13",
      ticker: "TSLA",
      price: "$750.50",
      timeframe: "Hourly",
      direction: "bullish",
      pattern: "Flag",
      retrospectiveType: "7D",
      dueDate: "2023-06-20",
    },
    {
      id: "4",
      date: "2023-06-10",
      ticker: "AMZN",
      price: "$130.25",
      timeframe: "Daily",
      direction: "bearish",
      pattern: "Double Top",
      retrospectiveType: "30D",
      dueDate: "2023-07-10",
    },
  ];

  const handleOutcomeSelect = (entryId: string, outcome: string) => {
    setSelectedOutcomes(prev => ({
      ...prev,
      [entryId]: outcome
    }));
  };

  const handleSubmit = () => {
    // In a real app, this would save the retrospective outcomes
    console.log("Saving retrospectives:", selectedOutcomes);
    // Then redirect back to journal
    window.history.back();
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
          {overdueEntries.map((entry) => (
            <div key={entry.id} className="border-b pb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{entry.ticker}</h2>
                  <p className="text-sm text-muted-foreground">
                    {entry.date} • {entry.timeframe} • {entry.retrospectiveType} Retrospective
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-medium">{entry.price}</p>
                  <span className={`inline-block px-2 py-1 text-sm rounded-full ${
                    entry.direction === "bullish" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {entry.direction}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">Pattern</p>
                <p>{entry.pattern}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Was your analysis correct?</p>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => handleOutcomeSelect(entry.id, "win")}
                    className={`flex items-center px-3 py-2 rounded-md ${
                      selectedOutcomes[entry.id] === "win"
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Win
                  </button>
                  <button 
                    onClick={() => handleOutcomeSelect(entry.id, "lose")}
                    className={`flex items-center px-3 py-2 rounded-md ${
                      selectedOutcomes[entry.id] === "lose"
                        ? "bg-red-100 text-red-800 border border-red-300"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Lose
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={Object.keys(selectedOutcomes).length !== overdueEntries.length}
            className={`px-4 py-2 rounded-md ${
              Object.keys(selectedOutcomes).length === overdueEntries.length
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            Save Retrospectives
          </button>
        </div>
      </div>
    </div>
  );
} 