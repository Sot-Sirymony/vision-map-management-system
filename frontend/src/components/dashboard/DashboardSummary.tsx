import { Ban, CalendarClock, CalendarDays, CheckCircle2, CheckSquare, Compass, Flag, Sparkles, TrendingUp } from 'lucide-react';
import Box from '@mui/material/Box';
import { DashboardCard } from './DashboardCard';
import type { DashboardSummary as DashboardSummaryData } from '../../types/vision';

type DashboardSummaryProps = {
  summary?: DashboardSummaryData | null;
};

export function DashboardSummary({ summary }: DashboardSummaryProps) {
  return (
    <Box
      component="section"
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' },
      }}
    >
      <DashboardCard label="Vision Areas" value={summary?.totalVisionAreas ?? 0} icon={Compass} />
      <DashboardCard label="Active Dreams" value={summary?.activeDreams ?? 0} icon={Sparkles} />
      <DashboardCard label="Active Goals" value={summary?.activeGoals ?? 0} icon={Flag} />
      <DashboardCard label="Open Tasks" value={summary?.activeTasks ?? 0} icon={CheckSquare} />
      <DashboardCard
        label="Completed Tasks"
        value={summary?.completedTasks ?? 0}
        icon={CheckCircle2}
        tone={(summary?.completedTasks ?? 0) > 0 ? 'positive' : 'neutral'}
      />
      <DashboardCard
        label="Overdue Tasks"
        value={summary?.overdueTasks ?? 0}
        icon={CalendarClock}
        tone={(summary?.overdueTasks ?? 0) > 0 ? 'critical' : 'neutral'}
      />
      <DashboardCard
        label="Blocked Tasks"
        value={summary?.blockedTasks ?? 0}
        icon={Ban}
        tone={(summary?.blockedTasks ?? 0) > 0 ? 'warning' : 'neutral'}
      />
      <DashboardCard
        label="Average Progress"
        value={`${summary?.averageProgress ?? 0}%`}
        icon={TrendingUp}
        tone={(summary?.averageProgress ?? 0) >= 50 ? 'positive' : 'neutral'}
      />
      <DashboardCard label="Due This Week" value={summary?.tasksDueThisWeek ?? 0} icon={CalendarDays} />
    </Box>
  );
}
