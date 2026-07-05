import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { archiveDream, createDream, listDreams, updateDream } from '../api/dreamApi';
import { listVisionAreas } from '../api/visionAreaApi';
import { buttonVariants } from '@/components/ui/button';
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
import type { Dream, DreamRequest, DreamStatus, DreamType, Priority, VisionArea } from '../types/vision';
import { dreamStatusLabels, dreamTypeLabels, priorityLabels } from '../utils/enumLabels';
import { PageSection } from './PageSection';

export function DreamsPage() {
  const { token } = useAuth();
  const crud = useCrudEntity<Dream, DreamRequest>({
    token,
    entityLabel: 'dreams',
    list: listDreams,
    create: createDream,
    update: updateDream,
    archive: archiveDream,
  });
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

  useEffect(() => {
    if (!token) {
      return;
    }
    void crud.reload();
    void listVisionAreas(token).then((areaData) => {
      setVisionAreas(areaData.filter((area) => area.status !== 'ARCHIVED'));
      setVisionAreaId((current) => current || String(areaData[0]?.id ?? ''));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!visionAreaId) {
      return;
    }
    const success = await crud.save({
      visionAreaId: Number(visionAreaId),
      title,
      description,
      whyImportant,
      successDefinition,
      dreamType,
      priority,
      targetDate: targetDate || undefined,
      status,
    });
    if (success) {
      setTitle('');
      setDescription('');
      setWhyImportant('');
      setSuccessDefinition('');
    }
  }

  function startEdit(dream: Dream) {
    crud.startEdit(dream.id);
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
    crud.cancelEdit();
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
        <Select value={visionAreaId} onValueChange={(value) => setVisionAreaId(value ?? '')} required>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a vision area">
              {(value: string) => visionAreas.find((area) => String(area.id) === value)?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {visionAreas.map((area) => <SelectItem value={String(area.id)} key={area.id}>{area.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </label>
      <label>
        Title
        <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
      </label>
      <label>
        Type
        <Select value={dreamType} onValueChange={(value) => setDreamType(value as DreamType)}>
          <SelectTrigger className="w-full">
            <SelectValue>{(value: DreamType) => dreamTypeLabels[value]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SHORT_TERM">Short Term</SelectItem>
            <SelectItem value="LONG_TERM">Long Term</SelectItem>
            <SelectItem value="LIFETIME">Lifetime</SelectItem>
          </SelectContent>
        </Select>
      </label>
      <label>
        Target Date
        <Input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
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
        <Select value={status} onValueChange={(value) => setStatus(value as DreamStatus)}>
          <SelectTrigger className="w-full">
            <SelectValue>{(value: DreamStatus) => dreamStatusLabels[value]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="IDEA">Idea</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
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
      <CrudModalForm
        editing={crud.editingId !== null}
        createLabel="Create dream"
        editTitle="Edit Dream"
        saving={crud.saving}
        disabled={visionAreas.length === 0}
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
          <EmptyState>No dreams yet.</EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Dream</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {crud.items.map((dream) => (
                <TableRow key={dream.id}>
                  <TableCell>{dream.code}</TableCell>
                  <TableCell className="font-medium">{dream.title}</TableCell>
                  <TableCell><PriorityBadge priority={dream.priority} /></TableCell>
                  <TableCell><StatusBadge status={dream.status} /></TableCell>
                  <TableCell>{dream.targetDate ?? '-'}</TableCell>
                  <TableCell className="row-actions">
                    <Link className={buttonVariants({ variant: 'secondary' })} to={`/dreams/${dream.id}`}>View Map</Link>
                    <Button type="button" variant="secondary" onClick={() => startEdit(dream)}>Edit</Button>
                    <Button type="button" variant="secondary" onClick={() => void crud.archive(dream.id)}>Archive</Button>
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
