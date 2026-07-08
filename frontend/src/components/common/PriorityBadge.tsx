import Chip from '@mui/material/Chip';

const HIGH_PRIORITY = new Set(['HIGH', 'CRITICAL']);

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Chip
      size="small"
      label={priority}
      color={HIGH_PRIORITY.has(priority.toUpperCase()) ? 'error' : 'default'}
    />
  );
}
