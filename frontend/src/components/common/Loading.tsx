import MuiSkeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

export function Loading() {
  return (
    <Stack spacing={1} role="status" aria-label="Loading">
      <MuiSkeleton variant="text" height={16} width="100%" />
      <MuiSkeleton variant="text" height={16} width="80%" />
      <MuiSkeleton variant="text" height={16} width="60%" />
    </Stack>
  );
}
