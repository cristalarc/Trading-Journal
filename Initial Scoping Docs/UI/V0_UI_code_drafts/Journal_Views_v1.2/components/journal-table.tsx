'use client'

import * as React from 'react'
import { useState } from 'react'
import { ChevronDown, ChevronRight, Edit, Eye, HelpCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { JournalEntryDetails } from './journal-entry-details'

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
}

const dummyData: Entry[] = [
  { id: '1', date: '2023-06-15', ticker: 'AAPL', price: 150.25, timeframe: 'Daily', direction: 'bullish', sentiment: 'positive', pattern: 'Cup and Handle', support: 148.50, resistance: 152.00, retro7d: 'completed', retro30d: 'pending' },
  { id: '2', date: '2023-06-14', ticker: 'GOOGL', price: 2500.75, timeframe: 'Weekly', direction: 'bearish', sentiment: 'negative', pattern: 'Head and Shoulders', support: 2450.00, resistance: 2550.00, retro7d: 'pending', retro30d: 'pending' },
  { id: '3', date: '2023-06-13', ticker: 'TSLA', price: 750.50, timeframe: 'Hourly', direction: 'bullish', sentiment: 'neutral', pattern: 'Flag', support: 745.00, resistance: 755.00, retro7d: 'overdue', retro30d: 'pending' },
]

export function JournalTable() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [entries, setEntries] = useState<Entry[]>(dummyData)

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  const getRetroStatus = (status: 'pending' | 'completed' | 'overdue') => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-200 text-yellow-800'
      case 'completed':
        return 'bg-green-200 text-green-800'
      case 'overdue':
        return 'bg-red-200 text-red-800'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => setEntries([...entries, { id: (entries.length + 1).toString(), date: new Date().toISOString().split('T')[0], ticker: '', price: 0, timeframe: 'Daily', direction: 'bullish', sentiment: 'neutral', pattern: '', support: 0, resistance: 0, retro7d: 'pending', retro30d: 'pending' }])}>
        Add New Entry
      </Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Ticker</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Timeframe</TableHead>
            <TableHead>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center">
                      Direction
                      <HelpCircle size={14} className="ml-1" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Expected price movement: Bullish (up) or Bearish (down)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center">
                      Sentiment
                      <HelpCircle size={14} className="ml-1" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Overall market feeling towards the asset</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead>Pattern</TableHead>
            <TableHead>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center">
                      7D Retro
                      <HelpCircle size={14} className="ml-1" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>7-day review of the trade outcome</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center">
                      30D Retro
                      <HelpCircle size={14} className="ml-1" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>30-day review of the trade outcome</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <React.Fragment key={entry.id}>
              <TableRow>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => toggleRow(entry.id)}>
                    {expandedRow === entry.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </Button>
                </TableCell>
                <TableCell>{entry.date}</TableCell>
                <TableCell>{entry.ticker}</TableCell>
                <TableCell>${entry.price.toFixed(2)}</TableCell>
                <TableCell>{entry.timeframe}</TableCell>
                <TableCell>{entry.direction}</TableCell>
                <TableCell>{entry.sentiment}</TableCell>
                <TableCell>{entry.pattern}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRetroStatus(entry.retro7d)}`}>
                    {entry.retro7d}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRetroStatus(entry.retro30d)}`}>
                    {entry.retro30d}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm"><Edit size={16} /></Button>
                    <Button variant="ghost" size="sm"><Eye size={16} /></Button>
                  </div>
                </TableCell>
              </TableRow>
              {expandedRow === entry.id && (
                <TableRow>
                  <TableCell colSpan={11}>
                    <JournalEntryDetails entry={entry} />
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

