import { useEffect, useState } from 'react';
import { getDashboardSummary } from '../api/dashboardApi';
import { listTasks } from '../api/taskApi';
import { DashboardSummary } from '../components/dashboard/DashboardSummary';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Loading } from '../components/common/Loading';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { ProgressBar } from '../components/common/ProgressBar';
import { StatusBadge } from '../components/common/StatusBadge';
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
      <div className="two-column">
        <div className="panel">
          <h3>Priority tasks</h3>
          {priorityTasks.length === 0 ? (
            <div className="empty-state">No open priority tasks.</div>
          ) : (
            <div className="stack-list">
              {priorityTasks.map((task) => (
                <article className="list-card" key={task.id}>
                  <div>
                    <strong>{task.title}</strong>
                    <p>Due {task.dueDate}</p>
                  </div>
                  <div className="inline-meta">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                  <ProgressBar value={Number(task.progressPercent)} />
                </article>
              ))}
            </div>
          )}
        </div>
        <div className="panel">
          <h3>Progress by status</h3>
          {summary && Object.keys(summary.goalsByStatus).length > 0 ? (
            <div className="status-grid">
              {Object.entries(summary.goalsByStatus).map(([status, count]) => (
                <div className="status-row" key={status}>
                  <span>{formatLabel(status)}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No goal status data yet.</div>
          )}
        </div>
      </div>
      <div className="panel">
        <h3>Dreams by vision area</h3>
        {summary && Object.keys(summary.dreamsByVisionArea).length > 0 ? (
          <div className="status-grid">
            {Object.entries(summary.dreamsByVisionArea).map(([area, count]) => (
              <div className="status-row" key={area}>
                <span>{area}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No dream distribution yet.</div>
        )}
      </div>
    </PageSection>
  );
}

function priorityScore(priority: TaskItem['priority']) {
  return { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 }[priority];
}

function formatLabel(value: string) {
  return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}
