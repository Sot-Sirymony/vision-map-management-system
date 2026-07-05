import { Skeleton } from '@/components/ui/skeleton';

export function Loading() {
  return (
    <div className="grid gap-2" role="status" aria-label="Loading">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-3/5" />
    </div>
  );
}
