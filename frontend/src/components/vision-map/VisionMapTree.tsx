import { createGoal } from '../../api/goalApi';
import type { Dream, Goal, TaskItem, VisionStep } from '../../types/vision';
import { DreamNode } from './DreamNode';
import { GoalNode } from './GoalNode';
import { QuickAddTitle } from './QuickAddTitle';

type VisionMapTreeProps = {
  dream: Dream;
  visionAreaName: string;
  goals: Goal[];
  steps: VisionStep[];
  tasks: TaskItem[];
  token: string;
  onDataChange: () => Promise<void>;
};

export function VisionMapTree({ dream, visionAreaName, goals, steps, tasks, token, onDataChange }: VisionMapTreeProps) {
  const dreamGoals = goals.filter((goal) => goal.dreamId === dream.id);

  async function handleAddGoal(title: string) {
    await createGoal(token, {
      dreamId: dream.id,
      title,
      priority: 'MEDIUM',
      status: 'NOT_STARTED',
    });
    await onDataChange();
  }

  return (
    <div className="vision-tree">
      <DreamNode dream={dream} visionAreaName={visionAreaName} goals={dreamGoals} />
      <div className="vision-tree-children vision-tree-goals">
        {dreamGoals.length === 0 ? (
          <p className="vision-tree-empty">No goals yet.</p>
        ) : (
          dreamGoals.map((goal) => (
            <GoalNode goal={goal} steps={steps} tasks={tasks} token={token} onDataChange={onDataChange} key={goal.id} />
          ))
        )}
        <QuickAddTitle placeholder="New goal title" onAdd={handleAddGoal} />
      </div>
    </div>
  );
}
