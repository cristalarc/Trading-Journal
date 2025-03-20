"use client";

import { useState } from 'react';
import { usePatterns } from '@/lib/hooks/useConfig';
import { Loader2 } from 'lucide-react';

export default function PatternsPage() {
  const { patterns, isLoading } = usePatterns();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Manage Patterns</h1>
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Add Pattern
        </button>
      </div>

      <div className="border rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Description</th>
              <th className="text-left p-4">Display Order</th>
              <th className="text-left p-4">Status</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patterns.map((pattern) => (
              <tr key={pattern.id} className="border-b">
                <td className="p-4">{pattern.name}</td>
                <td className="p-4">{pattern.description || '-'}</td>
                <td className="p-4">{pattern.displayOrder}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    pattern.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {pattern.isActive ? 'Active' : 'Inactive'}
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
        Note: Patterns are used to identify and categorize trading setups in your journal entries.
      </p>
    </div>
  );
} 