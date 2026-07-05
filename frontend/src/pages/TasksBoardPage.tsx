import { DragEvent, FormEvent, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listSteps } from '../api/stepApi';
import { archiveTask, createTask, listTasks, updateTask, updateTaskStatus } from '../api/taskApi';
import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { Modal } from '../components/common/Modal';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Select } from '../components/common/Select';
import { Textarea } from '../components/common/Textarea';
import { useAuth } from '../context/AuthContext';
import type { Priority, TaskItem, VisionStep, WorkStatus } from '../types/vision';
import { isOverdue } from '../utils/overdue';
import { PageSection } from './PageSection';

const columns: WorkStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'WAITING', 'BLOCKED', 'COMPLETED', 'PAUSED'];

export function TasksBoardPage() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const filterStepId = searchParams.get('stepId');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
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
  const [nextAction, setNextAction] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<WorkStatus | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function load() {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const [taskData, stepData] = await Promise.all([listTasks(token), listSteps(token)]);
      setTasks(taskData);
      setSteps(stepData);
      setStepId((current) => current || filterStepId || String(stepData[0]?.id ?? ''));
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load tasks.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token || !stepId) {
      return;
    }
    setSaving(true);
    try {
      const request = {
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
      };
      if (editingId !== null) {
        await updateTask(token, editingId, request);
        setEditingId(null);
      } else {
        await createTask(token, request);
      }
      setTitle('');
      setDescription('');
      setBlockerReason('');
      setNextAction('');
      setProgressPercent(0);
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save task.');
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(id: number) {
    if (!token) {
      return;
    }
    try {
      await archiveTask(token, id);
      await load();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : 'Unable to archive task.');
    }
  }

  async function handleMove(id: number, nextStatus: WorkStatus) {
    if (!token) {
      return;
    }
    try {
      await updateTaskStatus(token, id, nextStatus);
      await load();
    } catch (moveError) {
      setError(moveError instanceof Error ? moveError.message : 'Unable to update task status.');
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
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status === column) {
      return;
    }
    void handleMove(taskId, column);
  }

  function startEdit(task: TaskItem) {
    setEditingId(task.id);
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
    setNextAction(task.nextAction ?? '');
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setOwner('');
    setPriority('HIGH');
    setStartDate('');
    setDueDate('');
    setStatus('NOT_STARTED');
    setProgressPercent(0);
    setBlockerReason('');
    setNextAction('');
  }

  const visibleTasks = filterStepId ? tasks.filter((task) => String(task.stepId) === filterStepId) : tasks;

  const formFields = (
    <>
      <label>
        Step
        <Select value={stepId} onChange={(event) => setStepId(event.target.value)} required>
          {steps.map((step) => <option value={step.id} key={step.id}>{step.title}</option>)}
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
        <Select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </Select>
      </label>
      <label>
        Status
        <Select value={status} onChange={(event) => setStatus(event.target.value as WorkStatus)}>
          {columns.map((column) => <option value={column} key={column}>{formatLabel(column)}</option>)}
        </Select>
      </label>
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
      {editingId === null && (
        <div className="panel">
          <form className="form-grid" onSubmit={handleSubmit}>
            {formFields}
            <div className="field-full">
              <Button type="submit" disabled={saving || steps.length === 0}>{saving ? 'Saving...' : 'Create task'}</Button>
            </div>
          </form>
        </div>
      )}
      {editingId !== null && (
        <Modal title="Edit Task" onClose={cancelEdit}>
          <form className="form-grid" onSubmit={handleSubmit}>
            {formFields}
            <div className="field-full row-actions">
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
              <Button type="button" variant="secondary" onClick={cancelEdit}>Cancel</Button>
            </div>
          </form>
        </Modal>
      )}
      {loading && <Loading />}
      {error && <ErrorMessage message={error} />}
      {filterStepId && (
        <div className="panel filter-banner">
          <span>Showing tasks for step: <strong>{steps.find((step) => String(step.id) === filterStepId)?.title ?? filterStepId}</strong></span>
          <Link to="/tasks">Clear filter</Link>
        </div>
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
            <h3>{formatLabel(column)}</h3>
            {visibleTasks.filter((task) => task.status === column).length === 0 ? (
              <div className="empty-state">Drop tasks here</div>
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
                      <Select value={task.status} onChange={(event) => void handleMove(task.id, event.target.value as WorkStatus)}>
                        {columns.map((targetStatus) => <option value={targetStatus} key={targetStatus}>{formatLabel(targetStatus)}</option>)}
                      </Select>
                      <Button type="button" variant="secondary" onClick={() => startEdit(task)}>Edit</Button>
                      <Button type="button" variant="secondary" onClick={() => void handleArchive(task.id)}>Archive</Button>
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
