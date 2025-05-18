"use client";

import { useState } from "react";
import { useJournalEntries } from "@/lib/hooks/useJournalEntries";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, X } from "lucide-react";

interface TimeTablePanelProps {
  ticker: string;
  onClose: () => void;
}

export function TimeTablePanel({ ticker, onClose }: TimeTablePanelProps) {
  const { entries } = useJournalEntries({ ticker });
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpanded(expanded =>
      expanded.includes(id) ? expanded.filter(eid => eid !== id) : [...expanded, id]
    );
  };

  const monthly = entries.filter(e => e.timeframe?.name === "Monthly");
  const weekly = entries.filter(e => e.timeframe?.name === "Weekly");
  const daily = entries.filter(e => e.timeframe?.name === "Daily");
  const hourly = entries.filter(e => e.timeframe?.name === "Hourly");

  const columns: [string, typeof entries][] = [
    ["Monthly", monthly],
    ["Weekly", weekly],
    ["Daily", daily],
    ["Hourly", hourly],
  ];

  return (
    <div className="fixed top-0 right-0 w-full md:w-3/4 h-full bg-white shadow-lg z-50 overflow-y-auto transition-transform duration-300">
      <div className="flex justify-between items-center mb-6 border-b pb-4 p-6">
        <h2 className="text-2xl font-bold">{ticker} Time Table</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
        {columns.map(([label, arr]) => (
          <div key={label}>
            <h3 className="font-semibold mb-2">{label}</h3>
            {arr.length === 0 && <div className="text-muted-foreground text-sm">No entries</div>}
            <div className="flex flex-col gap-2">
              {arr.map(entry => (
                <div key={entry.id} className="border rounded p-3 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span>{format(new Date(entry.entryDate), "yyyy-MM-dd")}</span>
                    <button onClick={() => toggleExpand(entry.id)}>
                      {expanded.includes(entry.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                  {expanded.includes(entry.id) && (
                    <div className="mt-2 text-sm text-gray-700">{entry.comments || "No comments"}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 