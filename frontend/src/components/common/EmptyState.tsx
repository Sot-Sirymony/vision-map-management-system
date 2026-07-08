import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import Stack from '@mui/material/Stack';

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <Stack className="empty-state" direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <Inbox size={16} />
      <span>{children}</span>
    </Stack>
  );
}
