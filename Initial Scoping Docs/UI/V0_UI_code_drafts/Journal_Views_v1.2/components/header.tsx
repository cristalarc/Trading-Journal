import { Bell, User } from 'lucide-react'
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="bg-white border-b p-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold">Journal Entries</h2>
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon">
          <Bell size={20} />
        </Button>
        <Button variant="outline" size="icon">
          <User size={20} />
        </Button>
      </div>
    </header>
  )
}

