"use client";

import { useState } from 'react';
import { X, Loader2, Plus, Settings, Trash2 } from 'lucide-react';

interface Strategy {
  id: string;
  name: string;
  tagValue: string;
  sourcingValues?: string[];
  recordingSystem?: string;
  enterCriteria?: string;
  earlyEntryCriteria?: string;
  exitCriteria?: string;
  confirmationCriteria?: string;
  qualityConsiderations?: string;
  qualityCriteria?: string;
  kaizen?: string;
  executionReviewCriteria?: string;
  retrospectivePeriod?: number;
  taggingSystem?: string;
  displayOrder: number;
  isActive: boolean;
}

interface StrategyEditModalProps {
  strategy: Strategy | null;
  onClose: () => void;
  onSave: (strategyId: string | null, data: Partial<Strategy>) => Promise<void>;
  existingNames?: string[];
  availableSources?: string[];
  onAddSource?: (sourceName: string) => Promise<void>;
}

export function StrategyEditModal({ 
  strategy, 
  onClose, 
  onSave, 
  existingNames = [],
  availableSources = [],
  onAddSource
}: StrategyEditModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showAddSourceModal, setShowAddSourceModal] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [formData, setFormData] = useState({
    name: strategy?.name || '',
    tagValue: strategy?.tagValue || '',
    sourcingValues: strategy?.sourcingValues || [],
    recordingSystem: strategy?.recordingSystem || '',
    enterCriteria: strategy?.enterCriteria || '',
    earlyEntryCriteria: strategy?.earlyEntryCriteria || '',
    exitCriteria: strategy?.exitCriteria || '',
    confirmationCriteria: strategy?.confirmationCriteria || '',
    qualityConsiderations: strategy?.qualityConsiderations || '',
    qualityCriteria: strategy?.qualityCriteria || '',
    kaizen: strategy?.kaizen || '',
    executionReviewCriteria: strategy?.executionReviewCriteria || '',
    retrospectivePeriod: strategy?.retrospectivePeriod || 0,
    taggingSystem: strategy?.taggingSystem || '',
    displayOrder: strategy?.displayOrder || 0,
    isActive: strategy?.isActive ?? true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddSourcingValue = (sourceName: string) => {
    if (sourceName && !formData.sourcingValues.includes(sourceName)) {
      setFormData(prev => ({
        ...prev,
        sourcingValues: [...prev.sourcingValues, sourceName]
      }));
    }
  };

  const handleRemoveSourcingValue = (sourceName: string) => {
    setFormData(prev => ({
      ...prev,
      sourcingValues: prev.sourcingValues.filter(s => s !== sourceName)
    }));
  };

  const handleQuickAddSource = async () => {
    if (!newSourceName.trim() || !onAddSource) return;
    
    setIsAddingSource(true);
    try {
      await onAddSource(newSourceName.trim());
      handleAddSourcingValue(newSourceName.trim());
      setNewSourceName('');
      setShowAddSourceModal(false);
    } catch (error) {
      console.error('Error adding source:', error);
    } finally {
      setIsAddingSource(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(strategy ? strategy.id : null, formData);
      onClose();
    } catch (error) {
      console.error('Error saving strategy:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isDuplicate = !strategy && existingNames.some(
    n => n.trim().toLowerCase() === formData.name.trim().toLowerCase()
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center overflow-y-auto">
      <div className="bg-background p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{strategy ? 'Edit Strategy' : 'Add Strategy'}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              />
            </div>

            <div>
              <label htmlFor="tagValue" className="block text-sm font-medium mb-1">
                Tag Value *
              </label>
              <input
                type="text"
                id="tagValue"
                name="tagValue"
                value={formData.tagValue}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Sourcing Values
              </label>
              <div className="space-y-2">
                {/* Selected Sources */}
                {formData.sourcingValues.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.sourcingValues.map(source => (
                      <span
                        key={source}
                        className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                      >
                        {source}
                        <button
                          type="button"
                          onClick={() => handleRemoveSourcingValue(source)}
                          className="ml-1 text-primary/70 hover:text-primary"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Add Source Dropdown */}
                <div className="flex gap-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddSourcingValue(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="flex-1 px-3 py-2 border rounded-md bg-background"
                    defaultValue=""
                  >
                    <option value="">Add a source...</option>
                    {availableSources
                      .filter(source => !formData.sourcingValues.includes(source))
                      .map(source => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                  </select>
                  
                  {onAddSource && (
                    <button
                      type="button"
                      onClick={() => setShowAddSourceModal(true)}
                      className="px-3 py-2 border border-primary text-primary rounded-md hover:bg-primary/10 flex items-center gap-1"
                      title="Quick add new source"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="displayOrder" className="block text-sm font-medium mb-1">
                Display Order
              </label>
              <input
                type="number"
                id="displayOrder"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-background"
                min="0"
              />
            </div>

            <div>
              <label htmlFor="retrospectivePeriod" className="block text-sm font-medium mb-1">
                Retrospective Period (days)
              </label>
              <input
                type="number"
                id="retrospectivePeriod"
                name="retrospectivePeriod"
                value={formData.retrospectivePeriod}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md bg-background"
                min="0"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="rounded border-gray-300"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Active
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="recordingSystem" className="block text-sm font-medium mb-1">
              Recording System
            </label>
            <textarea
              id="recordingSystem"
              name="recordingSystem"
              value={formData.recordingSystem}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-background"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="enterCriteria" className="block text-sm font-medium mb-1">
              Enter Criteria
            </label>
            <textarea
              id="enterCriteria"
              name="enterCriteria"
              value={formData.enterCriteria}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-background"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="earlyEntryCriteria" className="block text-sm font-medium mb-1">
              Early Entry Criteria
            </label>
            <textarea
              id="earlyEntryCriteria"
              name="earlyEntryCriteria"
              value={formData.earlyEntryCriteria}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-background"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="exitCriteria" className="block text-sm font-medium mb-1">
              Exit Criteria
            </label>
            <textarea
              id="exitCriteria"
              name="exitCriteria"
              value={formData.exitCriteria}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-background"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="confirmationCriteria" className="block text-sm font-medium mb-1">
              Confirmation Criteria
            </label>
            <textarea
              id="confirmationCriteria"
              name="confirmationCriteria"
              value={formData.confirmationCriteria}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-background"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="qualityConsiderations" className="block text-sm font-medium mb-1">
              Quality Considerations
            </label>
            <textarea
              id="qualityConsiderations"
              name="qualityConsiderations"
              value={formData.qualityConsiderations}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-background"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="qualityCriteria" className="block text-sm font-medium mb-1">
              Quality Criteria
            </label>
            <textarea
              id="qualityCriteria"
              name="qualityCriteria"
              value={formData.qualityCriteria}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-background"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="kaizen" className="block text-sm font-medium mb-1">
              Kaizen
            </label>
            <textarea
              id="kaizen"
              name="kaizen"
              value={formData.kaizen}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-background"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="executionReviewCriteria" className="block text-sm font-medium mb-1">
              Execution Review Criteria
            </label>
            <textarea
              id="executionReviewCriteria"
              name="executionReviewCriteria"
              value={formData.executionReviewCriteria}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-background"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="taggingSystem" className="block text-sm font-medium mb-1">
              Tagging System
            </label>
            <textarea
              id="taggingSystem"
              name="taggingSystem"
              value={formData.taggingSystem}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-background"
              rows={3}
            />
          </div>

          {isDuplicate && (
            <div className="text-destructive text-sm">A strategy with this name already exists.</div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isDuplicate}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                strategy ? 'Save Changes' : 'Add Strategy'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Quick Add Source Modal */}
      {showAddSourceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Quick Add Source</h3>
              <button
                onClick={() => setShowAddSourceModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="newSourceName" className="block text-sm font-medium mb-1">
                  Source Name
                </label>
                <input
                  type="text"
                  id="newSourceName"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="Enter source name..."
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSourceModal(false)}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleQuickAddSource}
                  disabled={!newSourceName.trim() || isAddingSource}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {isAddingSource ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Add Source'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
