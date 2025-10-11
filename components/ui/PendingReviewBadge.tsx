import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PendingReviewBadgeProps {
  isPending: boolean;
  size?: 'sm' | 'md';
}

export function PendingReviewBadge({ isPending, size = 'sm' }: PendingReviewBadgeProps) {
  if (!isPending) return null;

  return (
    <Badge
      variant="outline"
      className="bg-yellow-50 text-yellow-700 border-yellow-300 flex items-center gap-1"
    >
      <AlertCircle className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      <span className={size === 'sm' ? 'text-xs' : 'text-sm'}>Pending Review</span>
    </Badge>
  );
}
