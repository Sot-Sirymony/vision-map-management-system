import { PriorityBadge } from '../common/PriorityBadge';
import { ProgressBar } from '../common/ProgressBar';
import { StatusBadge } from '../common/StatusBadge';
import type { TaskItem } from '../../types/vision';

export function TaskNode({ task }: { task: TaskItem }) {
  return (
    <article className="vision-tree-task">
      <div className="vision-tree-row">
        <span className="vision-tree-code">{task.code}</span>
        <strong>{task.title}</strong>
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
      </div>
      <p className="vision-tree-meta">{task.owner} · Due {task.dueDate}</p>
      {task.blockerReason && <p className="vision-tree-blocker">{task.blockerReason}</p>}
      <ProgressBar value={Number(task.progressPercent)} />
    </article>
  );
}
