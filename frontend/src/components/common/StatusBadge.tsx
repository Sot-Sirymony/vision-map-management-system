import { Badge } from '@/components/ui/badge';

export function StatusBadge({ status }: { status: string }) {
  return <Badge className={`badge status-${status.toLowerCase().replaceAll('_', '-')}`}>{status.replaceAll('_', ' ')}</Badge>;
}
