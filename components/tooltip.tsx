"use client";

import { useState } from 'react';
import { HelpCircle, Settings } from 'lucide-react';
import Link from 'next/link';

interface TooltipProps {
  text: string;
  type?: 'help' | 'settings';
  settingsLink?: string;
}

export function Tooltip({ text, type = 'help', settingsLink }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseEnter = () => setIsVisible(true);
  const handleMouseLeave = () => setIsVisible(false);

  return (
    <div className="relative inline-block">
      {type === 'help' ? (
        <HelpCircle
          size={16}
          className="text-muted-foreground hover:text-foreground cursor-help"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      ) : (
        <Link href={settingsLink || '/settings'}>
          <Settings
            size={16}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        </Link>
      )}
      
      {isVisible && (
        <div className="absolute z-50 w-64 p-2 mt-1 text-sm bg-popover text-popover-foreground rounded-md shadow-md -left-1/2 transform -translate-x-1/4">
          {text}
        </div>
      )}
    </div>
  );
} 