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
import { JournalEditForm } from '@/components/journal-edit-form';
import { Tooltip } from '@/components/tooltip';

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
  const [selectedEntryForEdit, setSelectedEntryForEdit] = useState<string | null>(null);
  
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
    refreshEntries,
    updateEntry
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
                    <Tooltip text="Direction indicates whether you expect the price to go up (Bullish) or down (Bearish)" />
                  </div>
                </th>
                <th className="text-left p-4">
                  <div className="flex items-center gap-2">
                    Sentiment
                    <Tooltip text="Sentiment reflects your overall feeling about the trade based on your analysis" />
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
                    <Tooltip text="7-day review of the trade outcome and lessons learned" />
                  </div>
                </th>
                <th className="text-left p-4">
                  <div className="flex items-center gap-2">
                    30D Retro
                    <Tooltip text="30-day review to evaluate longer-term trade impact and market behavior" />
                  </div>
                </th>
                <th className="text-center p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {journalEntries.map(entry => [
                <tr key={entry.id} className={expandedRows.includes(entry.id) ? 'border-b-0' : 'border-b'}>
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
                        onClick={() => handleEditClick(entry.id)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Edit entry"
                      >
                        <Edit size={16} />
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
      {showSidePanel && selectedEntryId && (
        <TimeTablePanel 
          entryId={selectedEntryId} 
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
    </div>
  );
} 