"use client";

import { useState } from 'react';
import { useTimeframes } from '@/lib/hooks/useConfig';
import { Loader2 } from 'lucide-react';
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function TimeframesPage() {
  const { timeframes, isLoading } = useTimeframes();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center mb-2">
        <Link href="/settings" className="text-primary hover:underline flex items-center">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Settings
        </Link>
      </div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Manage Timeframes</h1>
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Add Timeframe
        </button>
      </div>

      <div className="border rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Display Order</th>
              <th className="text-left p-4">Status</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {timeframes.map((timeframe) => (
              <tr key={timeframe.id} className="border-b">
                <td className="p-4">{timeframe.name}</td>
                <td className="p-4">{timeframe.displayOrder}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    timeframe.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {timeframe.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-sm text-primary hover:underline">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-muted-foreground">
        Note: Timeframes are used to categorize your journal entries based on the trading timeframe.
      </p>
    </div>
  );
} 