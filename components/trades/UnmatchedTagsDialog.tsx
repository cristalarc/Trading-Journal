"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface UnmatchedTag {
  name: string;
  suggestedType: 'pattern' | 'strategy' | 'source' | 'tag';
}

interface UnmatchedTagsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unmatchedTags: UnmatchedTag[];
  onComplete: () => void;
}

interface TagCreationData {
  name: string;
  type: 'pattern' | 'strategy' | 'source' | 'tag';
  category?: string;
  tagValue?: string;
  description?: string;
}

export function UnmatchedTagsDialog({
  open,
  onOpenChange,
  unmatchedTags,
  onComplete
}: UnmatchedTagsDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [createdTags, setCreatedTags] = useState<string[]>([]);
  const [skippedTags, setSkippedTags] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TagCreationData>({
    name: unmatchedTags[0]?.name || '',
    type: unmatchedTags[0]?.suggestedType || 'tag',
    category: 'Setup',
    tagValue: '',
    description: ''
  });

  const currentTag = unmatchedTags[currentIndex];
  const isLastTag = currentIndex === unmatchedTags.length - 1;
  const progress = `${currentIndex + 1} / ${unmatchedTags.length}`;

  const resetForm = (tag: UnmatchedTag) => {
    setFormData({
      name: tag.name,
      type: tag.suggestedType,
      category: 'Setup',
      tagValue: tag.name.toLowerCase().replace(/\s+/g, '-'),
      description: ''
    });
    setError(null);
  };

  const handleSkip = () => {
    setSkippedTags([...skippedTags, currentTag.name]);

    if (isLastTag) {
      onComplete();
      onOpenChange(false);
      resetState();
    } else {
      setCurrentIndex(currentIndex + 1);
      resetForm(unmatchedTags[currentIndex + 1]);
    }
  };

  const handleCreate = async () => {
    setIsCreating(true);
    setError(null);

    try {
      let endpoint = '';
      let body: any = {
        name: formData.name,
        description: formData.description
      };

      switch (formData.type) {
        case 'tag':
          endpoint = '/api/config/tags/create';
          body.category = formData.category;
          body.pendingReview = true; // Mark tags created via import as pending review
          break;
        case 'pattern':
          endpoint = '/api/config/patterns/create';
          // Patterns are quick to set up, no pending review needed
          break;
        case 'strategy':
          endpoint = '/api/config/strategies/create';
          body.tagValue = formData.tagValue || formData.name.toLowerCase().replace(/\s+/g, '-');
          body.pendingReview = true; // Mark strategies created via import as pending review
          break;
        case 'source':
          endpoint = '/api/config/sources/create';
          // Sources are quick to set up, no pending review needed
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create tag');
      }

      setCreatedTags([...createdTags, currentTag.name]);

      if (isLastTag) {
        onComplete();
        onOpenChange(false);
        resetState();
      } else {
        setCurrentIndex(currentIndex + 1);
        resetForm(unmatchedTags[currentIndex + 1]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tag');
    } finally {
      setIsCreating(false);
    }
  };

  const resetState = () => {
    setCurrentIndex(0);
    setCreatedTags([]);
    setSkippedTags([]);
    if (unmatchedTags.length > 0) {
      resetForm(unmatchedTags[0]);
    }
  };

  if (unmatchedTags.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Unmatched Tags</DialogTitle>
          <DialogDescription>
            The following tags from your import file don't match any existing tags in your system.
            Create them now or skip to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Progress: {progress}</span>
            <div className="flex gap-4">
              <span className="text-green-600">
                <CheckCircle className="h-4 w-4 inline mr-1" />
                {createdTags.length} created
              </span>
              <span className="text-gray-500">
                {skippedTags.length} skipped
              </span>
            </div>
          </div>

          {/* Current Tag */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">
                Unmatched Tag: "{currentTag?.name}"
              </span>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter tag name"
              />
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tag">Tag</SelectItem>
                  <SelectItem value="pattern">Pattern</SelectItem>
                  <SelectItem value="strategy">Strategy</SelectItem>
                  <SelectItem value="source">Source</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'tag' && (
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Setup">Setup</SelectItem>
                    <SelectItem value="Mistake">Mistake</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.type === 'strategy' && (
              <div>
                <Label htmlFor="tagValue">Tag Value (URL-friendly)</Label>
                <Input
                  id="tagValue"
                  value={formData.tagValue}
                  onChange={(e) => setFormData({ ...formData, tagValue: e.target.value })}
                  placeholder="e.g., momentum-breakout"
                />
              </div>
            )}

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
                rows={3}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isCreating}
          >
            Skip
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || !formData.name}
          >
            {isCreating ? 'Creating...' : 'Create & Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
