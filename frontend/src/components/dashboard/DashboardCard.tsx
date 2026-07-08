import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { LucideIcon } from 'lucide-react';

type DashboardCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
};

export function DashboardCard({ label, value, icon: Icon }: DashboardCardProps) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          <Box sx={{ color: 'text.secondary', display: 'flex' }}>
            <Icon size={16} />
          </Box>
        </Stack>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>{value}</Typography>
      </CardContent>
    </Card>
  );
}
