"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  RefreshCcw, 
  Calendar, 
  ChevronDown, 
  Edit, 
  Eye, 
  ChevronUp, 
  Filter, 
  Plus, 
  Save, 
  X,
  Settings,
  HelpCircle,
  Loader2,
  Bell,
  Trash2
} from "lucide-react";
import { TimeTablePanel } from "@/components/time-table-panel";
import { RetrospectiveReminder } from "@/components/retrospective-reminder";
import { createLogger } from "@/lib/logger";
import { useJournalEntries } from "@/lib/hooks/useJournalEntries";
import { useTimeframes, usePatterns, useTooltips } from "@/lib/hooks/useConfig";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils";
import { JournalEditForm } from '@/components/journal-edit-form';
import { Tooltip } from '@/components/tooltip';
import { DEFAULT_DIRECTION_TOOLTIP, DEFAULT_SENTIMENT_TOOLTIP, DEFAULT_7D_RETRO_TOOLTIP, DEFAULT_30D_RETRO_TOOLTIP } from "@/lib/default-tooltips";

const logger = createLogger('JournalPage');

/**
 * JournalPage Component
 * 
 * Main page for displaying and managing trading journal entries.
 * Features:
 * - Displays a table of journal entries with expandable rows
 * - Provides inline editing of entries
 * - Includes filters for timeframes and other criteria
 * - Shows retrospective reminders
 * - Integrates with settings for patterns, timeframes, and tooltips
 */
