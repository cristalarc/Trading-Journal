"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  RefreshCcw, 
  ChevronDown, 
  Edit, 
  Eye, 
  ChevronUp, 
  Filter, 
  Plus, 
  Settings,
  Loader2,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
} from "lucide-react";
import { createLogger } from "@/lib/logger";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils";
import { IdeasEditForm } from "@/components/ideas-edit-form";

const logger = createLogger('IdeasPage');

interface Idea {
  id: string;
  ticker: string;
  date: string;
  currentPrice: any; // Prisma Decimal
  targetEntry: any; // Prisma Decimal
  targetPrice: any; // Prisma Decimal
  stop: any; // Prisma Decimal
  rrRatio: any; // Prisma Decimal
  tradeDirection: 'Long' | 'Short';
  strategy?: { name: string };
  market: 'Bullish' | 'Bearish';
  relative: any; // Prisma Decimal
  oneHourTrend: 'Bullish' | 'Bearish';
  oneHourCloud: 'Above' | 'Below';
  intendedPosition: number;
  toWinMoney: any; // Prisma Decimal
  moneyRisk: any; // Prisma Decimal
  notes?: string;
  sourced?: { name: string };
  quality: 'HQ' | 'MQ' | 'LQ';
  status: 'active' | 'inactive' | 'expired';
  tradeId?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

interface IdeasStats {
  total: number;
  active: number;
  expired: number;
  inactive: number;
  qualityBreakdown: Array<{ quality: string; _count: { quality: number } }>;
  directionBreakdown: Array<{ tradeDirection: string; _count: { tradeDirection: number } }>;
}

/**
 * IdeasPage Component
 * 
 * Main page for displaying and managing trading ideas.
 * Features:
 * - Displays a table of ideas with expandable rows
 * - Provides inline editing of ideas
 * - Includes filters for various criteria
 * - Shows idea statistics
 * - Integrates with settings for strategies and sources
 */
export default function IdeasPage() {
  logger.debug('Initializing IdeasPage component');

  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [stats, setStats] = useState<IdeasStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [selectedIdeaForEdit, setSelectedIdeaForEdit] = useState<string | null>(null);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    ticker: '',
    status: '',
    strategy: '',
    source: '',
    quality: '',
    tradeDirection: '',
    market: ''
  });

  // Bulk delete states
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch ideas data
  const fetchIdeas = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`/api/ideas?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ideas');
      }
      const data = await response.json();
      setIdeas(data);
    } catch (error) {
      console.error('Error fetching ideas:', error);
      setError('Failed to load ideas');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch ideas statistics
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/ideas/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch ideas statistics');
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching ideas statistics:', error);
    }
  };


  useEffect(() => {
    fetchIdeas();
    fetchStats();
  }, [filters]);

  /**
   * Toggles the expansion state of a table row
   */
  const toggleRowExpansion = (ideaId: string) => {
    logger.debug('Toggling row expansion', { ideaId });
    setExpandedRows(prev => 
      prev.includes(ideaId) 
        ? prev.filter(id => id !== ideaId) 
        : [...prev, ideaId]
    );
  };

  /**
   * Handles saving the edited idea
   */
  const handleSaveIdea = async (ideaId: string, data: any) => {
    logger.debug('Saving idea', { ideaId, data });
    try {
      const response = await fetch(`/api/ideas/${ideaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update idea');
      }
      
      setSelectedIdeaForEdit(null);
      await fetchIdeas();
    } catch (error) {
      console.error('Error saving idea:', error);
      throw error;
    }
  };

  const handleEditClick = (ideaId: string) => {
    logger.debug('Opening edit form for idea', { ideaId });
    setSelectedIdeaForEdit(ideaId);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === ideas.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(ideas.map(i => i.id));
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    setShowDeleteModal(false);
    await Promise.all(selectedIds.map(id => 
      fetch(`/api/ideas/${id}`, { method: 'DELETE' })
    ));
    setSelectedIds([]);
    setSelectMode(false);
    await fetchIdeas();
    await fetchStats();
  };


  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'HQ': return 'bg-green-100 text-green-800';
      case 'MQ': return 'bg-yellow-100 text-yellow-800';
      case 'LQ': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  logger.info('Rendering ideas page', { 
    ideasCount: ideas.length,
    stats
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Trading Ideas</h1>
      
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Ideas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              </div>
              <Target className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-gray-600" />
            </div>
          </div>
        </div>
      )}
      
      {/* Top action bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.push('/ideas/new')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Plus size={16} />
            <span>New Idea</span>
          </button>
          <button
            onClick={() => {
              setSelectMode(true);
              setSelectedIds([]);
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Trash2 size={16} />
            <span>Delete Ideas</span>
          </button>
          <button 
            onClick={() => {
              fetchIdeas();
              fetchStats();
            }}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-2 rounded-md"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCcw size={16} />
            )}
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-2 rounded-md flex items-center gap-2"
          >
            <Filter size={16} />
            <span>Filters</span>
          </button>
          
          <Link 
            href="/settings"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-2 rounded-md"
          >
            <Settings size={16} />
          </Link>
        </div>
      </div>
      
      {/* Filter panel */}
      {showFilters && (
        <div className="bg-card p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Filter Ideas</h2>
            <button 
              onClick={() => setFilters({
                ticker: '',
                status: '',
                strategy: '',
                source: '',
                quality: '',
                tradeDirection: '',
                market: ''
              })}
              className="text-primary text-sm hover:underline"
            >
              Reset Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Ticker</label>
              <input
                type="text"
                placeholder="Enter ticker"
                value={filters.ticker}
                onChange={e => setFilters(prev => ({ ...prev, ticker: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                value={filters.status}
                onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Quality</label>
              <select
                value={filters.quality}
                onChange={e => setFilters(prev => ({ ...prev, quality: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">All Quality</option>
                <option value="HQ">High Quality</option>
                <option value="MQ">Medium Quality</option>
                <option value="LQ">Low Quality</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Direction</label>
              <select
                value={filters.tradeDirection}
                onChange={e => setFilters(prev => ({ ...prev, tradeDirection: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">All Directions</option>
                <option value="Long">Long</option>
                <option value="Short">Short</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Market</label>
              <select
                value={filters.market}
                onChange={e => setFilters(prev => ({ ...prev, market: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">All Markets</option>
                <option value="Bullish">Bullish</option>
                <option value="Bearish">Bearish</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Ideas table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-destructive">
          <p>Error loading ideas</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : ideas.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No ideas found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                {selectMode && (
                  <th className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === ideas.length && ideas.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                )}
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Ticker</th>
                <th className="text-left p-4">Entry</th>
                <th className="text-left p-4">Target</th>
                <th className="text-left p-4">Stop</th>
                <th className="text-left p-4">RR</th>
                <th className="text-left p-4">Direction</th>
                <th className="text-left p-4">Quality</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">To Win</th>
                <th className="text-left p-4">Risk</th>
                <th className="text-center p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ideas.map(idea => [
                <tr key={idea.id} className={expandedRows.includes(idea.id) ? 'border-b-0' : 'border-b'}>
                  {selectMode && (
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(idea.id)}
                        onChange={() => handleSelectRow(idea.id)}
                      />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    {format(new Date(idea.date), 'yyyy-MM-dd')}
                  </td>
                  <td className="px-4 py-3 font-medium">{idea.ticker}</td>
                  <td className="px-4 py-3">{formatPrice(idea.targetEntry)}</td>
                  <td className="px-4 py-3">{formatPrice(idea.targetPrice)}</td>
                  <td className="px-4 py-3">{formatPrice(idea.stop)}</td>
                  <td className="px-4 py-3">{Number(idea.rrRatio).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      idea.tradeDirection === 'Long' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {idea.tradeDirection}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getQualityColor(idea.quality)}`}>
                      {idea.quality}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(idea.status)}`}>
                      {idea.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatPrice(idea.toWinMoney)}</td>
                  <td className="px-4 py-3">{formatPrice(idea.moneyRisk)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => toggleRowExpansion(idea.id)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label={expandedRows.includes(idea.id) ? "Collapse row" : "Expand row"}
                      >
                        {expandedRows.includes(idea.id) ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditClick(idea.id)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Edit idea"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>,
                expandedRows.includes(idea.id) && (
                  <tr key={`${idea.id}-expanded`}>
                    <td colSpan={selectMode ? 13 : 12} className="px-4 py-3 bg-muted/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column - Idea Details */}
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Current Price</p>
                            <p className="font-medium">{formatPrice(idea.currentPrice)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Strategy</p>
                            <p className="font-medium">{idea.strategy?.name || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Market</p>
                            <p className="font-medium">{idea.market}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Relative Strength</p>
                            <p className="font-medium">{Number(idea.relative).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">1hr Trend</p>
                            <p className="font-medium">{idea.oneHourTrend}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">1hr Cloud</p>
                            <p className="font-medium">{idea.oneHourCloud}</p>
                          </div>
                        </div>
                        
                        {/* Right Column - Additional Info */}
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Position Size</p>
                            <p className="font-medium">{idea.intendedPosition}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Source</p>
                            <p className="font-medium">{idea.sourced?.name || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Trade ID</p>
                            <p className="font-medium">{idea.tradeId || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Expires</p>
                            <p className={`font-medium ${isExpired(idea.expiresAt) ? 'text-red-600' : ''}`}>
                              {format(new Date(idea.expiresAt), 'yyyy-MM-dd')}
                            </p>
                          </div>
                          {idea.notes && (
                            <div>
                              <p className="text-sm text-muted-foreground">Notes</p>
                              <p className="bg-muted/40 p-3 rounded-md">{idea.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              ].filter(Boolean))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete {selectedIds.length} selected idea{selectedIds.length === 1 ? '' : 's'}? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded bg-muted hover:bg-muted/70 border"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 rounded bg-destructive text-destructive-foreground hover:bg-destructive/90 border"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {selectMode && (
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setSelectMode(false)}
            className="text-sm px-3 py-1 rounded bg-muted hover:bg-muted/70 border"
          >
            Cancel
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-sm px-3 py-1 rounded bg-destructive text-destructive-foreground hover:bg-destructive/90 border"
            disabled={selectedIds.length === 0}
          >
            Delete Selected ({selectedIds.length})
          </button>
        </div>
      )}

      {/* Edit form modal */}
      {selectedIdeaForEdit && (
        <IdeasEditForm
          idea={ideas.find(i => i.id === selectedIdeaForEdit)}
          onClose={() => setSelectedIdeaForEdit(null)}
          onSave={handleSaveIdea}
        />
      )}
    </div>
  );
}
