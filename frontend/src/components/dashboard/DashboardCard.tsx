import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { LucideIcon } from 'lucide-react';

export type DashboardCardTone = 'neutral' | 'positive' | 'warning' | 'critical';

// Fluent's semantic trio (Success/Warning/Danger) — the same three hex
// values used for the overdue/blocked accents on the Tasks Board and List
// view, so a tile's accent means the same thing here as it does there.
const TONE_STYLES: Record<DashboardCardTone, { bg: string; fg: string }> = {
  neutral: { bg: '#f5f5f5', fg: '#616161' },
  positive: { bg: '#dff6dd', fg: '#107c10' },
  warning: { bg: '#fdece3', fg: '#d83b01' },
  critical: { bg: '#fde7e9', fg: '#d13438' },
};

type DashboardCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: DashboardCardTone;
};

export function DashboardCard({ label, value, icon: Icon, tone = 'neutral' }: DashboardCardProps) {
  const { bg, fg } = TONE_STYLES[tone];
  return (
    <Card>
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          <Box sx={{ width: 28, height: 28, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: bg, color: fg }}>
            <Icon size={15} />
          </Box>
        </Stack>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>{value}</Typography>
      </CardContent>
    </Card>
  );
}
