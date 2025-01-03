'use client'

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Entry = {
  id: string
  date: string
  ticker: string
  price: number
  direction: 'bullish' | 'bearish'
  sentiment: 'positive' | 'negative' | 'neutral'
  pattern: string
  retro7d: 'pending' | 'completed' | 'overdue'
  retro30d: 'pending' | 'completed' | 'overdue'
}

export function JournalEntryDetails({ entry }: { entry: Entry }) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div>
        <Label htmlFor="support-resistance">Support/Resistance Levels</Label>
        <Input id="support-resistance" placeholder="Enter levels" />
      </div>
      <div>
        <Label htmlFor="comments">Comments</Label>
        <Textarea id="comments" placeholder="Add your comments here..." />
      </div>
      <div>
        <Label htmlFor="7d-retro">7D Retrospective</Label>
        <Select defaultValue={entry.retro7d}>
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
        <Select defaultValue={entry.retro30d}>
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
    </div>
  )
}

