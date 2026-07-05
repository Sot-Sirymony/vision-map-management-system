import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listGoals } from '../api/goalApi';
import { archiveStep, createStep, listSteps, updateStep } from '../api/stepApi';
import { listTasks } from '../api/taskApi';
import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { Modal } from '../components/common/Modal';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Select } from '../components/common/Select';
import { StatusBadge } from '../components/common/StatusBadge';
import { Textarea } from '../components/common/Textarea';
import { useAuth } from '../context/AuthContext';
import type { Goal, Priority, TaskItem, VisionStep, WorkStatus } from '../types/vision';
import { isOverdue } from '../utils/overdue';
import { PageSection } from './PageSection';

export function StepsPage() {
  const { token } = useAuth();
  const [steps, setSteps] = useState<VisionStep[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [goalId, setGoalId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sequenceNumber, setSequenceNumber] = useState(1);
  const [complex, setComplex] = useState(false);
  const [priority, setPriority] = useState<Priority>('HIGH');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState<WorkStatus>('NOT_STARTED');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterGoalId, setFilterGoalId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterOverdueOnly, setFilterOverdueOnly] = useState(false);

  async function load() {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const [stepData, goalData, taskData] = await Promise.all([listSteps(token), listGoals(token), listTasks(token)]);
      setSteps(stepData);
      setGoals(goalData);
      setTasks(taskData);
      setGoalId((current) => current || String(goalData[0]?.id ?? ''));
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load steps.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token || !goalId) {
      return;
    }
    setSaving(true);
    try {
      const request = {
        goalId: Number(goalId),
        title,
        description,
        sequenceNumber,
        complex,
        priority,
        targetDate: targetDate || undefined,
        status,
      };
      if (editingId !== null) {
        await updateStep(token, editingId, request);
        setEditingId(null);
      } else {
        await createStep(token, request);
        setSequenceNumber(sequenceNumber + 1);
      }
      setTitle('');
      setDescription('');
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save step.');
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(id: number) {
    if (!token) {
      return;
    }
    try {
      await archiveStep(token, id);
      await load();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : 'Unable to archive step.');
    }
  }

  function startEdit(step: VisionStep) {
    setEditingId(step.id);
    setGoalId(String(step.goalId));
    setTitle(step.title);
    setDescription(step.description ?? '');
    setSequenceNumber(step.sequenceNumber);
    setComplex(step.complex);
    setPriority(step.priority);
    setTargetDate(step.targetDate ?? '');
    setStatus(step.status);
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setComplex(false);
    setPriority('HIGH');
    setTargetDate('');
    setStatus('NOT_STARTED');
  }

  const filteredSteps = steps.filter((step) => {
    if (filterGoalId && String(step.goalId) !== filterGoalId) {
      return false;
    }
    if (filterStatus && step.status !== filterStatus) {
      return false;
    }
    if (filterPriority && step.priority !== filterPriority) {
      return false;
    }
    if (filterOverdueOnly && !isOverdue(step.targetDate, step.status)) {
      return false;
    }
    return true;
  });

  const formFields = (
    <>
      <label>
        Goal
        <Select value={goalId} onChange={(event) => setGoalId(event.target.value)} required>
          {goals.map((goal) => <option value={goal.id} key={goal.id}>{goal.title}</option>)}
        </Select>
      </label>
      <label>
        Title
        <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
      </label>
      <label>
        Sequence
        <Input type="number" min="0" value={sequenceNumber} onChange={(event) => setSequenceNumber(Number(event.target.value))} required />
      </label>
      <label>
        Target Date
        <Input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
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
          <option value="NOT_STARTED">Not Started</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="WAITING">Waiting</option>
          <option value="BLOCKED">Blocked</option>
          <option value="PAUSED">Paused</option>
          <option value="COMPLETED">Completed</option>
        </Select>
      </label>
      <label className="field-full">
        <span className="inline-meta">
          <Input type="checkbox" checked={complex} onChange={(event) => setComplex(event.target.checked)} />
          Complex step
        </span>
      </label>
      <label className="field-full">
        Description
        <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>
    </>
  );

  return (
    <PageSection title="Steps" subtitle="Break goals into ordered action stages.">
      {editingId === null && (
        <div className="panel">
          <form className="form-grid" onSubmit={handleSubmit}>
            {formFields}
            <div className="field-full">
              <Button type="submit" disabled={saving || goals.length === 0}>{saving ? 'Saving...' : 'Create step'}</Button>
            </div>
          </form>
        </div>
      )}
      {editingId !== null && (
        <Modal title="Edit Step" onClose={cancelEdit}>
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
      <div className="panel filter-bar">
        <label>
          Goal
          <Select value={filterGoalId} onChange={(event) => setFilterGoalId(event.target.value)}>
            <option value="">All</option>
            {goals.map((goal) => <option value={goal.id} key={goal.id}>{goal.title}</option>)}
          </Select>
        </label>
        <label>
          Status
          <Select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
            <option value="">All</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING">Waiting</option>
            <option value="BLOCKED">Blocked</option>
            <option value="PAUSED">Paused</option>
            <option value="COMPLETED">Completed</option>
          </Select>
        </label>
        <label>
          Priority
          <Select value={filterPriority} onChange={(event) => setFilterPriority(event.target.value)}>
            <option value="">All</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </Select>
        </label>
        <label className="checkbox-field">
          <Input type="checkbox" checked={filterOverdueOnly} onChange={(event) => setFilterOverdueOnly(event.target.checked)} />
          Overdue only
        </label>
      </div>
      <div className="panel table-wrap">
        {filteredSteps.length === 0 ? (
          <div className="empty-state">No steps match these filters.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Step</th>
                <th>Seq</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Tasks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSteps.map((step) => {
                const taskCount = tasks.filter((task) => task.stepId === step.id).length;
                const needsTasks = step.complex && taskCount === 0;
                return (
                  <tr key={step.id} className={isOverdue(step.targetDate, step.status) ? 'row-overdue' : ''}>
                    <td>{step.code}</td>
                    <td>
                      {step.title}
                      {needsTasks && (
                        <div className="coaching-panel step-needs-tasks">
                          <strong>Complex step, no tasks yet</strong>
                          <p>Break this into executable tasks so it can actually move forward.</p>
                          <Link to={`/tasks?stepId=${step.id}`}>Break this into tasks →</Link>
                        </div>
                      )}
                    </td>
                    <td>{step.sequenceNumber}</td>
                    <td><PriorityBadge priority={step.priority} /></td>
                    <td><StatusBadge status={step.status} /></td>
                    <td><ProgressBar value={Number(step.progressPercent)} /></td>
                    <td>{taskCount}</td>
                    <td className="row-actions">
                      <Button type="button" variant="secondary" onClick={() => startEdit(step)}>Edit</Button>
                      <Button type="button" variant="secondary" onClick={() => void handleArchive(step.id)}>Archive</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </PageSection>
  );
}
