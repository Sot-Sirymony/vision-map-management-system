import { useEffect, useState } from 'react';
import { getDashboardSummary } from '../api/dashboardApi';
import { listTasks } from '../api/taskApi';
import { CategoryBreakdownChart } from '../components/dashboard/CategoryBreakdownChart';
import { DashboardSummary } from '../components/dashboard/DashboardSummary';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Loading } from '../components/common/Loading';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { ProgressBar } from '../components/common/ProgressBar';
import { StatusBadge } from '../components/common/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '../context/AuthContext';
import type { DashboardSummary as DashboardSummaryData, TaskItem } from '../types/vision';
import { PageSection } from './PageSection';

export function DashboardPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<DashboardSummaryData | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      return;
    }

    setLoading(true);
    Promise.all([getDashboardSummary(token), listTasks(token)])
      .then(([summaryData, taskData]) => {
        setSummary(summaryData);
        setTasks(taskData);
        setError('');
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard.'))
      .finally(() => setLoading(false));
  }, [token]);

  const priorityTasks = [...tasks]
    .filter((task) => task.status !== 'COMPLETED')
    .sort((first, second) => priorityScore(second.priority) - priorityScore(first.priority))
    .slice(0, 5);

  return (
    <PageSection title="Dashboard" subtitle="Track progress across dreams, goals, steps, and tasks.">
      {loading && <Loading />}
      {error && <ErrorMessage message={error} />}
      <DashboardSummary summary={summary} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CategoryBreakdownChart
          title="Goals by status"
          description="Current distribution across all active goals"
          data={summary?.goalsByStatus ?? {}}
          formatLabel={formatLabel}
        />
        <CategoryBreakdownChart
          title="Dreams by vision area"
          description="Where active dreams are concentrated"
          data={summary?.dreamsByVisionArea ?? {}}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Priority tasks</CardTitle>
          <CardDescription>The five highest-priority tasks that are not yet completed</CardDescription>
        </CardHeader>
        <CardContent>
          {priorityTasks.length === 0 ? (
            <EmptyState>No open priority tasks.</EmptyState>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priorityTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{task.dueDate}</TableCell>
                    <TableCell><PriorityBadge priority={task.priority} /></TableCell>
                    <TableCell><StatusBadge status={task.status} /></TableCell>
                    <TableCell className="w-40"><ProgressBar value={Number(task.progressPercent)} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
