import { FormEvent, useEffect, useState } from 'react';
import { archiveVisionArea, createVisionArea, listVisionAreas, updateVisionArea } from '../api/visionAreaApi';
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
import type { LifecycleStatus, Priority, VisionArea } from '../types/vision';
import { PageSection } from './PageSection';

export function VisionAreasPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<VisionArea[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('HIGH');
  const [status, setStatus] = useState<LifecycleStatus>('ACTIVE');
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
      setItems(await listVisionAreas(token));
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load vision areas.');
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
      if (editingId !== null) {
        await updateVisionArea(token, editingId, { name, description, priority, status });
        setEditingId(null);
      } else {
        await createVisionArea(token, { name, description, priority, status });
      }
      setName('');
      setDescription('');
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save vision area.');
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(id: number) {
    if (!token) {
      return;
    }
    try {
      await archiveVisionArea(token, id);
      await load();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : 'Unable to archive vision area.');
    }
  }

  function startEdit(area: VisionArea) {
    setEditingId(area.id);
    setName(area.name);
    setDescription(area.description ?? '');
    setPriority(area.priority);
    setStatus(area.status);
  }

  function cancelEdit() {
    setEditingId(null);
    setName('');
    setDescription('');
    setPriority('HIGH');
    setStatus('ACTIVE');
  }

  const formFields = (
    <>
      <label>
        Name
        <Input value={name} onChange={(event) => setName(event.target.value)} required />
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
        <Select value={status} onChange={(event) => setStatus(event.target.value as LifecycleStatus)}>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="COMPLETED">Completed</option>
          <option value="ARCHIVED">Archived</option>
        </Select>
      </label>
      <label className="field-full">
        Description
        <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>
    </>
  );

  return (
    <PageSection title="Vision Areas" subtitle="Organize the major areas of life or work.">
      {editingId === null && (
        <div className="panel">
          <form className="form-grid" onSubmit={handleSubmit}>
            {formFields}
            <div className="field-full">
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create vision area'}</Button>
            </div>
          </form>
        </div>
      )}
      {editingId !== null && (
        <Modal title="Edit Vision Area" onClose={cancelEdit}>
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
        {items.length === 0 ? (
          <div className="empty-state">No vision areas yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((area) => (
                <tr key={area.id}>
                  <td>{area.code}</td>
                  <td>{area.name}</td>
                  <td><PriorityBadge priority={area.priority} /></td>
                  <td><StatusBadge status={area.status} /></td>
                  <td className="row-actions">
                    <Button type="button" variant="secondary" onClick={() => startEdit(area)}>Edit</Button>
                    <Button type="button" variant="secondary" onClick={() => void handleArchive(area.id)}>Archive</Button>
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
