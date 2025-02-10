import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TimeTable } from "./time-table"

interface SidepanelProps {
  isOpen: boolean
  onClose: () => void
  ticker: string
  comments: {
    id: string
    date: string
    timeframe: "Weekly" | "Daily" | "Hourly"
    comment: string
  }[]
}

export function Sidepanel({ isOpen, onClose, ticker, comments }: SidepanelProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 w-1/2 bg-white shadow-lg z-50 transition-transform duration-300 transform translate-x-0">
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{ticker} Time Table</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={24} />
          </Button>
        </div>
        <div className="flex-grow overflow-hidden">
          <TimeTable comments={comments} />
        </div>
      </div>
    </div>
  )
}

