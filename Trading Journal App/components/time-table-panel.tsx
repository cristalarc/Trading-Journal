"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface TimeTablePanelProps {
  entryId: string;
  onClose: () => void;
}

export function TimeTablePanel({ entryId, onClose }: TimeTablePanelProps) {
  // Mock data for demonstration
  const timeTableData = {
    ticker: "AAPL",
    date: "2023-06-15",
    price: "$150.25",
    timeframes: [
      { 
        name: "Daily", 
        support: "$145.50", 
        resistance: "$155.75",
        notes: "Strong support at $145.50 with increasing volume"
      },
      { 
        name: "Weekly", 
        support: "$142.00", 
        resistance: "$160.00",
        notes: "Weekly uptrend intact, watch for resistance at $160"
      },
      { 
        name: "Monthly", 
        support: "$135.00", 
        resistance: "$165.00",
        notes: "Long-term bullish trend, major support at $135"
      }
    ]
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold">{timeTableData.ticker} Time Table</h2>
          <p className="text-sm text-muted-foreground">{timeTableData.date} • {timeTableData.price}</p>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          {timeTableData.timeframes.map((timeframe, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">{timeframe.name} Timeframe</h3>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">Support</p>
                  <p className="font-medium">{timeframe.support}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resistance</p>
                  <p className="font-medium">{timeframe.resistance}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p>{timeframe.notes}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t">
        <button
          className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90"
        >
          Add Timeframe Analysis
        </button>
      </div>
    </div>
  );
} 