import { FormEvent, useEffect, useState } from 'react';
import { archiveVisionArea, createVisionArea, listVisionAreas, updateVisionArea } from '../api/visionAreaApi';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '../components/common/Button';
import { CrudModalForm } from '../components/common/CrudModalForm';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { Textarea } from '../components/common/Textarea';
import { useAuth } from '../context/AuthContext';
import { useCrudEntity } from '../hooks/useCrudEntity';
import type { LifecycleStatus, Priority, VisionArea, VisionAreaRequest } from '../types/vision';
import { lifecycleStatusLabels, priorityLabels } from '../utils/enumLabels';
import { PageSection } from './PageSection';

export function VisionAreasPage() {
  const { token } = useAuth();
  const crud = useCrudEntity<VisionArea, VisionAreaRequest>({
    token,
    entityLabel: 'vision areas',
    list: listVisionAreas,
    create: createVisionArea,
    update: updateVisionArea,
    archive: archiveVisionArea,
  });
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('HIGH');
  const [status, setStatus] = useState<LifecycleStatus>('ACTIVE');

  useEffect(() => {
    void crud.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const success = await crud.save({ name, description, priority, status });
    if (success) {
      setName('');
      setDescription('');
    }
  }

  function startEdit(area: VisionArea) {
    crud.startEdit(area.id);
    setName(area.name);
    setDescription(area.description ?? '');
    setPriority(area.priority);
    setStatus(area.status);
  }

  function cancelEdit() {
    crud.cancelEdit();
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
        <Select value={status} onValueChange={(value) => setStatus(value as LifecycleStatus)}>
          <SelectTrigger className="w-full">
            <SelectValue>{(value: LifecycleStatus) => lifecycleStatusLabels[value]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
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
      <CrudModalForm
        editing={crud.editingId !== null}
        createLabel="Create vision area"
        editTitle="Edit Vision Area"
        saving={crud.saving}
        onSubmit={handleSubmit}
        onCancelEdit={cancelEdit}
      >
        {formFields}
      </CrudModalForm>
      {crud.loading && <Loading />}
      {crud.error && <ErrorMessage message={crud.error} />}
      <Card>
        <CardContent>
        {crud.items.length === 0 ? (
          <EmptyState>No vision areas yet.</EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {crud.items.map((area) => (
                <TableRow key={area.id}>
                  <TableCell>{area.code}</TableCell>
                  <TableCell className="font-medium">{area.name}</TableCell>
                  <TableCell><PriorityBadge priority={area.priority} /></TableCell>
                  <TableCell><StatusBadge status={area.status} /></TableCell>
                  <TableCell className="row-actions">
                    <Button type="button" variant="secondary" onClick={() => startEdit(area)}>Edit</Button>
                    <Button type="button" variant="secondary" onClick={() => void crud.archive(area.id)}>Archive</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        </CardContent>
      </Card>
    </PageSection>
  );
}
