"use client";

import { useState, useEffect } from 'react';
import { Loader2, Trash2, Star } from 'lucide-react';
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PortfolioEditModal } from '@/components/portfolio-edit-modal';

interface Portfolio {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  isArchived: boolean;
  _count?: {
    trades: number;
  };
}

export default function PortfoliosPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');

  const fetchPortfolios = async () => {
    try {
      const response = await fetch(`/api/portfolios?includeArchived=${includeArchived}`);
      const data = await response.json();
      setPortfolios(data);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, [includeArchived]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // Don't allow selecting the default portfolio
      setSelectedIds(portfolios.filter(p => !p.isDefault).map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectPortfolio = (portfolioId: string) => {
    const portfolio = portfolios.find(p => p.id === portfolioId);
    if (portfolio?.isDefault) return; // Don't allow selecting default

    setSelectedIds(prev =>
      prev.includes(portfolioId)
        ? prev.filter(id => id !== portfolioId)
        : [...prev, portfolioId]
    );
  };

  const handleDeleteSelected = async () => {
    setIsDeleting(true);
    setDeleteMessage('');
    try {
      const deletePromises = selectedIds.map(async (id) => {
        const response = await fetch(`/api/portfolios/${id}`, {
          method: 'DELETE',
        });
        return response.json();
      });

      const results = await Promise.all(deletePromises);

      // Show messages about archived vs deleted portfolios
      const messages = results.map(r => r.message).join('\n');
      setDeleteMessage(messages);

      await fetchPortfolios();
      setSelectedIds([]);
      setSelectMode(false);
    } catch (error) {
      console.error('Error deleting portfolios:', error);
      setDeleteMessage('Error deleting portfolios. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditPortfolio = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio);
  };

  const handleSavePortfolio = async (portfolioId: string | null, data: any) => {
    try {
      if (!portfolioId) return;
      const response = await fetch(`/api/portfolios/${portfolioId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update portfolio');
      }

      await fetchPortfolios();
    } catch (error) {
      console.error('Error updating portfolio:', error);
      throw error;
    }
  };

  const handleAddPortfolio = async (_: string | null, data: any) => {
    try {
      const response = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create portfolio");
      await fetchPortfolios();
    } catch (error) {
      console.error("Error creating portfolio:", error);
      throw error;
    }
  };

  const handleSetDefault = async (portfolioId: string) => {
    try {
      await fetch(`/api/portfolios/${portfolioId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      await fetchPortfolios();
    } catch (error) {
      console.error('Error setting default portfolio:', error);
    }
  };

  const activePortfolios = portfolios.filter(p => !p.isArchived);
  const archivedPortfolios = portfolios.filter(p => p.isArchived);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center mb-2">
        <Link href="/settings" className="text-primary hover:underline flex items-center">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Settings
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Manage Portfolios</h1>
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
                Select Portfolios
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Add Portfolio
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          id="includeArchived"
          checked={includeArchived}
          onChange={(e) => setIncludeArchived(e.target.checked)}
          className="rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
        />
        <label htmlFor="includeArchived" className="text-sm">
          Show archived portfolios
        </label>
      </div>

      {/* Active Portfolios */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              {selectMode && (
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedIds.length === activePortfolios.filter(p => !p.isDefault).length && selectedIds.length > 0}
                    className="rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                </th>
              )}
              <th className="p-3 text-left">Portfolio Name</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Trades</th>
              <th className="p-3 text-left">Default</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {activePortfolios.map((portfolio) => (
              <tr key={portfolio.id} className="border-t hover:bg-muted/50">
                {selectMode && (
                  <td className="p-3">
                    {!portfolio.isDefault && (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(portfolio.id)}
                        onChange={() => handleSelectPortfolio(portfolio.id)}
                        className="rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                      />
                    )}
                  </td>
                )}
                <td className="p-3 font-medium">
                  {portfolio.name}
                  {portfolio.isDefault && (
                    <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                      DEFAULT
                    </span>
                  )}
                </td>
                <td className="p-3 text-sm text-muted-foreground">
                  {portfolio.description || '-'}
                </td>
                <td className="p-3 text-sm">
                  {portfolio._count?.trades || 0}
                </td>
                <td className="p-3">
                  {portfolio.isDefault ? (
                    <Star className="h-4 w-4 fill-primary text-primary" />
                  ) : (
                    <button
                      onClick={() => handleSetDefault(portfolio.id)}
                      className="text-muted-foreground hover:text-primary"
                      title="Set as default"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleEditPortfolio(portfolio)}
                    className="text-primary hover:underline text-sm"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {activePortfolios.length === 0 && (
              <tr>
                <td colSpan={selectMode ? 6 : 5} className="p-8 text-center text-muted-foreground">
                  No portfolios found. Click "Add Portfolio" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Archived Portfolios */}
      {includeArchived && archivedPortfolios.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Archived Portfolios</h2>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">Portfolio Name</th>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-left">Trades</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {archivedPortfolios.map((portfolio) => (
                  <tr key={portfolio.id} className="border-t hover:bg-muted/50 opacity-60">
                    <td className="p-3 font-medium">{portfolio.name}</td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {portfolio.description || '-'}
                    </td>
                    <td className="p-3 text-sm">
                      {portfolio._count?.trades || 0}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={async () => {
                          await fetch(`/api/portfolios/${portfolio.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ isArchived: false }),
                          });
                          await fetchPortfolios();
                        }}
                        className="text-primary hover:underline text-sm"
                      >
                        Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-4">
              Are you sure you want to delete {selectedIds.length} portfolio(s)?
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              Note: Portfolios with trades will be archived instead of permanently deleted.
            </p>
            {deleteMessage && (
              <div className="mb-4 p-3 bg-muted rounded text-sm whitespace-pre-line">
                {deleteMessage}
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteMessage('');
                }}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 disabled:opacity-50"
                disabled={isDeleting}
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

      {/* Add/Edit Modal */}
      {(showAddModal || editingPortfolio) && (
        <PortfolioEditModal
          portfolio={editingPortfolio}
          onClose={() => {
            setShowAddModal(false);
            setEditingPortfolio(null);
          }}
          onSave={editingPortfolio ? handleSavePortfolio : handleAddPortfolio}
        />
      )}
    </div>
  );
}