export default function JournalPage() {
  logger.debug('Initializing JournalPage component');

  const router = useRouter();
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [selectedEntryForEdit, setSelectedEntryForEdit] = useState<string | null>(null);
  
  // Filter states
  const [selectedTimeframe, setSelectedTimeframe] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterTicker, setFilterTicker] = useState<string>('');

  // Bulk delete states
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch journal entries with filters
  const { 
    entries: journalEntries, 
    isLoading: entriesLoading, 
    error: entriesError,
    updateFilters,
    resetFilters: resetApiFilters,
    getOverdueRetrospectivesCount,
    refreshEntries,
    updateEntry,
    deleteEntry
  } = useJournalEntries();

  // Fetch configuration data
  const { timeframes, isLoading: timeframesLoading } = useTimeframes();
  const { patterns, isLoading: patternsLoading } = usePatterns();
  const { tooltips, isLoading: tooltipsLoading } = useTooltips();

  // Calculate number of overdue retrospectives
  const overdueRetrospectives = getOverdueRetrospectivesCount();

  /**
   * Handles timeframe filter selection
   * Toggles the selected timeframe or clears it if already selected
   */
  const handleTimeframeFilter = (timeframeId: string) => {
    logger.debug('Handling timeframe filter change', { timeframeId });
    
    if (selectedTimeframe === timeframeId) {
      setSelectedTimeframe(null);
      updateFilters({ timeframeId: undefined });
    } else {
      setSelectedTimeframe(timeframeId);
      updateFilters({ timeframeId });
    }
  };

  /**
   * Resets all filters to their default state
   */
  const resetFilters = () => {
    logger.info('Resetting all filters');
    setSelectedTimeframe(null);
    setFilterTicker('');
    resetApiFilters();
  };

  /**
   * Opens the side panel to view details for a specific entry
   */
  const handleViewDetails = (ticker: string) => {
    setSelectedTicker(ticker);
    setShowSidePanel(true);
  };

  /**
   * Closes the side panel and clears the selected entry
   */
  const closeSidePanel = () => {
    logger.debug('Closing side panel');
    setShowSidePanel(false);
    setSelectedTicker(null);
  };

  /**
   * Navigates to the retrospectives page
   */
  const handleCompleteRetrospective = () => {
    logger.info('Navigating to retrospectives page');
    router.push("/journal/retrospectives");
  };

  /**
   * Toggles the expansion state of a table row
   * If the row is expanded, it will be collapsed and vice versa
   */
  const toggleRowExpansion = (entryId: string) => {
    logger.debug('Toggling row expansion', { entryId });
    setExpandedRows(prev => 
      prev.includes(entryId) 
        ? prev.filter(id => id !== entryId) 
        : [...prev, entryId]
    );
  };

  /**
   * Handles saving the edited journal entry
   */
  const handleSaveEntry = async (entryId: string, data: any) => {
    logger.debug('Saving journal entry', { entryId, data });
    try {
      await updateEntry(entryId, data);
      setSelectedEntryForEdit(null);
      refreshEntries();
    } catch (error) {
      console.error('Error saving journal entry:', error);
      throw error;
    }
  };

  // Replace the toggleRowEditing function with this:
  const handleEditClick = (entryId: string) => {
    logger.debug('Opening edit form for entry', { entryId });
    setSelectedEntryForEdit(entryId);
  };

  // Loading state
  const isLoading = entriesLoading || timeframesLoading || patternsLoading || tooltipsLoading;

  const handleSelectAll = () => {
    if (selectedIds.length === journalEntries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(journalEntries.map(e => e.id));
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    setShowDeleteModal(false);
    await Promise.all(selectedIds.map(id => deleteEntry(id)));
    setSelectedIds([]);
    setSelectMode(false);
    refreshEntries();
  };

  logger.info('Rendering journal page', { 
    entriesCount: journalEntries.length,
    overdueRetrospectives,
    activeFilters: {
      timeframe: selectedTimeframe
    }
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Journal Entries</h1>
      
      {/* Top action bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.push('/journal/new')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Plus size={16} />
            <span>New Entry</span>
          </button>
          <button
            onClick={() => {
              setSelectMode(true);
              setSelectedIds([]);
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Trash2 size={16} />
            <span>Delete Entries</span>
          </button>
          <button 
            onClick={() => refreshEntries()}
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
          {/* Bell icon for retrospectives */}
          <button
            onClick={handleCompleteRetrospective}
            className="relative bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-2 rounded-md flex items-center"
            aria-label="View retrospectives"
          >
            <Bell size={18} />
            {overdueRetrospectives > 0 && (
              <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
            )}
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-2 rounded-md flex items-center gap-2"
          >
            <Filter size={16} />
            <span>Filters</span>
            {selectedTimeframe && <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">1</span>}
          </button>
          
          <Link 
            href="/settings"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-2 rounded-md"
          >
            <Settings size={16} />
          </Link>
        </div>
      </div>
      
      {/* Retrospective reminder */}
      {overdueRetrospectives > 0 && (
        <RetrospectiveReminder 
          count={overdueRetrospectives} 
          onComplete={handleCompleteRetrospective} 
        />
      )}
      
      {/* Filter panel */}
      {showFilters && (
        <div className="bg-card p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Filter Journal Entries</h2>
            <button 
              onClick={resetFilters}
              className="text-primary text-sm hover:underline"
            >
              Reset Filters
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Ticker</h3>
              <input
                type="text"
                placeholder="Enter ticker"
                value={filterTicker}
                onChange={e => {
                  setFilterTicker(e.target.value);
                  updateFilters({ ticker: e.target.value || undefined });
                }}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Timeframe</h3>
              <div className="flex flex-wrap gap-2">
                {timeframes.map(timeframe => (
                  <button 
                    key={timeframe.id}
                    onClick={() => handleTimeframeFilter(timeframe.id)}
                    className={`px-3 py-1 text-sm rounded-full border ${
                      selectedTimeframe === timeframe.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background hover:bg-muted'
                    }`}
                  >
                    {timeframe.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Journal entries table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : entriesError ? (
        <div className="text-center py-8 text-destructive">
          <p>Error loading journal entries</p>
          <p className="text-sm">{entriesError}</p>
        </div>
      ) : journalEntries.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No journal entries found</p>
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
                      checked={selectedIds.length === journalEntries.length && journalEntries.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                )}
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Ticker</th>
                <th className="text-left p-4">Price</th>
                <th className="text-left p-4">
                  <div className="flex items-center gap-2">
                    Timeframe
                    <Tooltip 
                      type="settings" 
                      text="Configure timeframe options in Settings"
                      settingsLink="/settings/timeframes"
                    />
                  </div>
                </th>
                <th className="text-left p-4">
                  <div className="flex items-center gap-2">
                    Direction
                    <Tooltip text={tooltips.direction?.text || DEFAULT_DIRECTION_TOOLTIP} />
                  </div>
                </th>
                <th className="text-left p-4">
                  <div className="flex items-center gap-2">
                    Sentiment
                    <Tooltip text={tooltips.sentiment?.text || DEFAULT_SENTIMENT_TOOLTIP} />
                  </div>
                </th>
                <th className="text-left p-4">
                  <div className="flex items-center gap-2">
                    Pattern
                    <Tooltip 
                      type="settings" 
                      text="Configure pattern options in Settings"
                      settingsLink="/settings/patterns"
                    />
                  </div>
                </th>
                <th className="text-left p-4">
                  <div className="flex items-center gap-2">
                    7D Retro
                    <Tooltip text={tooltips.retro7D?.text || DEFAULT_7D_RETRO_TOOLTIP} />
                  </div>
                </th>
                <th className="text-left p-4">
                  <div className="flex items-center gap-2">
                    30D Retro
                    <Tooltip text={tooltips.retro30D?.text || DEFAULT_30D_RETRO_TOOLTIP} />
                  </div>
                </th>
                <th className="text-center p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {journalEntries.map(entry => [
                <tr key={entry.id} className={expandedRows.includes(entry.id) ? 'border-b-0' : 'border-b'}>
                  {selectMode && (
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(entry.id)}
                        onChange={() => handleSelectRow(entry.id)}
                      />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    {format(new Date(entry.entryDate), 'yyyy-MM-dd')}
                  </td>
                  <td className="px-4 py-3 font-medium">{entry.ticker}</td>
                  <td className="px-4 py-3">{formatPrice(entry.price)}</td>
                  <td className="px-4 py-3">{entry.timeframe?.name || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      entry.direction === 'Bullish' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {entry.direction}
                    </span>
                  </td>
                  <td className="px-4 py-3">{entry.sentiment || '-'}</td>
                  <td className="px-4 py-3">{entry.pattern?.name || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      entry.retro7DStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : entry.retro7DOutcome === 'win'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {entry.retro7DStatus === 'pending' 
                        ? 'Pending' 
                        : entry.retro7DOutcome === 'win' ? 'Win' : 'Loss'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      entry.retro30DStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : entry.retro30DOutcome === 'win'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {entry.retro30DStatus === 'pending' 
                        ? 'Pending' 
                        : entry.retro30DOutcome === 'win' ? 'Win' : 'Loss'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => toggleRowExpansion(entry.id)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label={expandedRows.includes(entry.id) ? "Collapse row" : "Expand row"}
                      >
                        {expandedRows.includes(entry.id) ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditClick(entry.id)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Edit entry"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleViewDetails(entry.ticker)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="View details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>,
                expandedRows.includes(entry.id) && (
                  <tr key={`${entry.id}-expanded`}>
                    <td colSpan={8} className="px-4 py-3 bg-muted/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column - Entry Details */}
                        <div className="space-y-4">
                          {entry.support && (
                            <div>
                              <p className="text-sm text-muted-foreground">Support Level</p>
                              <p className="font-medium">{formatPrice(entry.support)}</p>
                            </div>
                          )}
                          {entry.resistance && (
                            <div>
                              <p className="text-sm text-muted-foreground">Resistance Level</p>
                              <p className="font-medium">{formatPrice(entry.resistance)}</p>
                            </div>
                          )}
                          {entry.comments && (
                            <div>
                              <p className="text-sm text-muted-foreground">Comments</p>
                              <p className="bg-muted/40 p-3 rounded-md">{entry.comments}</p>
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
      
      {/* Side panel for viewing entry details */}
      {showSidePanel && selectedTicker && (
        <TimeTablePanel
          ticker={selectedTicker}
          onClose={closeSidePanel}
        />
      )}

      {/* Edit form modal */}
      {selectedEntryForEdit && (
        <JournalEditForm
          entry={journalEntries.find(e => e.id === selectedEntryForEdit)}
          onClose={() => setSelectedEntryForEdit(null)}
          onSave={handleSaveEntry}
        />
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete {selectedIds.length} selected entr{selectedIds.length === 1 ? 'y' : 'ies'}? This action cannot be undone.</p>
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
    </div>
  );
} 