import { JournalFilters } from "@/components/journal-filters"
import { RetrospectiveAlert } from "@/components/retrospective-alert"
import { JournalList } from "@/components/journal-list"

export default function Home() {
  return (
    <div>
      <RetrospectiveAlert />
      <JournalFilters />
      <JournalList />
    </div>
  )
}

