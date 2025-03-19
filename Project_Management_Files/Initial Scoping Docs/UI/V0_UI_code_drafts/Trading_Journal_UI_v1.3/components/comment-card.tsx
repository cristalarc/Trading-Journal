"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

interface CommentCardProps {
  date: string
  comment: string
  timeframe: "Weekly" | "Daily" | "Hourly"
}

export function CommentCard({ date, comment, timeframe }: CommentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="mb-2">
      <CardHeader className="p-3">
        <CardTitle className="text-sm flex justify-between items-center">
          <span>{date}</span>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className={`p-3 ${isExpanded ? "" : "hidden"}`}>
        <p className={`text-sm ${timeframe === "Weekly" ? "font-medium" : ""}`}>{comment}</p>
      </CardContent>
    </Card>
  )
}

