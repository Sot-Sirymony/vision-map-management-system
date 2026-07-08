import { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { getDashboardSummary } from '../api/dashboardApi';
import { listDreams } from '../api/dreamApi';
import { listGoals } from '../api/goalApi';
import { listObstacles } from '../api/obstacleApi';
import { listPartners } from '../api/partnerApi';
import { listProgressLogs } from '../api/progressLogApi';
import { listReviews } from '../api/reviewApi';
import { listTasks } from '../api/taskApi';
import { listVisionAreas } from '../api/visionAreaApi';
import { CategoryBreakdownChart } from '../components/dashboard/CategoryBreakdownChart';
import { DashboardSummary } from '../components/dashboard/DashboardSummary';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Loading } from '../components/common/Loading';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { ProgressBar } from '../components/common/ProgressBar';
import { StatusBadge } from '../components/common/StatusBadge';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useAuth } from '../context/AuthContext';
import type { DashboardSummary as DashboardSummaryData, Dream, Goal, Obstacle, Partner, PartnerStatus, Priority, ProgressLog, Review, TaskItem, VisionArea, WorkStatus } from '../types/vision';
import { obstacleTypeLabels, partnerStatusLabels, priorityColors, workStatusColors } from '../utils/enumLabels';
import { PageSection } from './PageSection';

const PRIORITY_ORDER: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const TOP_OBSTACLE_TYPE_COUNT = 4;
const OTHER_OBSTACLE_TYPES_KEY = 'OTHER_TYPES';
const PARTNER_STATUS_ORDER: PartnerStatus[] = ['TO_CONTACT', 'CONTACTED', 'ACTIVE', 'WAITING', 'DECLINED', 'COMPLETED'];
const HEATMAP_WEEKS = 12;
const HEATMAP_LEVEL_COLORS = ['#e5e5e5', '#86efac', '#4ade80', '#22c55e', '#15803d'];
const PROGRESS_TREND_WEEKS = 12;

const progressTrendConfig = {
  progress: { label: 'Average progress', color: '#2563eb' },
} satisfies ChartConfig;

const partnerPipelineConfig = {
  count: { label: 'Partners' },
} satisfies ChartConfig;

// Pipeline stage colors — not/yet (gray) → reached out (blue) → engaged (green) /
// stalled (amber) / declined (red) → done (teal, kept distinct from the green
// "active" state so a finished engagement doesn't read as still-in-progress).
const PARTNER_STATUS_COLORS: Record<PartnerStatus, string> = {
  TO_CONTACT: '#a3a3a3',
  CONTACTED: '#2563eb',
  ACTIVE: '#16a34a',
  WAITING: '#d97706',
  DECLINED: '#dc2626',
  COMPLETED: '#0891b2',
};

const visionAreaChartConfig = {
  progress: { label: 'Progress', color: '#7c3aed' },
} satisfies ChartConfig;

// Local to this compact widget (Decision A) — not the app-wide enum color
// system, since this only ever shows the top few types plus a rollup bucket.
const OBSTACLE_TYPE_COLORS: Record<string, string> = {
  KNOWLEDGE: '#2563eb',
  SKILL: '#0891b2',
  TIME: '#d97706',
  MONEY: '#16a34a',
  MOTIVATION: '#7c3aed',
  PARTNER: '#db2777',
  SYSTEM: '#525252',
  DECISION: '#ea580c',
  OTHER: '#a3a3a3',
  [OTHER_OBSTACLE_TYPES_KEY]: '#d4d4d4',
};

