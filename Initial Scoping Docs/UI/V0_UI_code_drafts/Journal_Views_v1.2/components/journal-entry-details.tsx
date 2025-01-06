'use client'

import { useState, useEffect } from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

type Entry = {
  id: string
  date: string
  ticker: string
  price: number
  timeframe: string
  direction: 'bullish' | 'bearish'
  sentiment: 'positive' | 'negative' | 'neutral'
  pattern: string
  support: number
  resistance: number
  retro7d: 'pending' | 'completed' | 'overdue'
  retro30d: 'pending' | 'completed' | 'overdue'
  comments?: string
}

type JournalEntryDetailsProps = {
  entry: Entry
  onUpdate: (updatedEntry: Entry) => void
}

export function JournalEntryDetails({ entry, onUpdate }: JournalEntryDetailsProps) {
  const [localEntry, setLocalEntry] = useState(entry)
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (field: keyof Entry, value: string | number) => {
    setLocalEntry(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    setIsSaving(true)
    onUpdate(localEntry)
    setTimeout(() => {
      setIsSaving(false)
    }, 500) // Reset after 500ms
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div>
        <Label htmlFor="support">Support Level</Label>
        <Input
          id="support"
          type="number"
          step="0.01"
          value={localEntry.support}
          onChange={(e) => handleChange('support', parseFloat(e.target.value))}
        />
      </div>
      <div>
        <Label htmlFor="resistance">Resistance Level</Label>
        <Input
          id="resistance"
          type="number"
          step="0.01"
          value={localEntry.resistance}
          onChange={(e) => handleChange('resistance', parseFloat(e.target.value))}
        />
      </div>
      <div className="col-span-2">
        <Label htmlFor="comments">Comments</Label>
        <Textarea
          id="comments"
          placeholder="Add your comments here..."
          value={localEntry.comments || ''}
          onChange={(e) => handleChange('comments', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="7d-retro">7D Retrospective</Label>
        <Select
          value={localEntry.retro7d}
          onValueChange={(value) => handleChange('retro7d', value)}
        >
          <SelectTrigger id="7d-retro">
            <SelectValue placeholder="7D Retro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="30d-retro">30D Retrospective</Label>
        <Select
          value={localEntry.retro30d}
          onValueChange={(value) => handleChange('retro30d', value)}
        >
          <SelectTrigger id="30d-retro">
            <SelectValue placeholder="30D Retro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className={`transition-all duration-200 ${isSaving ? 'scale-95 opacity-80' : ''}`}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}

