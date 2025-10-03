"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createLogger } from "@/lib/logger";

const logger = createLogger('SettingsPage');

/**
 * SettingsPage Component
 * 
 * Main settings page that provides access to various configuration options:
 * - Trading Patterns: Manage available patterns for journal entries
 * - Timeframes: Configure available timeframes for analysis
 * - Help Tooltips: Customize help text for various fields
 * 
 * Each section links to its own dedicated management page for detailed configuration.
 */
export default function SettingsPage() {
  logger.debug('Initializing SettingsPage component');

  // Log page render with basic information
  logger.info('Rendering settings page');

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center mb-6">
        <Link 
          href="/" 
          className="text-primary hover:underline flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Journal
        </Link>
        <h1 className="text-3xl font-bold ml-4">Settings</h1>
      </div>

      {/* Trading Configuration Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Trading Configuration</h2>
          <p className="text-muted-foreground mb-6">
            Configure the core elements that define your trading approach: patterns, timeframes, sources, strategies, and tags.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Trading Patterns Configuration Section */}
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Trading Patterns</h3>
              <Link
                href="/settings/patterns"
                className="text-sm text-primary hover:underline"
                onClick={() => logger.debug('Navigating to patterns settings')}
              >
                Manage Patterns
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure the available trading patterns that can be selected when creating or editing journal entries.
            </p>
          </div>

          {/* Timeframes Configuration Section */}
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Timeframes</h3>
              <Link
                href="/settings/timeframes"
                className="text-sm text-primary hover:underline"
                onClick={() => logger.debug('Navigating to timeframes settings')}
              >
                Manage Timeframes
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure the available timeframes that can be selected when creating or editing journal entries.
            </p>
          </div>

          {/* Sources Configuration Section */}
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Sources</h3>
              <Link
                href="/settings/sources"
                className="text-sm text-primary hover:underline"
                onClick={() => logger.debug('Navigating to sources settings')}
              >
                Manage Sources
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure the available sources of trading ideas (e.g., Twitter, Journal, etc.) for tagging and tracking.
            </p>
          </div>

          {/* Strategies Configuration Section */}
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Strategies</h3>
              <Link
                href="/settings/strategies"
                className="text-sm text-primary hover:underline"
                onClick={() => logger.debug('Navigating to strategies settings')}
              >
                Manage Strategies
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Define your trading strategies with entry/exit criteria, risk management rules, and retrospective periods.
            </p>
          </div>

          {/* Tags Configuration Section */}
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Tags</h3>
              <Link
                href="/settings/tags"
                className="text-sm text-primary hover:underline"
                onClick={() => logger.debug('Navigating to tags settings')}
              >
                Manage Tags
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Create and manage text descriptors that will be attached to trades when developing the Trade Log.
            </p>
          </div>
        </div>
      </div>

      {/* Additional Configuration Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Additional Configuration</h2>
          <p className="text-muted-foreground mb-6">
            Configure additional settings for ideas management and user interface customization.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ideas Configuration Section */}
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ideas Settings</h3>
              <Link
                href="/settings/ideas"
                className="text-sm text-primary hover:underline"
                onClick={() => logger.debug('Navigating to ideas settings')}
              >
                Manage Ideas Settings
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure ideas expiry settings and stock multipliers for futures trading (ES, MES, etc.).
            </p>
          </div>

          {/* Help Tooltips Configuration Section */}
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Help Tooltips</h3>
              <Link
                href="/settings/tooltips"
                className="text-sm text-primary hover:underline"
                onClick={() => logger.debug('Navigating to tooltips settings')}
              >
                Edit Tooltips
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Customize the help text shown when hovering over Direction and Sentiment fields.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 