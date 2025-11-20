"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, BarChart2, Settings, FileText, Lightbulb, TrendingUp } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path;
  };
  
  return (
    <nav className="bg-sidebar text-sidebar-foreground p-4 h-screen">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-sidebar-primary">Trading Journal</h1>
      </div>
      
      <ul className="space-y-2">
        <li>
          <Link
            href="/"
            className={`flex items-center p-2 rounded-md transition-colors ${
              isActive("/")
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent/50"
            }`}
          >
            <Home className="mr-2 h-5 w-5" />
            <span>Home</span>
          </Link>
        </li>
        <li>
          <Link
            href="/weekly-one-pager"
            className={`flex items-center p-2 rounded-md transition-colors ${
              isActive("/weekly-one-pager")
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent/50"
            }`}
          >
            <FileText className="mr-2 h-5 w-5" />
            <span>Weekly One Pager</span>
          </Link>
        </li>
        <li>
          <Link
            href="/ideas"
            className={`flex items-center p-2 rounded-md transition-colors ${
              isActive("/ideas") || pathname.startsWith("/ideas/")
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent/50"
            }`}
          >
            <Lightbulb className="mr-2 h-5 w-5" />
            <span>Ideas</span>
          </Link>
        </li>
        <li>
          <Link
            href="/journal"
            className={`flex items-center p-2 rounded-md transition-colors ${
              isActive("/journal") || pathname.startsWith("/journal/")
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent/50"
            }`}
          >
            <BookOpen className="mr-2 h-5 w-5" />
            <span>Journal</span>
          </Link>
        </li>
        <li>
          <Link
            href="/trades"
            className={`flex items-center p-2 rounded-md transition-colors ${
              isActive("/trades") || pathname.startsWith("/trades/")
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent/50"
            }`}
          >
            <TrendingUp className="mr-2 h-5 w-5" />
            <span>Trade Log</span>
          </Link>
        </li>
        <li>
          <Link
            href="/analysis"
            className={`flex items-center p-2 rounded-md transition-colors ${
              isActive("/analysis")
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent/50"
            }`}
          >
            <BarChart2 className="mr-2 h-5 w-5" />
            <span>Analysis</span>
          </Link>
        </li>
        <li>
          <Link
            href="/settings"
            className={`flex items-center p-2 rounded-md transition-colors ${
              isActive("/settings")
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent/50"
            }`}
          >
            <Settings className="mr-2 h-5 w-5" />
            <span>Settings</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
} 