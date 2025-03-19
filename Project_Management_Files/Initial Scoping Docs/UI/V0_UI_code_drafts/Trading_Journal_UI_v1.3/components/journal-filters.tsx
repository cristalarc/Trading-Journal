import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RefreshCw } from 'lucide-react'

type Filters = {
  timeframe: string
  ticker: string
  week: string
  sentiment: string
  retroStatus: string
}

const initialFilters: Filters = {
  timeframe: 'daily',
  ticker: '',
  week: '',
  sentiment: '',
  retroStatus: ''
}

export function JournalFilters() {
  const [filters, setFilters] = useState<Filters>(initialFilters)

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters(initialFilters)
  }

  return (
    <div className="mb-6 space-y-4">
      <div className="flex justify-between items-center">
        <Tabs value={filters.timeframe} onValueChange={(value) => handleFilterChange('timeframe', value)}>
          <TabsList>
            <TabsTrigger value="hourly">Hourly</TabsTrigger>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" size="sm" onClick={resetFilters}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset Filters
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="ticker-filter">Ticker</Label>
          <Input
            id="ticker-filter"
            placeholder="Enter ticker"
            value={filters.ticker}
            onChange={(e) => handleFilterChange('ticker', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="week-filter">Week</Label>
          <Input
            type="week"
            id="week-filter"
            value={filters.week}
            onChange={(e) => handleFilterChange('week', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="sentiment-filter">Sentiment</Label>
          <Select value={filters.sentiment} onValueChange={(value) => handleFilterChange('sentiment', value)}>
            <SelectTrigger id="sentiment-filter">
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
          <Label htmlFor="retrospective-filter">Retrospective Status</Label>
          <Select value={filters.retroStatus} onValueChange={(value) => handleFilterChange('retroStatus', value)}>
            <SelectTrigger id="retrospective-filter">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

