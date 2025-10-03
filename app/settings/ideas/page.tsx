"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Save, Plus, Trash2, Loader2 } from "lucide-react";
import { createLogger } from "@/lib/logger";

const logger = createLogger('IdeasSettingsPage');

interface IdeasSettings {
  expiryDays: number;
  stockMultipliers: Array<{
    id: string;
    ticker: string;
    multiplier: number;
  }>;
}

/**
 * IdeasSettingsPage Component
 * 
 * Settings page for Ideas configuration:
 * - Ideas expiry settings (default 365 days)
 * - Stock multiplier settings for futures (ES, MES, etc.)
 */
export default function IdeasSettingsPage() {
  logger.debug('Initializing IdeasSettingsPage component');

  const [settings, setSettings] = useState<IdeasSettings>({
    expiryDays: 365,
    stockMultipliers: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New stock multiplier form
  const [newMultiplier, setNewMultiplier] = useState({
    ticker: '',
    multiplier: ''
  });

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/ideas/settings');
        if (!response.ok) {
          throw new Error('Failed to fetch ideas settings');
        }
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching ideas settings:', error);
        setError('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Save settings
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/ideas/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setSuccess('Settings saved successfully');
      logger.info('Ideas settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      setError(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Add new stock multiplier
  const handleAddMultiplier = () => {
    if (!newMultiplier.ticker || !newMultiplier.multiplier) {
      setError('Please enter both ticker and multiplier');
      return;
    }

    const multiplier = parseFloat(newMultiplier.multiplier);
    if (isNaN(multiplier) || multiplier <= 0) {
      setError('Multiplier must be a positive number');
      return;
    }

    // Check if ticker already exists
    if (settings.stockMultipliers.some(sm => sm.ticker === newMultiplier.ticker.toUpperCase())) {
      setError('Ticker already exists');
      return;
    }

    setSettings(prev => ({
      ...prev,
      stockMultipliers: [
        ...prev.stockMultipliers,
        {
          id: `temp-${Date.now()}`,
          ticker: newMultiplier.ticker.toUpperCase(),
          multiplier
        }
      ]
    }));

    setNewMultiplier({ ticker: '', multiplier: '' });
    setError(null);
  };

  // Remove stock multiplier
  const handleRemoveMultiplier = (id: string) => {
    setSettings(prev => ({
      ...prev,
      stockMultipliers: prev.stockMultipliers.filter(sm => sm.id !== id)
    }));
  };

  // Update expiry days
  const handleExpiryDaysChange = (days: number) => {
    setSettings(prev => ({
      ...prev,
      expiryDays: days
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center mb-6">
        <Link 
          href="/settings" 
          className="text-primary hover:underline flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Settings
        </Link>
        <h1 className="text-3xl font-bold ml-4">Ideas Settings</h1>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      <div className="space-y-6">
        {/* Ideas Expiry Settings */}
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Ideas Expiry Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Ideas Expiry (Days)
              </label>
              <input
                type="number"
                min="1"
                max="3650"
                value={settings.expiryDays}
                onChange={(e) => handleExpiryDaysChange(parseInt(e.target.value) || 365)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Ideas will automatically expire after this many days from creation. Default is 365 days (1 year).
              </p>
            </div>
          </div>
        </div>

        {/* Stock Multiplier Settings */}
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Stock Multiplier Settings</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Configure multipliers for futures and other instruments where each dollar movement has a different value.
            For example, MES has a $5 multiplier per point, and ES has a $50 multiplier per point.
          </p>

          {/* Add new multiplier form */}
          <div className="bg-muted/30 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-medium mb-3">Add New Stock Multiplier</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ticker</label>
                <input
                  type="text"
                  placeholder="e.g., MES, ES"
                  value={newMultiplier.ticker}
                  onChange={(e) => setNewMultiplier(prev => ({ ...prev, ticker: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Multiplier</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 5, 50"
                  value={newMultiplier.multiplier}
                  onChange={(e) => setNewMultiplier(prev => ({ ...prev, multiplier: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddMultiplier}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Current multipliers list */}
          <div>
            <h3 className="text-lg font-medium mb-3">Current Stock Multipliers</h3>
            {settings.stockMultipliers.length === 0 ? (
              <p className="text-muted-foreground">No stock multipliers configured.</p>
            ) : (
              <div className="space-y-2">
                {settings.stockMultipliers.map((multiplier) => (
                  <div key={multiplier.id} className="flex items-center justify-between bg-muted/30 p-3 rounded-md">
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{multiplier.ticker}</span>
                      <span className="text-muted-foreground">× {multiplier.multiplier}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveMultiplier(multiplier.id)}
                      className="text-destructive hover:text-destructive/80 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
