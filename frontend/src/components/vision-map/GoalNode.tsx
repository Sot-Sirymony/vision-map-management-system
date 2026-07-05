import { createStep } from '../../api/stepApi';
import type { Goal, TaskItem, VisionStep } from '../../types/vision';
import { PriorityBadge } from '../common/PriorityBadge';
import { ProgressBar } from '../common/ProgressBar';
import { StatusBadge } from '../common/StatusBadge';
import { QuickAddTitle } from './QuickAddTitle';
import { StepNode } from './StepNode';

type GoalNodeProps = {
  goal: Goal;
  steps: VisionStep[];
  tasks: TaskItem[];
  token: string;
  onDataChange: () => Promise<void>;
};

export function GoalNode({ goal, steps, tasks, token, onDataChange }: GoalNodeProps) {
  const goalSteps = steps.filter((step) => step.goalId === goal.id);

  async function handleAddStep(title: string) {
    await createStep(token, {
      goalId: goal.id,
      title,
      sequenceNumber: goalSteps.length + 1,
      complex: false,
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
    });
    await onDataChange();
  }

  return (
    <article className="vision-tree-goal">
      <div className="vision-tree-row">
        <span className="vision-tree-code">{goal.code}</span>
        <strong>{goal.title}</strong>
        <PriorityBadge priority={goal.priority} />
        <StatusBadge status={goal.status} />
      </div>
      <ProgressBar value={Number(goal.progressPercent)} />
      <div className="vision-tree-children">
        {goalSteps.length === 0 ? (
          <p className="vision-tree-empty">No steps yet.</p>
        ) : (
          goalSteps.map((step) => (
            <StepNode step={step} tasks={tasks} token={token} onDataChange={onDataChange} key={step.id} />
          ))
        )}
        <QuickAddTitle placeholder="New step title" onAdd={handleAddStep} />
      </div>
    </article>
  );
}
