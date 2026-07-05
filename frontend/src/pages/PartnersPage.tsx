import { FormEvent, useEffect, useState } from 'react';
import { listDreams } from '../api/dreamApi';
import { listGoals } from '../api/goalApi';
import { archivePartner, createPartner, listPartners, updatePartner } from '../api/partnerApi';
import { listSteps } from '../api/stepApi';
import { listTasks } from '../api/taskApi';
import { listVisionAreas } from '../api/visionAreaApi';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '../components/common/Button';
import { CrudModalForm } from '../components/common/CrudModalForm';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { StatusBadge } from '../components/common/StatusBadge';
import { Textarea } from '../components/common/Textarea';
import { useAuth } from '../context/AuthContext';
import { useCrudEntity } from '../hooks/useCrudEntity';
import type { Dream, Goal, Partner, PartnerRequest, PartnerStatus, PartnerSupportType, TaskItem, VisionArea, VisionStep } from '../types/vision';
import { partnerStatusLabels, partnerSupportTypeLabels } from '../utils/enumLabels';
import { PageSection } from './PageSection';

export function PartnersPage() {
  const { token } = useAuth();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const crud = useCrudEntity<Partner, PartnerRequest>({
    token,
    entityLabel: 'partners',
    list: async (currentToken) => {
      const result = await listPartners(currentToken, page, 20);
      setTotalPages(result.totalPages);
      return result.content;
    },
    create: createPartner,
    update: updatePartner,
    archive: archivePartner,
  });
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

  useEffect(() => {
    if (!token) {
      return;
    }
    void crud.reload();
    void Promise.all([listVisionAreas(token), listDreams(token), listGoals(token), listSteps(token), listTasks(token)]).then(
      ([areaData, dreamData, goalData, stepData, taskData]) => {
        setVisionAreas(areaData);
        setDreams(dreamData);
        setGoals(goalData);
        setSteps(stepData);
        setTasks(taskData);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const success = await crud.save({
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
    });
    if (success) {
      setName('');
      setRole('');
      setOrganization('');
      setEmail('');
      setStrength('');
      setNotes('');
    }
  }

  function startEdit(partner: Partner) {
    crud.startEdit(partner.id);
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
    crud.cancelEdit();
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
        <Select value={supportType} onValueChange={(value) => setSupportType(value as PartnerSupportType)}>
          <SelectTrigger className="w-full">
            <SelectValue>{(value: PartnerSupportType) => partnerSupportTypeLabels[value]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(['MENTOR', 'EXPERT', 'ADVISOR', 'COLLEAGUE', 'FINANCIAL', 'TECHNICAL', 'EMOTIONAL', 'OTHER'] as const).map((value) => (
              <SelectItem value={value} key={value}>{partnerSupportTypeLabels[value]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      <label>
        Status
        <Select value={status} onValueChange={(value) => setStatus(value as PartnerStatus)}>
          <SelectTrigger className="w-full">
            <SelectValue>{(value: PartnerStatus) => partnerStatusLabels[value]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(['TO_CONTACT', 'CONTACTED', 'ACTIVE', 'WAITING', 'DECLINED', 'COMPLETED'] as const).map((value) => (
              <SelectItem value={value} key={value}>{partnerStatusLabels[value]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      <label>
        Vision Area
        <Select value={relatedVisionAreaId} onValueChange={(value) => setRelatedVisionAreaId(value ?? '')}>
          <SelectTrigger className="w-full">
            <SelectValue>{(value: string) => (value ? visionAreas.find((area) => String(area.id) === value)?.name : 'None')}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {visionAreas.map((area) => <SelectItem value={String(area.id)} key={area.id}>{area.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </label>
      <label>
        Dream
        <Select value={relatedDreamId} onValueChange={(value) => setRelatedDreamId(value ?? '')}>
          <SelectTrigger className="w-full">
            <SelectValue>{(value: string) => (value ? dreams.find((dream) => String(dream.id) === value)?.title : 'None')}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {dreams.map((dream) => <SelectItem value={String(dream.id)} key={dream.id}>{dream.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </label>
      <label>
        Goal
        <Select value={relatedGoalId} onValueChange={(value) => setRelatedGoalId(value ?? '')}>
          <SelectTrigger className="w-full">
            <SelectValue>{(value: string) => (value ? goals.find((goal) => String(goal.id) === value)?.title : 'None')}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {goals.map((goal) => <SelectItem value={String(goal.id)} key={goal.id}>{goal.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </label>
      <label>
        Step
        <Select value={relatedStepId} onValueChange={(value) => setRelatedStepId(value ?? '')}>
          <SelectTrigger className="w-full">
            <SelectValue>{(value: string) => (value ? steps.find((step) => String(step.id) === value)?.title : 'None')}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {steps.map((step) => <SelectItem value={String(step.id)} key={step.id}>{step.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </label>
      <label>
        Task
        <Select value={relatedTaskId} onValueChange={(value) => setRelatedTaskId(value ?? '')}>
          <SelectTrigger className="w-full">
            <SelectValue>{(value: string) => (value ? tasks.find((task) => String(task.id) === value)?.title : 'None')}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {tasks.map((task) => <SelectItem value={String(task.id)} key={task.id}>{task.title}</SelectItem>)}
          </SelectContent>
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
      <CrudModalForm
        editing={crud.editingId !== null}
        createLabel="Create partner"
        editTitle="Edit Partner"
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
          <EmptyState>No partners yet.</EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Support</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {crud.items.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell>{partner.code}</TableCell>
                  <TableCell className="font-medium">{partner.name}</TableCell>
                  <TableCell>{partnerSupportTypeLabels[partner.supportType]}</TableCell>
                  <TableCell><StatusBadge status={partner.status} /></TableCell>
                  <TableCell className="row-actions">
                    <Button type="button" variant="secondary" onClick={() => startEdit(partner)}>Edit</Button>
                    <Button type="button" variant="secondary" onClick={() => void crud.archive(partner.id)}>Archive</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {totalPages > 1 && (
          <div className="pagination">
            <Button type="button" variant="secondary" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>Previous</Button>
            <span>Page {page + 1} of {totalPages}</span>
            <Button type="button" variant="secondary" disabled={page + 1 >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button>
          </div>
        )}
        </CardContent>
      </Card>
    </PageSection>
  );
}

function optionalNumber(value: string) {
  return value ? Number(value) : undefined;
}
