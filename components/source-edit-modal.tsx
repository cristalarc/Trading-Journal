"use client";

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface Source {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

interface SourceEditModalProps {
  source: Source | null;
  onClose: () => void;
  onSave: (sourceId: string | null, data: Partial<Source>) => Promise<void>;
  existingNames?: string[];
}

export function SourceEditModal({ source, onClose, onSave, existingNames = [] }: SourceEditModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: source?.name || '',
    description: source?.description || '',
    displayOrder: source?.displayOrder || 0,
    isActive: source?.isActive ?? true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(source ? source.id : null, formData);
      onClose();
    } catch (error) {
      console.error('Error saving source:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isDuplicate = !source && existingNames.some(
    n => n.trim().toLowerCase() === formData.name.trim().toLowerCase()
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{source ? 'Edit Source' : 'Add Source'}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-background"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-background"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="displayOrder" className="block text-sm font-medium mb-1">
              Display Order
            </label>
            <input
              type="number"
              id="displayOrder"
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-background"
              min="0"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="rounded border-gray-300"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Active
            </label>
          </div>

          {isDuplicate && (
            <div className="text-destructive text-sm">A source with this name already exists.</div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isDuplicate}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                source ? 'Save Changes' : 'Add Source'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
