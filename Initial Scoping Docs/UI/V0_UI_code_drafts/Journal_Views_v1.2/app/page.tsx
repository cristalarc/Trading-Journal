import { JournalFilters } from "@/components/journal-filters"
import { RetrospectiveAlert } from "@/components/retrospective-alert"
import { JournalTable } from "@/components/journal-table"

export default function Home() {
  return (
    <div className="space-y-6 p-6">
      <RetrospectiveAlert />
      <JournalFilters />
      <JournalTable />
    </div>
  )
}

