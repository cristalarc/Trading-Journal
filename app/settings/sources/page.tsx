"use client";

import { useState } from 'react';
import { useSources } from '@/lib/hooks/useConfig';
import { Loader2, Trash2 } from 'lucide-react';
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SourceEditModal } from '@/components/source-edit-modal';

export default function SourcesPage() {
  const { sources, isLoading, refreshSources } = useSources();
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingSource, setEditingSource] = useState<any>(null);
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
      setSelectedIds(sources.map(source => source.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectSource = (sourceId: string) => {
    setSelectedIds(prev => 
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleDeleteSelected = async () => {
    setIsDeleting(true);
    try {
      const deletePromises = selectedIds.map(id =>
        fetch(`/api/config/sources/${id}`, {
          method: 'DELETE',
        })
      );
      
      await Promise.all(deletePromises);
      await refreshSources();
      setSelectedIds([]);
      setSelectMode(false);
    } catch (error) {
      console.error('Error deleting sources:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleEditSource = (source: any) => {
    setEditingSource(source);
  };

  const handleSaveSource = async (sourceId: string | null, data: any) => {
    try {
      if (!sourceId) return; // Only allow edit if sourceId is provided
      const response = await fetch(`/api/config/sources/${sourceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update source');
      }

      await refreshSources();
    } catch (error) {
      console.error('Error updating source:', error);
      throw error;
    }
  };

  const handleAddSource = async (_: string | null, data: any) => {
    try {
      const response = await fetch("/api/config/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create source");
      await refreshSources();
    } catch (error) {
      console.error("Error creating source:", error);
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
        <h1 className="text-2xl font-semibold">Manage Sources</h1>
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
                Select Sources
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Add Source
              </button>
            </>
          )}
        </div>
      </div>

      <div className="border rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              {selectMode && (
                <th className="p-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === sources.length && sources.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Description</th>
              <th className="text-left p-4">Display Order</th>
              <th className="text-left p-4">Status</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr key={source.id} className="border-b">
                {selectMode && (
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(source.id)}
                      onChange={() => handleSelectSource(source.id)}
                    />
                  </td>
                )}
                <td className="p-4">{source.name}</td>
                <td className="p-4">{source.description || '-'}</td>
                <td className="p-4">{source.displayOrder}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    source.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {source.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleEditSource(source)}
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
        Note: Sources are used to identify where trading ideas originate from (e.g., Twitter, Journal, etc.).
      </p>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Delete Sources</h2>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete {selectedIds.length} selected source{selectedIds.length !== 1 ? 's' : ''}? This action cannot be undone.
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

      {editingSource && (
        <SourceEditModal
          source={editingSource}
          onClose={() => setEditingSource(null)}
          onSave={handleSaveSource}
        />
      )}

      {showAddModal && (
        <SourceEditModal
          source={null}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddSource}
          existingNames={sources.map(s => s.name)}
        />
      )}
    </div>
  );
}
