import { FormEvent, useEffect, useState } from 'react';
import { listDreams } from '../api/dreamApi';
import { listGoals } from '../api/goalApi';
import { acceptObstacle, createObstacle, listObstacles, updateObstacle } from '../api/obstacleApi';
import { listPartners } from '../api/partnerApi';
import { listSteps } from '../api/stepApi';
import { listTasks } from '../api/taskApi';
import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { Modal } from '../components/common/Modal';
import { Select } from '../components/common/Select';
import { StatusBadge } from '../components/common/StatusBadge';
import { Textarea } from '../components/common/Textarea';
import { useAuth } from '../context/AuthContext';
import type { Dream, Goal, Obstacle, ObstacleStatus, ObstacleType, Partner, Severity, TaskItem, VisionStep } from '../types/vision';
import { PageSection } from './PageSection';

const obstacleTypes: ObstacleType[] = ['KNOWLEDGE', 'SKILL', 'TIME', 'MONEY', 'MOTIVATION', 'PARTNER', 'SYSTEM', 'DECISION', 'OTHER'];
const severities: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const statuses: ObstacleStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ACCEPTED'];

export function ObstaclesPage() {
  const { token } = useAuth();
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [steps, setSteps] = useState<VisionStep[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [relatedDreamId, setRelatedDreamId] = useState('');
  const [relatedGoalId, setRelatedGoalId] = useState('');
  const [relatedStepId, setRelatedStepId] = useState('');
  const [relatedTaskId, setRelatedTaskId] = useState('');
  const [requiredPartnerId, setRequiredPartnerId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [solution, setSolution] = useState('');
  const [obstacleType, setObstacleType] = useState<ObstacleType>('KNOWLEDGE');
  const [severity, setSeverity] = useState<Severity>('MEDIUM');
  const [status, setStatus] = useState<ObstacleStatus>('OPEN');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  async function load() {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const [obstacleData, dreamData, goalData, stepData, taskData, partnerPage] = await Promise.all([
        listObstacles(token),
        listDreams(token),
        listGoals(token),
        listSteps(token),
        listTasks(token),
        listPartners(token, 0, 500),
      ]);
      setObstacles(obstacleData);
      setDreams(dreamData);
      setGoals(goalData);
      setSteps(stepData);
      setTasks(taskData);
      setPartners(partnerPage.content);
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load obstacles.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token) {
      return;
    }
    setSaving(true);
    try {
      const request = {
        relatedDreamId: optionalNumber(relatedDreamId),
        relatedGoalId: optionalNumber(relatedGoalId),
        relatedStepId: optionalNumber(relatedStepId),
        relatedTaskId: optionalNumber(relatedTaskId),
        title,
        description,
        obstacleType,
        severity,
        solution,
        requiredPartnerId: optionalNumber(requiredPartnerId),
        status,
      };
      if (editingId !== null) {
        await updateObstacle(token, editingId, request);
        setEditingId(null);
      } else {
        await createObstacle(token, request);
      }
      setTitle('');
      setDescription('');
      setSolution('');
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save obstacle.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAccept(id: number) {
    if (!token) {
      return;
    }
    try {
      await acceptObstacle(token, id);
      await load();
    } catch (acceptError) {
      setError(acceptError instanceof Error ? acceptError.message : 'Unable to accept obstacle.');
    }
  }

  function startEdit(obstacle: Obstacle) {
    setEditingId(obstacle.id);
    setRelatedDreamId(obstacle.relatedDreamId ? String(obstacle.relatedDreamId) : '');
    setRelatedGoalId(obstacle.relatedGoalId ? String(obstacle.relatedGoalId) : '');
    setRelatedStepId(obstacle.relatedStepId ? String(obstacle.relatedStepId) : '');
    setRelatedTaskId(obstacle.relatedTaskId ? String(obstacle.relatedTaskId) : '');
    setRequiredPartnerId(obstacle.requiredPartnerId ? String(obstacle.requiredPartnerId) : '');
    setTitle(obstacle.title);
    setDescription(obstacle.description ?? '');
    setSolution(obstacle.solution ?? '');
    setObstacleType(obstacle.obstacleType);
    setSeverity(obstacle.severity);
    setStatus(obstacle.status);
  }

  function cancelEdit() {
    setEditingId(null);
    setRelatedDreamId('');
    setRelatedGoalId('');
    setRelatedStepId('');
    setRelatedTaskId('');
    setRequiredPartnerId('');
    setTitle('');
    setDescription('');
    setSolution('');
    setObstacleType('KNOWLEDGE');
    setSeverity('MEDIUM');
    setStatus('OPEN');
  }

  const formFields = (
    <>
      <label>
        Title
        <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
      </label>
      <label>
        Type
        <Select value={obstacleType} onChange={(event) => setObstacleType(event.target.value as ObstacleType)}>
          {obstacleTypes.map((value) => <option value={value} key={value}>{formatLabel(value)}</option>)}
        </Select>
      </label>
      <label>
        Severity
        <Select value={severity} onChange={(event) => setSeverity(event.target.value as Severity)}>
          {severities.map((value) => <option value={value} key={value}>{formatLabel(value)}</option>)}
        </Select>
      </label>
      <label>
        Status
        <Select value={status} onChange={(event) => setStatus(event.target.value as ObstacleStatus)}>
          {statuses.map((value) => <option value={value} key={value}>{formatLabel(value)}</option>)}
        </Select>
      </label>
      <label>
        Dream
        <Select value={relatedDreamId} onChange={(event) => setRelatedDreamId(event.target.value)}>
          <option value="">None</option>
          {dreams.map((dream) => <option value={dream.id} key={dream.id}>{dream.title}</option>)}
        </Select>
      </label>
      <label>
        Goal
        <Select value={relatedGoalId} onChange={(event) => setRelatedGoalId(event.target.value)}>
          <option value="">None</option>
          {goals.map((goal) => <option value={goal.id} key={goal.id}>{goal.title}</option>)}
        </Select>
      </label>
      <label>
        Step
        <Select value={relatedStepId} onChange={(event) => setRelatedStepId(event.target.value)}>
          <option value="">None</option>
          {steps.map((step) => <option value={step.id} key={step.id}>{step.title}</option>)}
        </Select>
      </label>
      <label>
        Task
        <Select value={relatedTaskId} onChange={(event) => setRelatedTaskId(event.target.value)}>
          <option value="">None</option>
          {tasks.map((task) => <option value={task.id} key={task.id}>{task.title}</option>)}
        </Select>
      </label>
      <label>
        Required Partner
        <Select value={requiredPartnerId} onChange={(event) => setRequiredPartnerId(event.target.value)}>
          <option value="">None</option>
          {partners.map((partner) => <option value={partner.id} key={partner.id}>{partner.name}</option>)}
        </Select>
      </label>
      <label className="field-full">
        Description
        <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>
      <label className="field-full">
        Solution
        <Textarea value={solution} onChange={(event) => setSolution(event.target.value)} />
      </label>
    </>
  );

  return (
    <PageSection title="Obstacles" subtitle="Track blockers and the support needed to resolve them.">
      {editingId === null && (
        <div className="panel">
          <form className="form-grid" onSubmit={handleSubmit}>
            {formFields}
            <div className="field-full">
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create obstacle'}</Button>
            </div>
          </form>
        </div>
      )}
      {editingId !== null && (
        <Modal title="Edit Obstacle" onClose={cancelEdit}>
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
      <div className="panel table-wrap">
        {obstacles.length === 0 ? (
          <div className="empty-state">No obstacles yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Solution</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {obstacles.map((obstacle) => (
                <tr key={obstacle.id}>
                  <td>{obstacle.title}</td>
                  <td>{formatLabel(obstacle.obstacleType)}</td>
                  <td><StatusBadge status={obstacle.severity} /></td>
                  <td><StatusBadge status={obstacle.status} /></td>
                  <td>{obstacle.solution || '-'}</td>
                  <td className="row-actions">
                    <Button type="button" variant="secondary" onClick={() => startEdit(obstacle)}>Edit</Button>
                    <Button type="button" variant="secondary" onClick={() => void handleAccept(obstacle.id)}>Accept</Button>
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

function optionalNumber(value: string) {
  return value ? Number(value) : undefined;
}

function formatLabel(value: string) {
  return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}
