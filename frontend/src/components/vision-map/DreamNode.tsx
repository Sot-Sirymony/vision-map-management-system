import type { Dream, Goal } from '../../types/vision';
import { PriorityBadge } from '../common/PriorityBadge';
import { ProgressBar } from '../common/ProgressBar';
import { StatusBadge } from '../common/StatusBadge';

type DreamNodeProps = {
  dream: Dream;
  visionAreaName: string;
  goals: Goal[];
};

export function DreamNode({ dream, visionAreaName, goals }: DreamNodeProps) {
  const progress = goals.length === 0
    ? 0
    : goals.reduce((sum, goal) => sum + Number(goal.progressPercent), 0) / goals.length;

  return (
    <header className="vision-tree-dream">
      <p className="vision-tree-area">{visionAreaName}</p>
      <div className="vision-tree-row">
        <span className="vision-tree-code">{dream.code}</span>
        <h2>{dream.title}</h2>
        <PriorityBadge priority={dream.priority} />
        <StatusBadge status={dream.status} />
      </div>
      <ProgressBar value={progress} />
      {dream.whyImportant && <p className="vision-tree-meta"><strong>Why:</strong> {dream.whyImportant}</p>}
      {dream.successDefinition && <p className="vision-tree-meta"><strong>Success looks like:</strong> {dream.successDefinition}</p>}
      {dream.targetDate && <p className="vision-tree-meta"><strong>Target:</strong> {dream.targetDate}</p>}
    </header>
  );
}
