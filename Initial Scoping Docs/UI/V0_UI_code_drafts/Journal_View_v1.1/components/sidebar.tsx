import Link from "next/link"
import { BookOpen, BarChart2, FileText, Search } from 'lucide-react'

export function Sidebar() {
  return (
    <div className="w-64 bg-gray-100 h-screen p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-8">Trading Journal</h1>
      <nav className="space-y-4">
        <Link href="/" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
          <BookOpen size={20} />
          <span>Journal</span>
        </Link>
        <Link href="/weekly-one-pager" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
          <FileText size={20} />
          <span>Weekly One Pager</span>
        </Link>
        <Link href="/analytics" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
          <BarChart2 size={20} />
          <span>Analytics</span>
        </Link>
      </nav>
      <div className="mt-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Search entries..."
            className="w-full p-2 pl-8 rounded border border-gray-300"
          />
          <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
        </div>
      </div>
    </div>
  )
}

