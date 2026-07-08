import Chip from '@mui/material/Chip';

export function StatusBadge({ status }: { status: string }) {
  return <Chip size="small" label={status.replaceAll('_', ' ')} />;
}
