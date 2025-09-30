"use client";

import { useState } from 'react';
import { useStrategies, useSources } from '@/lib/hooks/useConfig';
import { Loader2, Trash2 } from 'lucide-react';
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { StrategyEditModal } from '@/components/strategy-edit-modal';

export default function StrategiesPage() {
  const { strategies, isLoading, refreshStrategies } = useStrategies();
  const { sources } = useSources();
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(strategies.map(strategy => strategy.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectStrategy = (strategyId: string) => {
    setSelectedIds(prev => 
      prev.includes(strategyId)
        ? prev.filter(id => id !== strategyId)
        : [...prev, strategyId]
    );
  };

  const handleDeleteSelected = async () => {
    setIsDeleting(true);
    try {
      const deletePromises = selectedIds.map(id =>
        fetch(`/api/config/strategies/${id}`, {
          method: 'DELETE',
        })
      );
      
      await Promise.all(deletePromises);
      await refreshStrategies();
      setSelectedIds([]);
      setSelectMode(false);
    } catch (error) {
      console.error('Error deleting strategies:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleEditStrategy = (strategy: any) => {
    setEditingStrategy(strategy);
  };

  const handleSaveStrategy = async (strategyId: string | null, data: any) => {
    try {
      if (!strategyId) return; // Only allow edit if strategyId is provided
      const response = await fetch(`/api/config/strategies/${strategyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update strategy');
      }

      await refreshStrategies();
    } catch (error) {
      console.error('Error updating strategy:', error);
      throw error;
    }
  };

  const handleAddStrategy = async (_: string | null, data: any) => {
    try {
      const response = await fetch("/api/config/strategies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create strategy");
      await refreshStrategies();
    } catch (error) {
      console.error("Error creating strategy:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center mb-2">
        <Link href="/settings" className="text-primary hover:underline flex items-center">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Settings
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Manage Strategies</h1>
        <div className="flex gap-2">
          {selectMode ? (
            <>
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={selectedIds.length === 0 || isDeleting}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete Selected ({selectedIds.length})
              </button>
              <button
                onClick={() => {
                  setSelectMode(false);
                  setSelectedIds([]);
                }}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setSelectMode(true)}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
              >
                Select Strategies
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Add Strategy
              </button>
            </>
          )}
        </div>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              {selectMode && (
                <th className="p-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === strategies.length && strategies.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Tag Value</th>
              <th className="text-left p-4">Sourcing</th>
              <th className="text-left p-4">Retro Period</th>
              <th className="text-left p-4">Status</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {strategies.map((strategy) => (
              <tr key={strategy.id} className="border-b">
                {selectMode && (
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(strategy.id)}
                      onChange={() => handleSelectStrategy(strategy.id)}
                    />
                  </td>
                )}
                <td className="p-4">{strategy.name}</td>
                <td className="p-4">{strategy.tagValue}</td>
                <td className="p-4">{strategy.sourcingValue || '-'}</td>
                <td className="p-4">{strategy.retrospectivePeriod ? `${strategy.retrospectivePeriod} days` : '-'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    strategy.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {strategy.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleEditStrategy(strategy)}
                    className="text-sm text-primary hover:underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-muted-foreground">
        Note: Strategies define your trading methodology and criteria for entry, exit, and risk management.
      </p>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Delete Strategies</h2>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete {selectedIds.length} selected strateg{selectedIds.length !== 1 ? 'ies' : 'y'}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingStrategy && (
        <StrategyEditModal
          strategy={editingStrategy}
          onClose={() => setEditingStrategy(null)}
          onSave={handleSaveStrategy}
          availableSources={sources.map(s => s.name)}
        />
      )}

      {showAddModal && (
        <StrategyEditModal
          strategy={null}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddStrategy}
          existingNames={strategies.map(s => s.name)}
          availableSources={sources.map(s => s.name)}
        />
      )}
    </div>
  );
}
