import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="empty-state flex items-center justify-center gap-2 text-center">
      <Inbox className="size-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
