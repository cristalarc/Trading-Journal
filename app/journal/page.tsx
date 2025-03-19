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
  Loader2
} from "lucide-react";
import { TimeTablePanel } from "@/components/time-table-panel";
import { RetrospectiveReminder } from "@/components/retrospective-reminder";
import { createLogger } from "@/lib/logger";
import { useJournalEntries } from "@/lib/hooks/useJournalEntries";
import { useTimeframes, usePatterns, useTooltips } from "@/lib/hooks/useConfig";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils";

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
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [editingRows, setEditingRows] = useState<string[]>([]);
  
  // Filter states
  const [selectedTimeframe, setSelectedTimeframe] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch journal entries with filters
  const { 
    entries: journalEntries, 
    isLoading: entriesLoading, 
    error: entriesError,
    updateFilters,
    resetFilters: resetApiFilters,
    getOverdueRetrospectivesCount,
    refreshEntries
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
    resetApiFilters();
  };

  /**
   * Opens the side panel to view details for a specific entry
   */
  const handleViewDetails = (id: string) => {
    logger.debug('Opening side panel for entry', { entryId: id });
    setSelectedEntryId(id);
    setShowSidePanel(true);
  };

  /**
   * Closes the side panel and clears the selected entry
   */
  const closeSidePanel = () => {
    logger.debug('Closing side panel');
    setShowSidePanel(false);
    setSelectedEntryId(null);
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
   * Toggles the editing state of a table row
   * Only one row can be edited at a time
   * Automatically expands the row when editing is enabled
   */
  const toggleRowEditing = (entryId: string) => {
    logger.debug('Toggling row editing', { entryId });
    
    if (editingRows.includes(entryId)) {
      // Save changes
      logger.info('Saving changes for entry', { entryId });
      setEditingRows(prev => prev.filter(id => id !== entryId));
    } else {
      // Start editing and ensure row is expanded
      logger.info('Starting edit mode for entry', { entryId });
      setEditingRows([entryId]); // Only allow one row to be edited at a time
      if (!expandedRows.includes(entryId)) {
        setExpandedRows(prev => [...prev, entryId]);
      }
    }
  };

  // Loading state
  const isLoading = entriesLoading || timeframesLoading || patternsLoading || tooltipsLoading;

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
        <div className="flex justify-center items-center py-12">
          <Loader2 size={24} className="animate-spin mr-2" />
          <span>Loading journal entries...</span>
        </div>
      ) : entriesError ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <p>Error loading journal entries. Please try again.</p>
        </div>
      ) : journalEntries.length === 0 ? (
        <div className="bg-card p-8 rounded-md text-center">
          <p className="text-muted-foreground mb-4">No journal entries found.</p>
          <button 
            onClick={() => router.push('/journal/new')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
          >
            Create your first entry
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Ticker</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Timeframe</th>
                <th className="px-4 py-2 text-left">Direction</th>
                <th className="px-4 py-2 text-left">Pattern</th>
                <th className="px-4 py-2 text-left">Retro 7D</th>
                <th className="px-4 py-2 text-left">Retro 30D</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {journalEntries.map(entry => [
                <tr 
                  key={`row-${entry.id}`}
                  className={`border-b hover:bg-muted/50 ${
                    expandedRows.includes(entry.id) ? 'bg-muted/30' : ''
                  }`}
                >
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
                        onClick={() => toggleRowEditing(entry.id)}
                        className={`${
                          editingRows.includes(entry.id) 
                            ? 'text-primary' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        aria-label={editingRows.includes(entry.id) ? "Save changes" : "Edit entry"}
                      >
                        {editingRows.includes(entry.id) ? (
                          <Save size={16} />
                        ) : (
                          <Edit size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => handleViewDetails(entry.id)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="View details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>,
                
                expandedRows.includes(entry.id) && (
                  <tr key={`expanded-${entry.id}`} className="bg-muted/20">
                    <td colSpan={9} className="px-8 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column - Additional Info */}
                        <div>
                          <h3 className="text-lg font-medium mb-2">Additional Information</h3>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            {entry.support && (
                              <div>
                                <p className="text-sm text-muted-foreground">Support</p>
                                <p className="font-medium">{formatPrice(entry.support)}</p>
                              </div>
                            )}
                            {entry.resistance && (
                              <div>
                                <p className="text-sm text-muted-foreground">Resistance</p>
                                <p className="font-medium">{formatPrice(entry.resistance)}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-muted-foreground">Sentiment</p>
                              <p className="font-medium">{entry.sentiment}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Weekly One Pager</p>
                              <p className="font-medium">{entry.isWeeklyOnePagerEligible ? 'Yes' : 'No'}</p>
                            </div>
                          </div>
                          {entry.comments && (
                            <div>
                              <p className="text-sm text-muted-foreground">Comments</p>
                              <p className="bg-muted/40 p-3 rounded-md">{entry.comments}</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Right Column - Edit Form (only shown when editing) */}
                        {editingRows.includes(entry.id) && (
                          <div className="bg-card p-4 rounded-md border">
                            <h3 className="text-lg font-medium mb-3">Edit Entry</h3>
                            <form className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-sm font-medium">Ticker</label>
                                  <input 
                                    type="text" 
                                    defaultValue={entry.ticker}
                                    className="w-full px-3 py-1.5 border rounded-md"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-sm font-medium">Price</label>
                                  <input 
                                    type="number" 
                                    step="0.01"
                                    defaultValue={String(entry.price)}
                                    className="w-full px-3 py-1.5 border rounded-md"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-sm font-medium">Support</label>
                                  <input 
                                    type="number"
                                    step="0.01"
                                    defaultValue={entry.support ? String(entry.support) : ''}
                                    className="w-full px-3 py-1.5 border rounded-md"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-sm font-medium">Resistance</label>
                                  <input 
                                    type="number"
                                    step="0.01"
                                    defaultValue={entry.resistance ? String(entry.resistance) : ''}
                                    className="w-full px-3 py-1.5 border rounded-md"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-sm font-medium">Comments</label>
                                <textarea
                                  rows={3}
                                  defaultValue={entry.comments || ''}
                                  className="w-full px-3 py-1.5 border rounded-md"
                                ></textarea>
                              </div>
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleRowEditing(entry.id)}
                                  className="px-3 py-1.5 text-sm border rounded-md hover:bg-muted"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleRowEditing(entry.id)}
                                  className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                                >
                                  Save Changes
                                </button>
                              </div>
                            </form>
                          </div>
                        )}
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
      {showSidePanel && selectedEntryId && (
        <TimeTablePanel 
          entryId={selectedEntryId} 
          onClose={closeSidePanel} 
        />
      )}
    </div>
  );
} 