import { Badge } from '@/components/ui/badge';

export function PriorityBadge({ priority }: { priority: string }) {
  return <Badge className={`badge priority-${priority.toLowerCase()}`}>{priority}</Badge>;
}
