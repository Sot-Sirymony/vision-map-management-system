import { Ban, CalendarClock, CheckCircle2, CheckSquare, Compass, Flag, Sparkles, TrendingUp } from 'lucide-react';
import { DashboardCard } from './DashboardCard';
import type { DashboardSummary as DashboardSummaryData } from '../../types/vision';

type DashboardSummaryProps = {
  summary?: DashboardSummaryData | null;
};

export function DashboardSummary({ summary }: DashboardSummaryProps) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardCard label="Vision Areas" value={summary?.totalVisionAreas ?? 0} icon={Compass} />
      <DashboardCard label="Active Dreams" value={summary?.activeDreams ?? 0} icon={Sparkles} />
      <DashboardCard label="Active Goals" value={summary?.activeGoals ?? 0} icon={Flag} />
      <DashboardCard label="Open Tasks" value={summary?.activeTasks ?? 0} icon={CheckSquare} />
      <DashboardCard label="Completed Tasks" value={summary?.completedTasks ?? 0} icon={CheckCircle2} />
      <DashboardCard label="Overdue Tasks" value={summary?.overdueTasks ?? 0} icon={CalendarClock} />
      <DashboardCard label="Blocked Tasks" value={summary?.blockedTasks ?? 0} icon={Ban} />
      <DashboardCard label="Average Progress" value={`${summary?.averageProgress ?? 0}%`} icon={TrendingUp} />
    </section>
  );
}
