import { DashboardCard } from './DashboardCard';
import type { DashboardSummary as DashboardSummaryData } from '../../types/vision';

type DashboardSummaryProps = {
  summary?: DashboardSummaryData | null;
};

export function DashboardSummary({ summary }: DashboardSummaryProps) {
  return (
    <section className="metric-grid">
      <DashboardCard label="Vision Areas" value={summary?.totalVisionAreas ?? 0} />
      <DashboardCard label="Active Dreams" value={summary?.activeDreams ?? 0} />
      <DashboardCard label="Active Goals" value={summary?.activeGoals ?? 0} />
      <DashboardCard label="Open Tasks" value={summary?.activeTasks ?? 0} />
      <DashboardCard label="Completed Tasks" value={summary?.completedTasks ?? 0} />
      <DashboardCard label="Overdue Tasks" value={summary?.overdueTasks ?? 0} />
      <DashboardCard label="Blocked Tasks" value={summary?.blockedTasks ?? 0} />
      <DashboardCard label="Average Progress" value={`${summary?.averageProgress ?? 0}%`} />
    </section>
  );
}
