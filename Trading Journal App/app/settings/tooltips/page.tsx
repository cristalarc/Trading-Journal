"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Save } from "lucide-react";
import { createLogger } from "@/lib/logger";

const logger = createLogger('TooltipsSettingsPage');

// Default tooltip texts
const DEFAULT_DIRECTION_TOOLTIP = "Direction indicates whether you expect the price to go up (Bullish) or down (Bearish)";
const DEFAULT_SENTIMENT_TOOLTIP = "Sentiment reflects your overall feeling about the trade based on your analysis";

/**
 * TooltipsSettingsPage Component
 * 
 * Allows users to customize the help text shown when hovering over Direction and Sentiment fields
 * in the journal entries table. Features include:
 * - Character limit enforcement (50 chars)
 * - Real-time character count
 * - Persistence of tooltip text (to be implemented)
 */
export default function TooltipsSettingsPage() {
  logger.debug('Initializing TooltipsSettingsPage component');

  // State for tooltip text with default values
  const [directionTooltip, setDirectionTooltip] = useState(DEFAULT_DIRECTION_TOOLTIP);
  const [sentimentTooltip, setSentimentTooltip] = useState(DEFAULT_SENTIMENT_TOOLTIP);

  /**
   * Updates the direction tooltip text with character limit enforcement
   */
  const handleDirectionTooltipChange = (value: string) => {
    const trimmedValue = value.slice(0, 50);
    logger.debug('Updating direction tooltip', {
      oldValue: directionTooltip,
      newValue: trimmedValue,
      charsRemaining: 50 - trimmedValue.length
    });
    setDirectionTooltip(trimmedValue);
  };

  /**
   * Updates the sentiment tooltip text with character limit enforcement
   */
  const handleSentimentTooltipChange = (value: string) => {
    const trimmedValue = value.slice(0, 50);
    logger.debug('Updating sentiment tooltip', {
      oldValue: sentimentTooltip,
      newValue: trimmedValue,
      charsRemaining: 50 - trimmedValue.length
    });
    setSentimentTooltip(trimmedValue);
  };

  /**
   * Saves the current tooltip settings
   * In a real app, this would persist the values to a database
   */
  const handleSave = () => {
    logger.info('Saving tooltip settings', {
      direction: directionTooltip,
      sentiment: sentimentTooltip
    });
    
    // TODO: Implement actual save functionality
    console.log("Saving tooltips:", { directionTooltip, sentimentTooltip });
  };

  logger.info('Rendering tooltips settings page');

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center mb-6">
        <Link 
          href="/settings" 
          className="text-primary hover:underline flex items-center"
          onClick={() => logger.debug('Navigating back to settings')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Settings
        </Link>
        <h1 className="text-3xl font-bold ml-4">Help Tooltips</h1>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-sm border">
        <div className="space-y-6">
          {/* Direction Tooltip Input */}
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="directionTooltip">
              Direction Help Text
              <span className="text-xs text-muted-foreground ml-2">(50 characters max)</span>
            </label>
            <input
              id="directionTooltip"
              type="text"
              value={directionTooltip}
              onChange={(e) => handleDirectionTooltipChange(e.target.value)}
              className="w-full p-2 text-sm border rounded-md bg-background"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {50 - directionTooltip.length} characters remaining
            </p>
          </div>

          {/* Sentiment Tooltip Input */}
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="sentimentTooltip">
              Sentiment Help Text
              <span className="text-xs text-muted-foreground ml-2">(50 characters max)</span>
            </label>
            <input
              id="sentimentTooltip"
              type="text"
              value={sentimentTooltip}
              onChange={(e) => handleSentimentTooltipChange(e.target.value)}
              className="w-full p-2 text-sm border rounded-md bg-background"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {50 - sentimentTooltip.length} characters remaining
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 