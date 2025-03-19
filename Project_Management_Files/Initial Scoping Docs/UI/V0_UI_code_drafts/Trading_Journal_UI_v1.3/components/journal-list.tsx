'use client'

import { useState } from "react"
import { JournalEntry } from "./journal-entry"
import { Button } from "@/components/ui/button"

export function JournalList() {
  const [entries, setEntries] = useState([{}, {}, {}])
  const [showNewEntry, setShowNewEntry] = useState(false)

  const handleCreateEntry = () => {
    setShowNewEntry(true)
  }

  return (
    <div>
      <div className="mb-4">
        <Button onClick={handleCreateEntry}>Create New Entry</Button>
      </div>
      {showNewEntry && <JournalEntry isNew={true} />}
      {entries.map((_, index) => (
        <JournalEntry key={index} />
      ))}
    </div>
  )
}

