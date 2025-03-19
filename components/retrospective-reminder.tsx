"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

interface RetrospectiveReminderProps {
  count: number;
  onComplete: () => void;
}

export function RetrospectiveReminder({ count, onComplete }: RetrospectiveReminderProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || count === 0) {
    return null;
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
        <h2 className="font-medium">
          Retrospective Action Required
          {count > 1 && <span className="ml-1">({count} entries)</span>}
        </h2>
      </div>
      <p className="text-sm text-amber-700 mt-1 mb-2">
        You have {count} {count === 1 ? 'entry' : 'entries'} that {count === 1 ? 'requires' : 'require'} a retrospective review.
      </p>
      <button 
        onClick={onComplete}
        className="mt-1 bg-white text-amber-700 border border-amber-300 rounded px-3 py-1 text-sm hover:bg-amber-50"
      >
        Complete Retrospective
      </button>
      <button 
        onClick={() => setIsVisible(false)}
        className="mt-1 ml-2 text-amber-700 rounded px-3 py-1 text-sm hover:bg-amber-100"
      >
        Dismiss
      </button>
    </div>
  );
} 