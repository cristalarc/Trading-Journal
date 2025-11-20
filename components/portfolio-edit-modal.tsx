"use client";

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface Portfolio {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
}

interface PortfolioEditModalProps {
  portfolio: Portfolio | null;
  onClose: () => void;
  onSave: (portfolioId: string | null, data: any) => Promise<void>;
}

export function PortfolioEditModal({ portfolio, onClose, onSave }: PortfolioEditModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (portfolio) {
      setName(portfolio.name);
      setDescription(portfolio.description || '');
      setIsDefault(portfolio.isDefault);
    } else {
      setName('');
      setDescription('');
      setIsDefault(false);
    }
  }, [portfolio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Portfolio name is required');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(portfolio?.id || null, {
        name: name.trim(),
        description: description.trim() || null,
        isDefault,
      });
      onClose();
    } catch (err) {
      setError('Failed to save portfolio. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {portfolio ? 'Edit Portfolio' : 'Add Portfolio'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Portfolio Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              placeholder="e.g., Swing Trading, Day Trading"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            />
            <label htmlFor="isDefault" className="text-sm text-gray-700 dark:text-gray-300">
              Set as default portfolio
            </label>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {portfolio ? 'Save Changes' : 'Create Portfolio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