export function DashboardPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<DashboardSummaryData | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [visionAreas, setVisionAreas] = useState<VisionArea[]>([]);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      return;
    }

    setLoading(true);
    Promise.all([
      getDashboardSummary(token),
      listTasks(token),
      listVisionAreas(token),
      listDreams(token),
      listGoals(token),
      listObstacles(token),
      listPartners(token, 0, 500),
      listReviews(token),
      listProgressLogs(token),
    ])
      .then(([summaryData, taskData, visionAreaData, dreamData, goalData, obstacleData, partnerPage, reviewData, progressLogData]) => {
        setSummary(summaryData);
        setTasks(taskData);
        setVisionAreas(visionAreaData);
        setDreams(dreamData);
        setGoals(goalData);
        setObstacles(obstacleData);
        setPartners(partnerPage.content);
        setReviews(reviewData);
        setProgressLogs(progressLogData);
        setError('');
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard.'))
      .finally(() => setLoading(false));
  }, [token]);

  const priorityTasks = [...tasks]
    .filter((task) => task.status !== 'COMPLETED')
    .sort((first, second) => priorityScore(second.priority) - priorityScore(first.priority))
    .slice(0, 5);

  const tasksByStatus = tasks.reduce<Record<string, number>>((counts, task) => {
    counts[task.status] = (counts[task.status] ?? 0) + 1;
    return counts;
  }, {});

  const tasksByPriority = PRIORITY_ORDER.reduce<Record<string, number>>((counts, priority) => {
    counts[priority] = tasks.filter((task) => task.priority === priority).length;
    return counts;
  }, {});

  const activeObstacleTypeCounts = obstacles
    .filter((obstacle) => obstacle.status === 'OPEN' || obstacle.status === 'IN_PROGRESS')
    .reduce<Record<string, number>>((counts, obstacle) => {
      counts[obstacle.obstacleType] = (counts[obstacle.obstacleType] ?? 0) + 1;
      return counts;
    }, {});

  const sortedObstacleTypes = Object.entries(activeObstacleTypeCounts).sort(([, first], [, second]) => second - first);
  const topObstaclesByType = Object.fromEntries(sortedObstacleTypes.slice(0, TOP_OBSTACLE_TYPE_COUNT));
  const remainingObstacleCount = sortedObstacleTypes
    .slice(TOP_OBSTACLE_TYPE_COUNT)
    .reduce((sum, [, count]) => sum + count, 0);
  if (remainingObstacleCount > 0) {
    topObstaclesByType[OTHER_OBSTACLE_TYPES_KEY] = remainingObstacleCount;
  }

  const partnerCounts = PARTNER_STATUS_ORDER.reduce<Record<string, number>>((counts, status) => {
    counts[status] = partners.filter((partner) => partner.status === status).length;
    return counts;
  }, {});

  const partnerPipelineData = [{ name: 'Partners', ...partnerCounts }];

  const activeReviews = reviews.filter((review) => !review.archived);
  const reviewHeatmapWeeks = buildReviewHeatmapWeeks(activeReviews);
  const cadenceReviewCount = activeReviews.filter((review) => review.reviewType === 'DAILY' || review.reviewType === 'WEEKLY').length;

  const progressTrend = buildProgressTrend(progressLogs);

  const visionAreaProgress = visionAreas
    .filter((area) => area.status !== 'ARCHIVED')
    .map((area) => {
      const dreamIds = new Set(dreams.filter((dream) => dream.visionAreaId === area.id).map((dream) => dream.id));
      const areaGoals = goals.filter((goal) => dreamIds.has(goal.dreamId));
      const progress = areaGoals.length === 0
        ? 0
        : Math.round(areaGoals.reduce((sum, goal) => sum + Number(goal.progressPercent), 0) / areaGoals.length);
      return { name: area.name, progress };
    })
    .sort((first, second) => first.progress - second.progress);

  return (
    <PageSection title="Dashboard" subtitle="Track progress across dreams, goals, steps, and tasks.">
      {loading && <Loading />}
      {error && <ErrorMessage message={error} />}
      <DashboardSummary summary={summary} />
      <Card>
        <CardHeader title="Progress trend" subheader="Portfolio-wide average task progress over the last 12 weeks" />
        <CardContent>
          {progressTrend.length === 0 ? (
            <EmptyState>No progress logged yet — update a task's progress to start the trend.</EmptyState>
          ) : (
            <ChartContainer config={progressTrendConfig} className="aspect-auto h-[220px] w-full">
              <AreaChart data={progressTrend} margin={{ left: 8, right: 16 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} width={40} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="progress"
                  name="Average progress %"
                  type="monotone"
                  fill="#2563eb"
                  fillOpacity={0.15}
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' } }}>
        <CategoryBreakdownChart
          title="Goals by status"
          description="Current distribution across all active goals"
          data={summary?.goalsByStatus ?? {}}
          formatLabel={formatLabel}
          variant="donut"
          colorForKey={(key) => workStatusColors[key as WorkStatus] ?? '#a3a3a3'}
        />
        <CategoryBreakdownChart
          title="Dreams by vision area"
          description="Where active dreams are concentrated"
          data={summary?.dreamsByVisionArea ?? {}}
        />
        <CategoryBreakdownChart
          title="Tasks by status"
          description="Current distribution across all tasks"
          data={tasksByStatus}
          formatLabel={formatLabel}
          variant="donut"
          colorForKey={(key) => workStatusColors[key as WorkStatus] ?? '#a3a3a3'}
        />
        <CategoryBreakdownChart
          title="Tasks by priority"
          description="Workload skew from Low to Critical"
          data={tasksByPriority}
          formatLabel={formatLabel}
          variant="bar"
          colorForKey={(key) => priorityColors[key as Priority] ?? '#a3a3a3'}
        />
        <CategoryBreakdownChart
          title="Top obstacles"
          description="What's actually blocking active work right now"
          data={topObstaclesByType}
          formatLabel={(key) => (key === OTHER_OBSTACLE_TYPES_KEY ? 'Other types' : obstacleTypeLabels[key as keyof typeof obstacleTypeLabels])}
          variant="donut"
          colorForKey={(key) => OBSTACLE_TYPE_COLORS[key] ?? '#a3a3a3'}
        />
      </Box>
      <Card>
        <CardHeader title="Vision Area progress" subheader="Average goal progress per area — lowest first is what needs attention" />
        <CardContent>
          {visionAreaProgress.length === 0 ? (
            <EmptyState>No vision areas yet.</EmptyState>
          ) : (
            <ChartContainer
              config={visionAreaChartConfig}
              className="aspect-auto w-full"
              style={{ height: Math.max(220, visionAreaProgress.length * 44) }}
            >
              <BarChart data={visionAreaProgress} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={120} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="progress" name="Progress %" radius={4} fill="#7c3aed" />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader title="Partner engagement" subheader="Where partners sit in the pipeline, from first contact to done" />
        <CardContent>
          {partners.length === 0 ? (
            <EmptyState>No partners yet.</EmptyState>
          ) : (
            <>
              <ChartContainer config={partnerPipelineConfig} className="aspect-auto w-full" style={{ height: 72 }}>
                <BarChart data={partnerPipelineData} layout="vertical" margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {PARTNER_STATUS_ORDER.map((status) => (
                    <Bar key={status} dataKey={status} stackId="pipeline" name={partnerStatusLabels[status]} fill={PARTNER_STATUS_COLORS[status]} />
                  ))}
                </BarChart>
              </ChartContainer>
              <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', justifyContent: 'center', pt: 1.5 }}>
                {PARTNER_STATUS_ORDER.map((status) => (
                  <Stack key={status} direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: PARTNER_STATUS_COLORS[status] }} />
                    <Typography variant="caption" color="text.secondary">
                      {partnerStatusLabels[status]} ({partnerCounts[status]})
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader title="Review cadence" subheader="Daily and weekly reviews logged over the last 12 weeks" />
        <CardContent>
          {cadenceReviewCount === 0 ? (
            <EmptyState>No daily or weekly reviews logged yet.</EmptyState>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Box sx={{ display: 'inline-flex', gap: '3px' }}>
                {reviewHeatmapWeeks.map((week, weekIndex) => (
                  <Box key={week[0]?.date ?? weekIndex} sx={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {week.map((day) => (
                      <Tooltip key={day.date} title={formatHeatmapTooltip(day)} arrow>
                        <Box
                          sx={{
                            width: 13,
                            height: 13,
                            borderRadius: '3px',
                            bgcolor: day.isFuture ? 'transparent' : HEATMAP_LEVEL_COLORS[heatmapLevel(day.count)],
                            border: day.isFuture ? '1px dashed' : 'none',
                            borderColor: 'divider',
                          }}
                        />
                      </Tooltip>
                    ))}
                  </Box>
                ))}
              </Box>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', pt: 1.5 }}>
                <Typography variant="caption" color="text.secondary">Less</Typography>
                {HEATMAP_LEVEL_COLORS.map((color) => (
                  <Box key={color} sx={{ width: 13, height: 13, borderRadius: '3px', bgcolor: color }} />
                ))}
                <Typography variant="caption" color="text.secondary">More</Typography>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader title="Priority tasks" subheader="The five highest-priority tasks that are not yet completed" />
        <CardContent>
          {priorityTasks.length === 0 ? (
            <EmptyState>No open priority tasks.</EmptyState>
          ) : (
            <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task</TableCell>
                  <TableCell>Due</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {priorityTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell sx={{ fontWeight: 500 }}>{task.title}</TableCell>
                    <TableCell>{task.dueDate}</TableCell>
                    <TableCell><PriorityBadge priority={task.priority} /></TableCell>
                    <TableCell><StatusBadge status={task.status} /></TableCell>
                    <TableCell sx={{ width: 160 }}><ProgressBar value={Number(task.progressPercent)} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </PageSection>
  );
}

function priorityScore(priority: TaskItem['priority']) {
  return { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 }[priority];
}

function formatLabel(value: string) {
  return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

type HeatmapDay = { date: string; count: number; isFuture: boolean };

function buildReviewHeatmapWeeks(reviews: Review[]): HeatmapDay[][] {
  const countsByDate = reviews
    .filter((review) => review.reviewType === 'DAILY' || review.reviewType === 'WEEKLY')
    .reduce<Record<string, number>>((counts, review) => {
      counts[review.reviewDate] = (counts[review.reviewDate] ?? 0) + 1;
      return counts;
    }, {});

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
  const totalDays = HEATMAP_WEEKS * 7;
  const start = new Date(endOfWeek);
  start.setDate(endOfWeek.getDate() - totalDays + 1);

  const days: HeatmapDay[] = [];
  for (let i = 0; i < totalDays; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const iso = date.toISOString().slice(0, 10);
    days.push({ date: iso, count: countsByDate[iso] ?? 0, isFuture: date > today });
  }

  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

function heatmapLevel(count: number) {
  if (count <= 0) {
    return 0;
  }
  if (count === 1) {
    return 1;
  }
  if (count === 2) {
    return 2;
  }
  if (count === 3) {
    return 3;
  }
  return 4;
}

function formatHeatmapTooltip(day: HeatmapDay) {
  if (day.isFuture) {
    return '';
  }
  const label = new Date(`${day.date}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const reviewWord = day.count === 1 ? 'review' : 'reviews';
  return `${label} — ${day.count} ${reviewWord}`;
}

// Reconstructs a running "average task progress" snapshot per day from the
// before/after log history, then samples one point per week. This mirrors the
// same "Average Progress" KPI the dashboard already shows, but as a trend
// instead of a single frozen number — each task's latest known value as of a
// given day carries forward until its next logged change.
function buildProgressTrend(logs: ProgressLog[]): { label: string; progress: number }[] {
  const byTask = new Map<number, ProgressLog[]>();
  for (const log of logs) {
    if (log.archived) {
      continue;
    }
    const entries = byTask.get(log.relatedTaskId) ?? [];
    entries.push(log);
    byTask.set(log.relatedTaskId, entries);
  }
  for (const entries of byTask.values()) {
    entries.sort((first, second) => new Date(first.loggedAt).getTime() - new Date(second.loggedAt).getTime());
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const totalDays = PROGRESS_TREND_WEEKS * 7;
  const start = new Date(today);
  start.setDate(start.getDate() - totalDays + 1);
  start.setHours(0, 0, 0, 0);

  const dailyAverages: Array<number | null> = [];
  for (let i = 0; i < totalDays; i += 1) {
    const cursor = new Date(start);
    cursor.setDate(start.getDate() + i);
    cursor.setHours(23, 59, 59, 999);

    const valuesAsOfDay: number[] = [];
    for (const entries of byTask.values()) {
      let latest: ProgressLog | undefined;
      for (const entry of entries) {
        if (new Date(entry.loggedAt) <= cursor) {
          latest = entry;
        } else {
          break;
        }
      }
      if (latest) {
        valuesAsOfDay.push(Number(latest.progressPercentAfter));
      }
    }
    dailyAverages.push(
      valuesAsOfDay.length > 0
        ? valuesAsOfDay.reduce((sum, value) => sum + value, 0) / valuesAsOfDay.length
        : null,
    );
  }

  const weeklyPoints: Array<{ label: string; progress: number | null }> = [];
  for (let week = 0; week < PROGRESS_TREND_WEEKS; week += 1) {
    const weekValues = dailyAverages.slice(week * 7, week * 7 + 7);
    const lastKnown = [...weekValues].reverse().find((value) => value !== null) ?? null;
    const weekEndDate = new Date(start);
    weekEndDate.setDate(start.getDate() + week * 7 + 6);
    weeklyPoints.push({
      label: weekEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      progress: lastKnown === null ? null : Math.round(lastKnown),
    });
  }

  const firstDataIndex = weeklyPoints.findIndex((point) => point.progress !== null);
  if (firstDataIndex === -1) {
    return [];
  }
  return weeklyPoints.slice(firstDataIndex).map((point) => ({ label: point.label, progress: point.progress ?? 0 }));
}
