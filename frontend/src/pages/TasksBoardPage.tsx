import { DragEvent, FormEvent, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listSteps } from '../api/stepApi';
import { archiveTask, createTask, listTasks, updateTask, updateTaskStatus } from '../api/taskApi';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '../components/common/Button';
import { CrudModalForm } from '../components/common/CrudModalForm';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Textarea } from '../components/common/Textarea';
import { useAuth } from '../context/AuthContext';
import { useCrudEntity } from '../hooks/useCrudEntity';
import type { ObstacleType, Priority, TaskItem, TaskItemRequest, VisionStep, WorkStatus } from '../types/vision';
import { isOverdue } from '../utils/overdue';
import { suggestPartnerFor } from '../utils/partnerSuggestion';
import { obstacleTypeLabels, priorityLabels, workStatusLabels } from '../utils/enumLabels';
import { PageSection } from './PageSection';

const columns: WorkStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'WAITING', 'BLOCKED', 'COMPLETED', 'PAUSED'];
const blockerCategories: ObstacleType[] = ['KNOWLEDGE', 'SKILL', 'TIME', 'MONEY', 'DECISION', 'PARTNER', 'MOTIVATION'];

export function TasksBoardPage() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const filterStepId = searchParams.get('stepId');
  const crud = useCrudEntity<TaskItem, TaskItemRequest>({
    token,
    entityLabel: 'tasks',
    list: listTasks,
    create: createTask,
    update: updateTask,
    archive: archiveTask,
  });
  const [steps, setSteps] = useState<VisionStep[]>([]);
  const [stepId, setStepId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('');
  const [priority, setPriority] = useState<Priority>('HIGH');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<WorkStatus>('NOT_STARTED');
  const [progressPercent, setProgressPercent] = useState(0);
  const [blockerReason, setBlockerReason] = useState('');
  const [blockerCategory, setBlockerCategory] = useState<ObstacleType | ''>('');
  const [nextAction, setNextAction] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<WorkStatus | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }
    void crud.reload();
    void listSteps(token).then((stepData) => {
      setSteps(stepData);
      setStepId((current) => current || filterStepId || String(stepData[0]?.id ?? ''));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!stepId) {
      return;
    }
    const success = await crud.save({
      stepId: Number(stepId),
      title,
      description,
      owner,
      priority,
      startDate: startDate || undefined,
      dueDate,
      status,
      progressPercent,
      blockerReason: blockerReason || undefined,
      nextAction,
    });
    if (success) {
      setTitle('');
      setDescription('');
      setBlockerReason('');
      setBlockerCategory('');
      setNextAction('');
      setProgressPercent(0);
    }
  }

  async function handleMove(id: number, nextStatus: WorkStatus) {
    if (!token) {
      return;
    }
    try {
      await updateTaskStatus(token, id, nextStatus);
      await crud.reload();
    } catch (moveError) {
      crud.setError(moveError instanceof Error ? moveError.message : 'Unable to update task status.');
    }
  }

  function handleDragStart(event: DragEvent<HTMLElement>, taskId: number) {
    setDraggedTaskId(taskId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(taskId));
  }

  function handleDragEnd() {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  }

  function handleColumnDragOver(event: DragEvent<HTMLElement>, column: WorkStatus) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== column) {
      setDragOverColumn(column);
    }
  }

  function handleColumnDrop(event: DragEvent<HTMLElement>, column: WorkStatus) {
    event.preventDefault();
    const taskId = draggedTaskId ?? Number(event.dataTransfer.getData('text/plain'));
    setDraggedTaskId(null);
    setDragOverColumn(null);
    const task = crud.items.find((item) => item.id === taskId);
    if (!task || task.status === column) {
      return;
    }
    void handleMove(taskId, column);
  }

  function startEdit(task: TaskItem) {
    crud.startEdit(task.id);
    setStepId(String(task.stepId));
    setTitle(task.title);
    setDescription(task.description ?? '');
    setOwner(task.owner);
    setPriority(task.priority);
    setStartDate(task.startDate ?? '');
    setDueDate(task.dueDate);
    setStatus(task.status);
    setProgressPercent(task.progressPercent);
    setBlockerReason(task.blockerReason ?? '');
    setBlockerCategory('');
    setNextAction(task.nextAction ?? '');
  }

  function cancelEdit() {
    crud.cancelEdit();
    setTitle('');
    setDescription('');
    setOwner('');
    setPriority('HIGH');
    setStartDate('');
    setDueDate('');
    setStatus('NOT_STARTED');
    setProgressPercent(0);
    setBlockerReason('');
    setBlockerCategory('');
    setNextAction('');
  }

  const visibleTasks = filterStepId ? crud.items.filter((task) => String(task.stepId) === filterStepId) : crud.items;

  const formFields = (
    <>
      <label>
        Step
        <Select value={stepId} onValueChange={(value) => setStepId(value ?? '')} required>
          <SelectTrigger className="w-full">
            <SelectValue>{(value: string) => steps.find((step) => String(step.id) === value)?.title}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {steps.map((step) => <SelectItem value={String(step.id)} key={step.id}>{step.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </label>
      <label>
        Title
        <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
      </label>
      <label>
        Owner
        <Input value={owner} onChange={(event) => setOwner(event.target.value)} required />
      </label>
      <label>
        Due Date
        <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} required />
      </label>
      <label>
        Start Date
        <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
      </label>
      <label>
        Progress
        <Input type="number" min="0" max="100" value={progressPercent} onChange={(event) => setProgressPercent(Number(event.target.value))} required />
      </label>
      <label>
        Priority
        <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
          <SelectTrigger className="w-full">
            <SelectValue>{(value: Priority) => priorityLabels[value]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
          </SelectContent>
        </Select>
      </label>
      <label>
        Status
        <Select value={status} onValueChange={(value) => setStatus(value as WorkStatus)}>
          <SelectTrigger className="w-full">
            <SelectValue>{(value: WorkStatus) => workStatusLabels[value]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {columns.map((column) => <SelectItem value={column} key={column}>{workStatusLabels[column]}</SelectItem>)}
          </SelectContent>
        </Select>
      </label>
      {status === 'BLOCKED' && (
        <label>
          What's missing?
          <Select value={blockerCategory} onValueChange={(value) => setBlockerCategory((value as ObstacleType) ?? '')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category...">{(value: ObstacleType) => obstacleTypeLabels[value]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {blockerCategories.map((category) => <SelectItem value={category} key={category}>{obstacleTypeLabels[category]}</SelectItem>)}
            </SelectContent>
          </Select>
          {blockerCategory && (
            <span className="field-hint">
              {suggestPartnerFor(blockerCategory)?.label ?? 'Look for a partner or connector who can help directly.'}
            </span>
          )}
        </label>
      )}
      <label className="field-full">
        Blocker Reason
        <Textarea value={blockerReason} onChange={(event) => setBlockerReason(event.target.value)} required={status === 'BLOCKED'} />
      </label>
      <label className="field-full">
        Next Action
        <Textarea value={nextAction} onChange={(event) => setNextAction(event.target.value)} />
      </label>
      <label className="field-full">
        Description
        <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>
    </>
  );

  return (
    <PageSection title="Tasks Board" subtitle="Manage executable work by status.">
      <CrudModalForm
        editing={crud.editingId !== null}
        createLabel="Create task"
        editTitle="Edit Task"
        saving={crud.saving}
        disabled={steps.length === 0}
        onSubmit={handleSubmit}
        onCancelEdit={cancelEdit}
      >
        {formFields}
      </CrudModalForm>
      {crud.loading && <Loading />}
      {crud.error && <ErrorMessage message={crud.error} />}
      {filterStepId && (
        <Card className="filter-banner flex-row">
          <span>Showing tasks for step: <strong>{steps.find((step) => String(step.id) === filterStepId)?.title ?? filterStepId}</strong></span>
          <Link to="/tasks">Clear filter</Link>
        </Card>
      )}
      <div className="kanban">
        {columns.map((column) => (
          <section
            className={`kanban-column${dragOverColumn === column ? ' kanban-column--over' : ''}`}
            key={column}
            onDragOver={(event) => handleColumnDragOver(event, column)}
            onDragLeave={() => setDragOverColumn((current) => (current === column ? null : current))}
            onDrop={(event) => handleColumnDrop(event, column)}
          >
            <h3 className="text-sm font-semibold">{formatLabel(column)}</h3>
            {visibleTasks.filter((task) => task.status === column).length === 0 ? (
              <EmptyState>Drop tasks here</EmptyState>
            ) : (
              <div className="stack-list">
                {visibleTasks.filter((task) => task.status === column).map((task) => (
                  <article
                    className={`list-card${draggedTaskId === task.id ? ' list-card--dragging' : ''}${taskHighlightClass(task)}`}
                    key={task.id}
                    draggable
                    onDragStart={(event) => handleDragStart(event, task.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <strong>{task.title}</strong>
                    <p>{task.owner} · Due {task.dueDate}</p>
                    <div className="inline-meta">
                      <PriorityBadge priority={task.priority} />
                      <span>{task.progressPercent}%</span>
                    </div>
                    <ProgressBar value={Number(task.progressPercent)} />
                    {task.blockerReason && <p>{task.blockerReason}</p>}
                    <div className="row-actions">
                      <Select value={task.status} onValueChange={(value) => void handleMove(task.id, value as WorkStatus)}>
                        <SelectTrigger size="sm">
                          <SelectValue>{(value: WorkStatus) => workStatusLabels[value]}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {columns.map((targetStatus) => <SelectItem value={targetStatus} key={targetStatus}>{workStatusLabels[targetStatus]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="secondary" onClick={() => startEdit(task)}>Edit</Button>
                      <Button type="button" variant="secondary" onClick={() => void crud.archive(task.id)}>Archive</Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </PageSection>
  );
}

function formatLabel(value: string) {
  return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function taskHighlightClass(task: TaskItem) {
  if (isOverdue(task.dueDate, task.status)) {
    return ' list-card--overdue';
  }
  if (task.status === 'BLOCKED') {
    return ' list-card--blocked';
  }
  return '';
}
