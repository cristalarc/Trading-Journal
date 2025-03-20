"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Save } from "lucide-react";
import { createLogger } from "@/lib/logger";

const logger = createLogger('TooltipsSettingsPage');

// Default tooltip texts
const DEFAULT_DIRECTION_TOOLTIP = "Direction indicates whether you expect the price to go up (Bullish) or down (Bearish)";
const DEFAULT_SENTIMENT_TOOLTIP = "Sentiment reflects your overall feeling about the trade based on your analysis";
const DEFAULT_7D_RETRO_TOOLTIP = "7-day review of the trade outcome and lessons learned";
const DEFAULT_30D_RETRO_TOOLTIP = "30-day review to evaluate longer-term trade impact and market behavior";

/**
 * TooltipsSettingsPage Component
 * 
 * Allows users to customize the help text shown when hovering over various fields
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
  const [retro7DTooltip, setRetro7DTooltip] = useState(DEFAULT_7D_RETRO_TOOLTIP);
  const [retro30DTooltip, setRetro30DTooltip] = useState(DEFAULT_30D_RETRO_TOOLTIP);

  /**
   * Updates tooltip text with character limit enforcement
   */
  const handleTooltipChange = (value: string, setter: (value: string) => void) => {
    const trimmedValue = value.slice(0, 50);
    setter(trimmedValue);
  };

  /**
   * Saves the current tooltip settings
   * In a real app, this would persist the values to a database
   */
  const handleSave = () => {
    logger.info('Saving tooltip settings', {
      direction: directionTooltip,
      sentiment: sentimentTooltip,
      retro7D: retro7DTooltip,
      retro30D: retro30DTooltip
    });
    
    // TODO: Implement actual save functionality
    console.log("Saving tooltips:", { 
      directionTooltip, 
      sentimentTooltip,
      retro7DTooltip,
      retro30DTooltip
    });
  };

  // Tooltip input component
  const TooltipInput = ({ 
    id, 
    label, 
    value, 
    onChange 
  }: { 
    id: string; 
    label: string; 
    value: string; 
    onChange: (value: string) => void;
  }) => (
    <div>
      <label className="block text-sm font-medium mb-2" htmlFor={id}>
        {label}
        <span className="text-xs text-muted-foreground ml-2">(50 characters max)</span>
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 text-sm border rounded-md bg-background"
        maxLength={50}
      />
      <p className="text-xs text-muted-foreground mt-1">
        {50 - value.length} characters remaining
      </p>
    </div>
  );

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
          <TooltipInput
            id="directionTooltip"
            label="Direction Help Text"
            value={directionTooltip}
            onChange={(value) => handleTooltipChange(value, setDirectionTooltip)}
          />

          <TooltipInput
            id="sentimentTooltip"
            label="Sentiment Help Text"
            value={sentimentTooltip}
            onChange={(value) => handleTooltipChange(value, setSentimentTooltip)}
          />

          <TooltipInput
            id="retro7DTooltip"
            label="7D Retrospective Help Text"
            value={retro7DTooltip}
            onChange={(value) => handleTooltipChange(value, setRetro7DTooltip)}
          />

          <TooltipInput
            id="retro30DTooltip"
            label="30D Retrospective Help Text"
            value={retro30DTooltip}
            onChange={(value) => handleTooltipChange(value, setRetro30DTooltip)}
          />

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