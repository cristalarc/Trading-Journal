'use client'

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function JournalEntry({ isNew = false }) {
  const [isEditing, setIsEditing] = useState(isNew)

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{isNew ? "New Entry" : "AAPL - Daily"}</span>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Save" : "Edit"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="entry-date">Entry Date</Label>
            <Input type="date" id="entry-date" defaultValue="2023-06-15" disabled={!isEditing} />
          </div>
          <div>
            <Label htmlFor="current-price">Current Price</Label>
            <Input type="number" id="current-price" defaultValue="150.25" disabled={!isEditing} />
          </div>
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label htmlFor="direction">Direction</Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Indicates the expected price movement</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Select disabled={!isEditing}>
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
                  <Label htmlFor="sentiment">Sentiment</Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Overall market feeling towards the asset</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Select disabled={!isEditing}>
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
            <Label htmlFor="governing-pattern">Governing Pattern</Label>
            <Input id="governing-pattern" placeholder="Enter governing pattern" disabled={!isEditing} />
          </div>
          <div>
            <Label htmlFor="support-resistance">Support/Resistance Levels</Label>
            <Input id="support-resistance" placeholder="Enter levels" disabled={!isEditing} />
          </div>
          <div className="col-span-2">
            <Label htmlFor="comments">Comments</Label>
            <Textarea id="comments" placeholder="Add your comments here..." disabled={!isEditing} />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-2">
          <Switch id="weekly-one-pager" disabled={!isEditing} />
          <Label htmlFor="weekly-one-pager">Include in Weekly One Pager</Label>
        </div>
        <div className="flex items-center space-x-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Label htmlFor="7d-retro">7D Retrospective</Label>
                  <Select disabled={!isEditing}>
                    <SelectTrigger id="7d-retro" className="w-[130px]">
                      <SelectValue placeholder="7D Retro" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>7-day review of the trade outcome</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Label htmlFor="30d-retro">30D Retrospective</Label>
                  <Select disabled={!isEditing}>
                    <SelectTrigger id="30d-retro" className="w-[130px]">
                      <SelectValue placeholder="30D Retro" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>30-day review of the trade outcome</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button variant="outline" size="sm">View Retrospective</Button>
      </CardFooter>
    </Card>
  )
}

