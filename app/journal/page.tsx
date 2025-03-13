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
  HelpCircle
} from "lucide-react";
import { TimeTablePanel } from "@/components/time-table-panel";
import { RetrospectiveReminder } from "@/components/retrospective-reminder";
import { createLogger } from "@/lib/logger";

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

  // Mock data for demonstration
  const journalEntries = [
    {
      id: "1",
      date: "2023-05-15",
      ticker: "AAPL",
      price: 145.86,
      timeframe: "Daily",
      direction: "Bullish",
      sentiment: "Bullish",
      pattern: "Cup & Handle",
      retrospective7D: "pending",
      retrospective30D: "pending",
      support: 142.50,
      resistance: 148.75,
      comments: "Strong support at 142.50, expecting a breakout above 148.75 in the next few days."
    },
    {
      id: "2",
      date: "2023-05-12",
      ticker: "MSFT",
      price: 305.41,
      timeframe: "Weekly",
      direction: "Bullish",
      sentiment: "Neutral",
      pattern: "Ascending Triangle",
      retrospective7D: "completed",
      retrospective30D: "pending",
      support: 300.00,
      resistance: 310.25,
      comments: "Consolidating near all-time highs, watching for volume confirmation."
    },
    {
      id: "3",
      date: "2023-05-10",
      ticker: "TSLA",
      price: 180.54,
      timeframe: "Daily",
      direction: "Bearish",
      sentiment: "Bearish",
      pattern: "Head & Shoulders",
      retrospective7D: "completed",
      retrospective30D: "completed",
      support: 175.00,
      resistance: 185.50,
      comments: "Breaking below neckline, targeting 165 area in the short term."
    },
    {
      id: "4",
      date: "2023-05-08",
      ticker: "AMZN",
      price: 110.26,
      timeframe: "Hourly",
      direction: "Bullish",
      sentiment: "Bullish",
      pattern: "Double Bottom",
      retrospective7D: "pending",
      retrospective30D: "pending",
      support: 108.50,
      resistance: 112.75,
      comments: "Watching for confirmation of the double bottom pattern with increased volume."
    },
    {
      id: "5",
      date: "2023-05-05",
      ticker: "NVDA",
      price: 277.49,
      timeframe: "Weekly",
      direction: "Bullish",
      sentiment: "Bullish",
      pattern: "Breakout",
      retrospective7D: "completed",
      retrospective30D: "pending",
      support: 270.00,
      resistance: 285.00,
      comments: "Strong momentum after earnings, watching for continuation."
    }
  ];

  // Calculate number of overdue retrospectives
  const overdueRetrospectives = journalEntries.filter(
    entry => entry.retrospective7D === "pending" || entry.retrospective30D === "pending"
  ).length;

  // Mock data for patterns (this would come from settings in the real app)
  const availablePatterns = [
    "Cup & Handle",
    "Head & Shoulders",
    "Double Bottom",
    "Double Top",
    "Ascending Triangle",
    "Descending Triangle",
    "Flag",
    "Pennant",
    "Breakout",
  ];

  // Mock tooltip text (this would come from settings in the real app)
  const tooltips = {
    direction: "Direction indicates whether you expect the price to go up (Bullish) or down (Bearish)",
    sentiment: "Sentiment reflects your overall feeling about the trade based on your analysis"
  };

  /**
   * Handles timeframe filter selection
   * Toggles the selected timeframe or clears it if already selected
   */
  const handleTimeframeFilter = (timeframe: string) => {
    logger.debug('Handling timeframe filter change', { timeframe });
    setSelectedTimeframe(timeframe === selectedTimeframe ? null : timeframe);
  };

  /**
   * Resets all filters to their default state
   */
  const resetFilters = () => {
    logger.info('Resetting all filters');
    setSelectedTimeframe(null);
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

  // Filter entries based on selected criteria
  const filteredEntries = journalEntries.filter(entry => {
    if (selectedTimeframe && entry.timeframe !== selectedTimeframe) {
      return false;
    }
    return true;
  });

  logger.info('Rendering journal page', { 
    entriesCount: filteredEntries.length,
    overdueRetrospectives,
    activeFilters: {
      timeframe: selectedTimeframe
    }
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Journal Entries</h1>
      
      {/* Retrospective Action Required */}
      <RetrospectiveReminder 
        overdueCount={overdueRetrospectives} 
        onComplete={handleCompleteRetrospective} 
      />
      
      {/* Filters */}
      <div className="bg-card p-4 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Journal Entries</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 bg-muted rounded-md text-sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </button>
            <Link
              href="/journal/new"
              className="flex items-center px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Entry
            </Link>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div>
              <button
                onClick={() => handleTimeframeFilter("Hourly")}
                className={`px-3 py-2 text-sm rounded-md w-full ${
                  selectedTimeframe === "Hourly"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                Hourly
              </button>
            </div>
            <div>
              <button
                onClick={() => handleTimeframeFilter("Daily")}
                className={`px-3 py-2 text-sm rounded-md w-full ${
                  selectedTimeframe === "Daily"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                Daily
              </button>
            </div>
            <div>
              <button
                onClick={() => handleTimeframeFilter("Weekly")}
                className={`px-3 py-2 text-sm rounded-md w-full ${
                  selectedTimeframe === "Weekly"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                Weekly
              </button>
            </div>
            <div>
              <button
                onClick={() => handleTimeframeFilter("Monthly")}
                className={`px-3 py-2 text-sm rounded-md w-full ${
                  selectedTimeframe === "Monthly"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                Monthly
              </button>
            </div>
            <div>
              <button
                onClick={resetFilters}
                className="px-3 py-2 text-sm bg-destructive text-destructive-foreground rounded-md w-full"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <input
                type="text"
                placeholder="Ticker"
                className="w-full p-2 text-sm border rounded-md bg-background"
              />
            </div>
            <div>
              <input
                type="week"
                placeholder="Week"
                className="w-full p-2 text-sm border rounded-md bg-background"
              />
            </div>
            <div>
              <select className="w-full p-2 text-sm border rounded-md bg-background">
                <option value="">Sentiment</option>
                <option value="Bullish">Bullish</option>
                <option value="Neutral">Neutral</option>
                <option value="Bearish">Bearish</option>
              </select>
            </div>
            <div>
              <select className="w-full p-2 text-sm border rounded-md bg-background">
                <option value="">Retrospective Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        )}
      </div>
      
      {/* Journal Entries Table */}
      <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left text-sm font-medium"></th>
                <th className="p-3 text-left text-sm font-medium">Date</th>
                <th className="p-3 text-left text-sm font-medium">Ticker</th>
                <th className="p-3 text-left text-sm font-medium">Price</th>
                <th className="p-3 text-left text-sm font-medium relative">
                  <div className="flex items-center">
                    Timeframe
                    <Link href="/settings/timeframes" className="ml-1">
                      <Settings className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Link>
                  </div>
                </th>
                <th className="p-3 text-left text-sm font-medium relative">
                  <div className="flex items-center">
                    Direction
                    <div className="group relative ml-1">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      <div className="absolute left-0 top-6 scale-0 transition-all rounded bg-popover p-2 text-xs text-popover-foreground group-hover:scale-100 w-48 z-50 shadow-sm">
                        {tooltips.direction}
                      </div>
                    </div>
                  </div>
                </th>
                <th className="p-3 text-left text-sm font-medium relative">
                  <div className="flex items-center">
                    Sentiment
                    <div className="group relative ml-1">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      <div className="absolute left-0 top-6 scale-0 transition-all rounded bg-popover p-2 text-xs text-popover-foreground group-hover:scale-100 w-48 z-50 shadow-sm">
                        {tooltips.sentiment}
                      </div>
                    </div>
                  </div>
                </th>
                <th className="p-3 text-left text-sm font-medium relative">
                  <div className="flex items-center">
                    Pattern
                    <Link href="/settings/patterns" className="ml-1">
                      <Settings className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Link>
                  </div>
                </th>
                <th className="p-3 text-left text-sm font-medium">7D</th>
                <th className="p-3 text-left text-sm font-medium">30D</th>
                <th className="p-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => (
                <>
                  <tr key={entry.id} className="border-b">
                    <td className="p-3">
                      <button 
                        onClick={() => toggleRowExpansion(entry.id)}
                        className="p-1 rounded-full hover:bg-muted"
                      >
                        {expandedRows.includes(entry.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="p-3 text-sm">{entry.date}</td>
                    <td className="p-3 text-sm font-medium">
                      {editingRows.includes(entry.id) ? (
                        <input
                          type="text"
                          defaultValue={entry.ticker}
                          className="w-full p-1 text-sm border rounded bg-background"
                        />
                      ) : (
                        entry.ticker
                      )}
                    </td>
                    <td className="p-3 text-sm">
                      {editingRows.includes(entry.id) ? (
                        <input
                          type="number"
                          defaultValue={entry.price}
                          step="0.01"
                          className="w-full p-1 text-sm border rounded bg-background"
                        />
                      ) : (
                        `$${entry.price.toFixed(2)}`
                      )}
                    </td>
                    <td className="p-3 text-sm">
                      {editingRows.includes(entry.id) ? (
                        <select
                          defaultValue={entry.timeframe}
                          className="w-full p-1 text-sm border rounded bg-background"
                        >
                          <option value="Hourly">Hourly</option>
                          <option value="Daily">Daily</option>
                          <option value="Weekly">Weekly</option>
                          <option value="Monthly">Monthly</option>
                        </select>
                      ) : (
                        entry.timeframe
                      )}
                    </td>
                    <td className="p-3 text-sm">
                      {editingRows.includes(entry.id) ? (
                        <select
                          defaultValue={entry.direction}
                          className="w-full p-1 text-sm border rounded bg-background"
                        >
                          <option value="Bullish">Bullish</option>
                          <option value="Bearish">Bearish</option>
                        </select>
                      ) : (
                        entry.direction
                      )}
                    </td>
                    <td className="p-3 text-sm">
                      {editingRows.includes(entry.id) ? (
                        <select
                          defaultValue={entry.sentiment}
                          className="w-full p-1 text-sm border rounded bg-background"
                        >
                          <option value="Bullish">Bullish</option>
                          <option value="Neutral">Neutral</option>
                          <option value="Bearish">Bearish</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs ${
                            entry.sentiment === "Bullish"
                              ? "bg-green-100 text-green-800"
                              : entry.sentiment === "Bearish"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {entry.sentiment}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-sm">
                      {editingRows.includes(entry.id) ? (
                        <select
                          defaultValue={entry.pattern}
                          className="w-full p-1 text-sm border rounded bg-background"
                        >
                          {availablePatterns.map(pattern => (
                            <option key={pattern} value={pattern}>
                              {pattern}
                            </option>
                          ))}
                        </select>
                      ) : (
                        entry.pattern
                      )}
                    </td>
                    <td className="p-3 text-sm">
                      <span
                        className={`inline-block w-3 h-3 rounded-full ${
                          entry.retrospective7D === "completed"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      ></span>
                    </td>
                    <td className="p-3 text-sm">
                      <span
                        className={`inline-block w-3 h-3 rounded-full ${
                          entry.retrospective30D === "completed"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      ></span>
                    </td>
                    <td className="p-3 text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleRowEditing(entry.id)}
                          className="p-1 rounded-full hover:bg-muted text-blue-600"
                          title={editingRows.includes(entry.id) ? "Save changes" : "Edit entry"}
                        >
                          {editingRows.includes(entry.id) ? (
                            <Save className="h-4 w-4" />
                          ) : (
                            <Edit className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleViewDetails(entry.id)}
                          className="p-1 rounded-full hover:bg-muted text-blue-600"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRows.includes(entry.id) && (
                    <tr className="bg-muted/30">
                      <td colSpan={11} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="font-medium mb-2">Support & Resistance</h4>
                            {editingRows.includes(entry.id) ? (
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <span className="w-24 text-sm">Support:</span>
                                  <input 
                                    type="number" 
                                    defaultValue={entry.support} 
                                    step="0.01"
                                    className="p-1 text-sm border rounded bg-background w-32" 
                                  />
                                </div>
                                <div className="flex items-center">
                                  <span className="w-24 text-sm">Resistance:</span>
                                  <input 
                                    type="number" 
                                    defaultValue={entry.resistance} 
                                    step="0.01"
                                    className="p-1 text-sm border rounded bg-background w-32" 
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="text-sm">Support: <span className="font-medium">${entry.support.toFixed(2)}</span></div>
                                <div className="text-sm">Resistance: <span className="font-medium">${entry.resistance.toFixed(2)}</span></div>
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Comments</h4>
                            {editingRows.includes(entry.id) ? (
                              <textarea 
                                defaultValue={entry.comments}
                                rows={3}
                                className="w-full p-2 text-sm border rounded bg-background"
                              ></textarea>
                            ) : (
                              <p className="text-sm">{entry.comments}</p>
                            )}
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Retrospective Status</h4>
                            {editingRows.includes(entry.id) ? (
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <span className="w-24 text-sm">7 Day:</span>
                                  <select 
                                    defaultValue={entry.retrospective7D}
                                    className="p-1 text-sm border rounded bg-background w-32"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                  </select>
                                </div>
                                <div className="flex items-center">
                                  <span className="w-24 text-sm">30 Day:</span>
                                  <select 
                                    defaultValue={entry.retrospective30D}
                                    className="p-1 text-sm border rounded bg-background w-32"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                  </select>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="text-sm">
                                  7 Day: 
                                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                    entry.retrospective7D === "completed" 
                                      ? "bg-green-100 text-green-800" 
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}>
                                    {entry.retrospective7D === "completed" ? "Completed" : "Pending"}
                                  </span>
                                </div>
                                <div className="text-sm">
                                  30 Day: 
                                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                    entry.retrospective30D === "completed" 
                                      ? "bg-green-100 text-green-800" 
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}>
                                    {entry.retrospective30D === "completed" ? "Completed" : "Pending"}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Side Panel for Time Table (conditionally rendered) */}
      {showSidePanel && selectedEntryId && (
        <div className="fixed inset-y-0 right-0 w-full md:w-1/2 lg:w-1/3 bg-background border-l shadow-xl z-50 overflow-auto">
          <div className="absolute top-4 right-4">
            <button
              onClick={closeSidePanel}
              className="p-2 rounded-full hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <TimeTablePanel 
            entryId={selectedEntryId} 
            onClose={closeSidePanel} 
          />
        </div>
      )}
    </div>
  );
} 