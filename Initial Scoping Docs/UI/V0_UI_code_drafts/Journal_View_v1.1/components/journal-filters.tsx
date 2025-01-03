import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function JournalFilters() {
  return (
    <div className="mb-6">
      <Tabs defaultValue="daily" className="mb-4">
        <TabsList>
          <TabsTrigger value="hourly">Hourly</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="ticker-filter">Ticker</Label>
          <Input id="ticker-filter" placeholder="Enter ticker" />
        </div>
        <div>
          <Label htmlFor="week-filter">Week</Label>
          <Input type="week" id="week-filter" />
        </div>
        <div>
          <Label htmlFor="sentiment-filter">Sentiment</Label>
          <Select>
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
          <Select>
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

