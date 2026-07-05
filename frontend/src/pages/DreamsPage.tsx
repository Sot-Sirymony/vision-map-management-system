import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { archiveDream, createDream, listDreams, updateDream } from '../api/dreamApi';
import { listVisionAreas } from '../api/visionAreaApi';
import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { Modal } from '../components/common/Modal';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { Select } from '../components/common/Select';
import { StatusBadge } from '../components/common/StatusBadge';
import { Textarea } from '../components/common/Textarea';
import { useAuth } from '../context/AuthContext';
import type { Dream, DreamStatus, DreamType, Priority, VisionArea } from '../types/vision';
import { PageSection } from './PageSection';

export function DreamsPage() {
  const { token } = useAuth();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [visionAreas, setVisionAreas] = useState<VisionArea[]>([]);
  const [visionAreaId, setVisionAreaId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [whyImportant, setWhyImportant] = useState('');
  const [successDefinition, setSuccessDefinition] = useState('');
  const [dreamType, setDreamType] = useState<DreamType>('LONG_TERM');
  const [priority, setPriority] = useState<Priority>('HIGH');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState<DreamStatus>('ACTIVE');
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
      const [dreamData, areaData] = await Promise.all([listDreams(token), listVisionAreas(token)]);
      setDreams(dreamData);
      setVisionAreas(areaData.filter((area) => area.status !== 'ARCHIVED'));
      setVisionAreaId((current) => current || String(areaData[0]?.id ?? ''));
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load dreams.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token || !visionAreaId) {
      return;
    }
    setSaving(true);
    try {
      const request = {
        visionAreaId: Number(visionAreaId),
        title,
        description,
        whyImportant,
        successDefinition,
        dreamType,
        priority,
        targetDate: targetDate || undefined,
        status,
      };
      if (editingId !== null) {
        await updateDream(token, editingId, request);
        setEditingId(null);
      } else {
        await createDream(token, request);
      }
      setTitle('');
      setDescription('');
      setWhyImportant('');
      setSuccessDefinition('');
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save dream.');
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(id: number) {
    if (!token) {
      return;
    }
    try {
      await archiveDream(token, id);
      await load();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : 'Unable to archive dream.');
    }
  }

  function startEdit(dream: Dream) {
    setEditingId(dream.id);
    setVisionAreaId(String(dream.visionAreaId));
    setTitle(dream.title);
    setDescription(dream.description ?? '');
    setWhyImportant(dream.whyImportant ?? '');
    setSuccessDefinition(dream.successDefinition ?? '');
    setDreamType(dream.dreamType);
    setPriority(dream.priority);
    setTargetDate(dream.targetDate ?? '');
    setStatus(dream.status);
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setWhyImportant('');
    setSuccessDefinition('');
    setDreamType('LONG_TERM');
    setPriority('HIGH');
    setTargetDate('');
    setStatus('ACTIVE');
  }

  const clarityChecks = [
    { label: 'What exactly do you want to achieve?', met: title.trim().length >= 8 },
    { label: 'Why does this matter to you?', met: whyImportant.trim().length >= 15 },
    { label: 'What will success look like?', met: successDefinition.trim().length >= 15 },
    { label: 'When do you want to achieve it?', met: Boolean(targetDate) },
    { label: 'Which area of life or work does this belong to?', met: Boolean(visionAreaId) },
  ];
  const isVague = clarityChecks.some((check) => !check.met);

  const formFields = (
    <>
      <label>
        Vision Area
        <Select value={visionAreaId} onChange={(event) => setVisionAreaId(event.target.value)} required>
          {visionAreas.map((area) => <option value={area.id} key={area.id}>{area.name}</option>)}
        </Select>
      </label>
      <label>
        Title
        <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
      </label>
      <label>
        Type
        <Select value={dreamType} onChange={(event) => setDreamType(event.target.value as DreamType)}>
          <option value="SHORT_TERM">Short Term</option>
          <option value="LONG_TERM">Long Term</option>
          <option value="LIFETIME">Lifetime</option>
        </Select>
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
        <Select value={status} onChange={(event) => setStatus(event.target.value as DreamStatus)}>
          <option value="IDEA">Idea</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="COMPLETED">Completed</option>
        </Select>
      </label>
      {isVague && (
        <div className="field-full coaching-panel">
          <strong>Make this dream clearer</strong>
          <p>A vague dream is hard to turn into goals. Answer these before saving:</p>
          <ul>
            {clarityChecks.map((check) => (
              <li key={check.label} className={check.met ? 'coaching-item-done' : ''}>
                <span aria-hidden="true">{check.met ? '✓' : '○'}</span> {check.label}
              </li>
            ))}
          </ul>
        </div>
      )}
      <label className="field-full">
        Why Important
        <Textarea value={whyImportant} onChange={(event) => setWhyImportant(event.target.value)} />
      </label>
      <label className="field-full">
        Success Definition
        <Textarea value={successDefinition} onChange={(event) => setSuccessDefinition(event.target.value)} />
      </label>
      <label className="field-full">
        Description
        <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>
    </>
  );

  return (
    <PageSection title="Dreams" subtitle="Capture meaningful outcomes and prepare them for goals.">
      {editingId === null && (
        <div className="panel">
          <form className="form-grid" onSubmit={handleSubmit}>
            {formFields}
            <div className="field-full">
              <Button type="submit" disabled={saving || visionAreas.length === 0}>{saving ? 'Saving...' : 'Create dream'}</Button>
            </div>
          </form>
        </div>
      )}
      {editingId !== null && (
        <Modal title="Edit Dream" onClose={cancelEdit}>
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
        {dreams.length === 0 ? (
          <div className="empty-state">No dreams yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Dream</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Target</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dreams.map((dream) => (
                <tr key={dream.id}>
                  <td>{dream.code}</td>
                  <td>{dream.title}</td>
                  <td><PriorityBadge priority={dream.priority} /></td>
                  <td><StatusBadge status={dream.status} /></td>
                  <td>{dream.targetDate ?? '-'}</td>
                  <td className="row-actions">
                    <Link className="button button-secondary" to={`/dreams/${dream.id}`}>View Map</Link>
                    <Button type="button" variant="secondary" onClick={() => startEdit(dream)}>Edit</Button>
                    <Button type="button" variant="secondary" onClick={() => void handleArchive(dream.id)}>Archive</Button>
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
