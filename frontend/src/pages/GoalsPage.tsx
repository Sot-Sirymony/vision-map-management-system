import { FormEvent, useEffect, useState } from 'react';
import { listDreams } from '../api/dreamApi';
import { archiveGoal, createGoal, listGoals, updateGoal } from '../api/goalApi';
import { listVisionAreas } from '../api/visionAreaApi';
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
import type { Dream, Goal, Priority, VisionArea, WorkStatus } from '../types/vision';
import { isOverdue } from '../utils/overdue';
import { PageSection } from './PageSection';

export function GoalsPage() {
  const { token } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [visionAreas, setVisionAreas] = useState<VisionArea[]>([]);
  const [dreamId, setDreamId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [successCriteria, setSuccessCriteria] = useState('');
  const [priority, setPriority] = useState<Priority>('HIGH');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState<WorkStatus>('NOT_STARTED');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterVisionAreaId, setFilterVisionAreaId] = useState('');
  const [filterDreamId, setFilterDreamId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterOverdueOnly, setFilterOverdueOnly] = useState(false);

  async function load() {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const [goalData, dreamData, areaData] = await Promise.all([listGoals(token), listDreams(token), listVisionAreas(token)]);
      setGoals(goalData);
      setDreams(dreamData.filter((dream) => dream.status !== 'ARCHIVED'));
      setVisionAreas(areaData);
      setDreamId((current) => current || String(dreamData[0]?.id ?? ''));
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load goals.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token || !dreamId) {
      return;
    }
    setSaving(true);
    try {
      const request = {
        dreamId: Number(dreamId),
        title,
        description,
        successCriteria,
        priority,
        targetDate: targetDate || undefined,
        status,
      };
      if (editingId !== null) {
        await updateGoal(token, editingId, request);
        setEditingId(null);
      } else {
        await createGoal(token, request);
      }
      setTitle('');
      setDescription('');
      setSuccessCriteria('');
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save goal.');
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(id: number) {
    if (!token) {
      return;
    }
    try {
      await archiveGoal(token, id);
      await load();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : 'Unable to archive goal.');
    }
  }

  function startEdit(goal: Goal) {
    setEditingId(goal.id);
    setDreamId(String(goal.dreamId));
    setTitle(goal.title);
    setDescription(goal.description ?? '');
    setSuccessCriteria(goal.successCriteria ?? '');
    setPriority(goal.priority);
    setTargetDate(goal.targetDate ?? '');
    setStatus(goal.status);
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setSuccessCriteria('');
    setPriority('HIGH');
    setTargetDate('');
    setStatus('NOT_STARTED');
  }

  const filteredGoals = goals.filter((goal) => {
    if (filterDreamId && String(goal.dreamId) !== filterDreamId) {
      return false;
    }
    if (filterVisionAreaId) {
      const dream = dreams.find((item) => item.id === goal.dreamId);
      if (String(dream?.visionAreaId ?? '') !== filterVisionAreaId) {
        return false;
      }
    }
    if (filterStatus && goal.status !== filterStatus) {
      return false;
    }
    if (filterPriority && goal.priority !== filterPriority) {
      return false;
    }
    if (filterOverdueOnly && !isOverdue(goal.targetDate, goal.status)) {
      return false;
    }
    return true;
  });

  const formFields = (
    <>
      <label>
        Dream
        <Select value={dreamId} onChange={(event) => setDreamId(event.target.value)} required>
          {dreams.map((dream) => <option value={dream.id} key={dream.id}>{dream.title}</option>)}
        </Select>
      </label>
      <label>
        Title
        <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
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
      <label>
        Target Date
        <Input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
      </label>
      <label className="field-full">
        Success Criteria
        <Textarea value={successCriteria} onChange={(event) => setSuccessCriteria(event.target.value)} />
      </label>
      <label className="field-full">
        Description
        <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>
    </>
  );

  return (
    <PageSection title="Goals" subtitle="Define specific results for each dream.">
      {editingId === null && (
        <div className="panel">
          <form className="form-grid" onSubmit={handleSubmit}>
            {formFields}
            <div className="field-full">
              <Button type="submit" disabled={saving || dreams.length === 0}>{saving ? 'Saving...' : 'Create goal'}</Button>
            </div>
          </form>
        </div>
      )}
      {editingId !== null && (
        <Modal title="Edit Goal" onClose={cancelEdit}>
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
          Vision Area
          <Select value={filterVisionAreaId} onChange={(event) => setFilterVisionAreaId(event.target.value)}>
            <option value="">All</option>
            {visionAreas.map((area) => <option value={area.id} key={area.id}>{area.name}</option>)}
          </Select>
        </label>
        <label>
          Dream
          <Select value={filterDreamId} onChange={(event) => setFilterDreamId(event.target.value)}>
            <option value="">All</option>
            {dreams.map((dream) => <option value={dream.id} key={dream.id}>{dream.title}</option>)}
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
        {filteredGoals.length === 0 ? (
          <div className="empty-state">No goals match these filters.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Goal</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredGoals.map((goal) => (
                <tr key={goal.id} className={isOverdue(goal.targetDate, goal.status) ? 'row-overdue' : ''}>
                  <td>{goal.code}</td>
                  <td>{goal.title}</td>
                  <td><PriorityBadge priority={goal.priority} /></td>
                  <td><StatusBadge status={goal.status} /></td>
                  <td><ProgressBar value={Number(goal.progressPercent)} /></td>
                  <td className="row-actions">
                    <Button type="button" variant="secondary" onClick={() => startEdit(goal)}>Edit</Button>
                    <Button type="button" variant="secondary" onClick={() => void handleArchive(goal.id)}>Archive</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PageSection>
  );
}
