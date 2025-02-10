import React, { useState, useEffect, useRef } from 'react'
import { X, HelpCircle, Settings } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

type EntryCardProps = {
  entry: Entry | null
  onSave: (entry: Entry) => void
  onClose: () => void
}

export function EntryCard({ entry, onSave, onClose }: EntryCardProps) {
  const [formData, setFormData] = useState<Entry>(entry || {
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0],
    ticker: '',
    price: 0,
    timeframe: 'Daily',
    direction: 'bullish',
    sentiment: 'neutral',
    pattern: '',
    support: 0,
    resistance: 0,
    retro7d: 'pending',
    retro30d: 'pending'
  })

  const tickerRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (tickerRef.current) {
      tickerRef.current.focus()
    }
  }, [])

  const handleChange = (field: keyof Entry, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if (formData.ticker.trim() === '') {
      alert('Please enter a ticker name')
      return
    }
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            {entry ? 'Edit Entry' : 'New Entry'}
            <Button variant="ghost" size="sm" onClick={onClose}><X size={20} /></Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ticker">Ticker</Label>
              <Input
                id="ticker"
                ref={tickerRef}
                value={formData.ticker}
                onChange={(e) => handleChange('ticker', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="timeframe">Timeframe</Label>
              <Select
                value={formData.timeframe}
                onValueChange={(value) => handleChange('timeframe', value)}
              >
                <SelectTrigger id="timeframe">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hourly">Hourly</SelectItem>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label htmlFor="direction" className="flex items-center">
                      Direction <HelpCircle size={14} className="ml-1" />
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Expected price movement: Bullish (up) or Bearish (down)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Select
                value={formData.direction}
                onValueChange={(value) => handleChange('direction', value)}
              >
                <SelectTrigger id="direction">
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bullish">Bullish</SelectItem>
                  <SelectItem value="bearish">Bearish</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label htmlFor="sentiment" className="flex items-center">
                      Sentiment <HelpCircle size={14} className="ml-1" />
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Overall market feeling towards the asset</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Select
                value={formData.sentiment}
                onValueChange={(value) => handleChange('sentiment', value)}
              >
                <SelectTrigger id="sentiment">
                  <SelectValue placeholder="Select sentiment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label htmlFor="pattern" className="flex items-center">
                      Pattern <Settings size={14} className="ml-1" />
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Configure pattern options in Settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Select
                value={formData.pattern}
                onValueChange={(value) => handleChange('pattern', value)}
              >
                <SelectTrigger id="pattern">
                  <SelectValue placeholder="Select pattern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cup and Handle">Cup and Handle</SelectItem>
                  <SelectItem value="Head and Shoulders">Head and Shoulders</SelectItem>
                  <SelectItem value="Flag">Flag</SelectItem>
                  <SelectItem value="Triangle">Triangle</SelectItem>
                  <SelectItem value="Double Top">Double Top</SelectItem>
                  <SelectItem value="Double Bottom">Double Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="support">Support</Label>
              <Input
                id="support"
                type="number"
                value={formData.support}
                onChange={(e) => handleChange('support', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="resistance">Resistance</Label>
              <Input
                id="resistance"
                type="number"
                value={formData.resistance}
                onChange={(e) => handleChange('resistance', parseFloat(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave}>Save</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

