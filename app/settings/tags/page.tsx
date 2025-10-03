"use client";

import { useState } from 'react';
import { useTags } from '@/lib/hooks/useConfig';
import { Loader2, Trash2 } from 'lucide-react';
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TagEditModal } from '@/components/tag-edit-modal';

export default function TagsPage() {
  const { tags, isLoading, refreshTags } = useTags();
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
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
      setSelectedIds(tags.map(tag => tag.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectTag = (tagId: string) => {
    setSelectedIds(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleDeleteSelected = async () => {
    setIsDeleting(true);
    try {
      const deletePromises = selectedIds.map(id =>
        fetch(`/api/config/tags/${id}`, {
          method: 'DELETE',
        })
      );
      
      await Promise.all(deletePromises);
      await refreshTags();
      setSelectedIds([]);
      setSelectMode(false);
    } catch (error) {
      console.error('Error deleting tags:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleEditTag = (tag: any) => {
    setEditingTag(tag);
  };

  const handleSaveTag = async (tagId: string | null, data: any) => {
    try {
      if (!tagId) return; // Only allow edit if tagId is provided
      const response = await fetch(`/api/config/tags/${tagId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update tag');
      }

      await refreshTags();
    } catch (error) {
      console.error('Error updating tag:', error);
      throw error;
    }
  };

  const handleAddTag = async (_: string | null, data: any) => {
    try {
      const response = await fetch("/api/config/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create tag");
      await refreshTags();
    } catch (error) {
      console.error("Error creating tag:", error);
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
        <h1 className="text-2xl font-semibold">Manage Tags</h1>
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
                Select Tags
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Add Tag
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
                    checked={selectedIds.length === tags.length && tags.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Category</th>
              <th className="text-left p-4">Description</th>
              <th className="text-left p-4">Display Order</th>
              <th className="text-left p-4">Status</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr key={tag.id} className="border-b">
                {selectMode && (
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(tag.id)}
                      onChange={() => handleSelectTag(tag.id)}
                    />
                  </td>
                )}
                <td className="p-4">{tag.name}</td>
                <td className="p-4">{tag.category}</td>
                <td className="p-4">{tag.description || '-'}</td>
                <td className="p-4">{tag.displayOrder}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    tag.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tag.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleEditTag(tag)}
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
        Note: Tags are text descriptors that will be attached to trades when developing the Trade Log. They help categorize and organize trading activities.
      </p>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Delete Tags</h2>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete {selectedIds.length} selected tag{selectedIds.length !== 1 ? 's' : ''}? This action cannot be undone.
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

      {editingTag && (
        <TagEditModal
          tag={editingTag}
          onClose={() => setEditingTag(null)}
          onSave={handleSaveTag}
        />
      )}

      {showAddModal && (
        <TagEditModal
          tag={null}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddTag}
          existingNames={tags.map(t => t.name)}
        />
      )}
    </div>
  );
}
