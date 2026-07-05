import { FormEvent, useEffect, useState } from 'react';
import { listDreams } from '../api/dreamApi';
import { listGoals } from '../api/goalApi';
import { archivePartner, createPartner, listPartners, updatePartner } from '../api/partnerApi';
import { listSteps } from '../api/stepApi';
import { listTasks } from '../api/taskApi';
import { listVisionAreas } from '../api/visionAreaApi';
import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { Modal } from '../components/common/Modal';
import { Select } from '../components/common/Select';
import { StatusBadge } from '../components/common/StatusBadge';
import { Textarea } from '../components/common/Textarea';
import { useAuth } from '../context/AuthContext';
import type { Dream, Goal, Partner, PartnerStatus, PartnerSupportType, TaskItem, VisionArea, VisionStep } from '../types/vision';
import { PageSection } from './PageSection';

export function PartnersPage() {
  const { token } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [visionAreas, setVisionAreas] = useState<VisionArea[]>([]);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [steps, setSteps] = useState<VisionStep[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [strength, setStrength] = useState('');
  const [supportType, setSupportType] = useState<PartnerSupportType>('MENTOR');
  const [status, setStatus] = useState<PartnerStatus>('TO_CONTACT');
  const [relatedVisionAreaId, setRelatedVisionAreaId] = useState('');
  const [relatedDreamId, setRelatedDreamId] = useState('');
  const [relatedGoalId, setRelatedGoalId] = useState('');
  const [relatedStepId, setRelatedStepId] = useState('');
  const [relatedTaskId, setRelatedTaskId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  async function load() {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const [partnerPage, areaData, dreamData, goalData, stepData, taskData] = await Promise.all([
        listPartners(token, page, 20),
        listVisionAreas(token),
        listDreams(token),
        listGoals(token),
        listSteps(token),
        listTasks(token),
      ]);
      setPartners(partnerPage.content);
      setTotalPages(partnerPage.totalPages);
      setVisionAreas(areaData);
      setDreams(dreamData);
      setGoals(goalData);
      setSteps(stepData);
      setTasks(taskData);
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load partners.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [token, page]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token) {
      return;
    }
    setSaving(true);
    try {
      const request = {
        name,
        role,
        organization,
        email: email || undefined,
        strength,
        supportType,
        status,
        relatedVisionAreaId: optionalNumber(relatedVisionAreaId),
        relatedDreamId: optionalNumber(relatedDreamId),
        relatedGoalId: optionalNumber(relatedGoalId),
        relatedStepId: optionalNumber(relatedStepId),
        relatedTaskId: optionalNumber(relatedTaskId),
        notes,
      };
      if (editingId !== null) {
        await updatePartner(token, editingId, request);
        setEditingId(null);
      } else {
        await createPartner(token, request);
      }
      setName('');
      setRole('');
      setOrganization('');
      setEmail('');
      setStrength('');
      setNotes('');
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save partner.');
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(id: number) {
    if (!token) {
      return;
    }
    try {
      await archivePartner(token, id);
      await load();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : 'Unable to archive partner.');
    }
  }

  function startEdit(partner: Partner) {
    setEditingId(partner.id);
    setName(partner.name);
    setRole(partner.role ?? '');
    setOrganization(partner.organization ?? '');
    setEmail(partner.email ?? '');
    setStrength(partner.strength ?? '');
    setSupportType(partner.supportType);
    setStatus(partner.status);
    setRelatedVisionAreaId(partner.relatedVisionAreaId ? String(partner.relatedVisionAreaId) : '');
    setRelatedDreamId(partner.relatedDreamId ? String(partner.relatedDreamId) : '');
    setRelatedGoalId(partner.relatedGoalId ? String(partner.relatedGoalId) : '');
    setRelatedStepId(partner.relatedStepId ? String(partner.relatedStepId) : '');
    setRelatedTaskId(partner.relatedTaskId ? String(partner.relatedTaskId) : '');
    setNotes(partner.notes ?? '');
  }

  function cancelEdit() {
    setEditingId(null);
    setName('');
    setRole('');
    setOrganization('');
    setEmail('');
    setStrength('');
    setSupportType('MENTOR');
    setStatus('TO_CONTACT');
    setRelatedVisionAreaId('');
    setRelatedDreamId('');
    setRelatedGoalId('');
    setRelatedStepId('');
    setRelatedTaskId('');
    setNotes('');
  }

  const formFields = (
    <>
      <label>
        Name
        <Input value={name} onChange={(event) => setName(event.target.value)} required />
      </label>
      <label>
        Role
        <Input value={role} onChange={(event) => setRole(event.target.value)} />
      </label>
      <label>
        Organization
        <Input value={organization} onChange={(event) => setOrganization(event.target.value)} />
      </label>
      <label>
        Email
        <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label>
        Support Type
        <Select value={supportType} onChange={(event) => setSupportType(event.target.value as PartnerSupportType)}>
          {['MENTOR', 'EXPERT', 'ADVISOR', 'COLLEAGUE', 'FINANCIAL', 'TECHNICAL', 'EMOTIONAL', 'OTHER'].map((value) => (
            <option value={value} key={value}>{formatLabel(value)}</option>
          ))}
        </Select>
      </label>
      <label>
        Status
        <Select value={status} onChange={(event) => setStatus(event.target.value as PartnerStatus)}>
          {['TO_CONTACT', 'CONTACTED', 'ACTIVE', 'WAITING', 'DECLINED', 'COMPLETED'].map((value) => (
            <option value={value} key={value}>{formatLabel(value)}</option>
          ))}
        </Select>
      </label>
      <label>
        Vision Area
        <Select value={relatedVisionAreaId} onChange={(event) => setRelatedVisionAreaId(event.target.value)}>
          <option value="">None</option>
          {visionAreas.map((area) => <option value={area.id} key={area.id}>{area.name}</option>)}
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
        Strength
        <Input value={strength} onChange={(event) => setStrength(event.target.value)} />
      </label>
      <label className="field-full">
        Notes
        <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
      </label>
    </>
  );

  return (
    <PageSection title="Partners" subtitle="Track mentors, experts, advisors, and resources.">
      {editingId === null && (
        <div className="panel">
          <form className="form-grid" onSubmit={handleSubmit}>
            {formFields}
            <div className="field-full">
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create partner'}</Button>
            </div>
          </form>
        </div>
      )}
      {editingId !== null && (
        <Modal title="Edit Partner" onClose={cancelEdit}>
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
        {partners.length === 0 ? (
          <div className="empty-state">No partners yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Support</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((partner) => (
                <tr key={partner.id}>
                  <td>{partner.code}</td>
                  <td>{partner.name}</td>
                  <td>{formatLabel(partner.supportType)}</td>
                  <td><StatusBadge status={partner.status} /></td>
                  <td className="row-actions">
                    <Button type="button" variant="secondary" onClick={() => startEdit(partner)}>Edit</Button>
                    <Button type="button" variant="secondary" onClick={() => void handleArchive(partner.id)}>Archive</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {totalPages > 1 && (
          <div className="pagination">
            <Button type="button" variant="secondary" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>Previous</Button>
            <span>Page {page + 1} of {totalPages}</span>
            <Button type="button" variant="secondary" disabled={page + 1 >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button>
          </div>
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
