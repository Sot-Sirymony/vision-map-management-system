import { FormEvent, useEffect, useState } from 'react';
import { listDreams } from '../api/dreamApi';
import { listGoals } from '../api/goalApi';
import { acceptObstacle, createObstacle, listObstacles, updateObstacle } from '../api/obstacleApi';
import { listPartners } from '../api/partnerApi';
import { listSteps } from '../api/stepApi';
import { listTasks } from '../api/taskApi';
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
import type { Dream, Goal, Obstacle, ObstacleRequest, ObstacleStatus, ObstacleType, Partner, Severity, TaskItem, VisionStep } from '../types/vision';
import { suggestPartnerFor } from '../utils/partnerSuggestion';
import { obstacleStatusLabels, obstacleTypeLabels, priorityLabels } from '../utils/enumLabels';
import { PageSection } from './PageSection';

const obstacleTypes: ObstacleType[] = ['KNOWLEDGE', 'SKILL', 'TIME', 'MONEY', 'MOTIVATION', 'PARTNER', 'SYSTEM', 'DECISION', 'OTHER'];
const severities: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const statuses: ObstacleStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'ACCEPTED'];

export function ObstaclesPage() {
  const { token } = useAuth();
  const crud = useCrudEntity<Obstacle, ObstacleRequest>({
    token,
    entityLabel: 'obstacles',
    list: listObstacles,
    create: createObstacle,
    update: updateObstacle,
    archive: acceptObstacle,
    archiveMessage: 'Accepted.',
  });
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

  useEffect(() => {
    if (!token) {
      return;
    }
    void crud.reload();
    void Promise.all([listDreams(token), listGoals(token), listSteps(token), listTasks(token), listPartners(token, 0, 500)]).then(
      ([dreamData, goalData, stepData, taskData, partnerPage]) => {
        setDreams(dreamData);
        setGoals(goalData);
        setSteps(stepData);
        setTasks(taskData);
        setPartners(partnerPage.content);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const success = await crud.save({
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
    });
    if (success) {
      setTitle('');
      setDescription('');
      setSolution('');
    }
  }

  function startEdit(obstacle: Obstacle) {
    crud.startEdit(obstacle.id);
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
    crud.cancelEdit();
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

  const partnerSuggestion = suggestPartnerFor(obstacleType);

  const formFields = (
    <>
      <label>
        Title
        <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
      </label>
      <label>
        Type
        <Select value={obstacleType} onValueChange={(value) => setObstacleType(value as ObstacleType)}>
          <SelectTrigger className="w-full">
            <SelectValue>{(value: ObstacleType) => obstacleTypeLabels[value]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {obstacleTypes.map((value) => <SelectItem value={value} key={value}>{obstacleTypeLabels[value]}</SelectItem>)}
          </SelectContent>
        </Select>
        {partnerSuggestion && <span className="field-hint">Suggested support: {partnerSuggestion.label}</span>}
      </label>
      <label>
        Severity
        <Select value={severity} onValueChange={(value) => setSeverity(value as Severity)}>
          <SelectTrigger className="w-full">
            <SelectValue>{(value: Severity) => priorityLabels[value]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {severities.map((value) => <SelectItem value={value} key={value}>{priorityLabels[value]}</SelectItem>)}
          </SelectContent>
        </Select>
      </label>
      <label>
        Status
        <Select value={status} onValueChange={(value) => setStatus(value as ObstacleStatus)}>
          <SelectTrigger className="w-full">
            <SelectValue>{(value: ObstacleStatus) => obstacleStatusLabels[value]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {statuses.map((value) => <SelectItem value={value} key={value}>{obstacleStatusLabels[value]}</SelectItem>)}
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
        Required Partner
        <Select value={requiredPartnerId} onValueChange={(value) => setRequiredPartnerId(value ?? '')}>
          <SelectTrigger className="w-full">
            <SelectValue>{(value: string) => (value ? partners.find((partner) => String(partner.id) === value)?.name : 'None')}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {partners.map((partner) => <SelectItem value={String(partner.id)} key={partner.id}>{partner.name}</SelectItem>)}
          </SelectContent>
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
      <CrudModalForm
        editing={crud.editingId !== null}
        createLabel="Create obstacle"
        editTitle="Edit Obstacle"
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
          <EmptyState>No obstacles yet.</EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Suggested Partner</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Solution</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {crud.items.map((obstacle) => {
                const suggestion = suggestPartnerFor(obstacle.obstacleType);
                return (
                  <TableRow key={obstacle.id}>
                    <TableCell className="font-medium">{obstacle.title}</TableCell>
                    <TableCell>{obstacleTypeLabels[obstacle.obstacleType]}</TableCell>
                    <TableCell>{suggestion ? suggestion.label : '-'}</TableCell>
                    <TableCell><StatusBadge status={obstacle.severity} /></TableCell>
                    <TableCell><StatusBadge status={obstacle.status} /></TableCell>
                    <TableCell>{obstacle.solution || '-'}</TableCell>
                    <TableCell className="row-actions">
                      <Button type="button" variant="secondary" onClick={() => startEdit(obstacle)}>Edit</Button>
                      <Button type="button" variant="secondary" onClick={() => void crud.archive(obstacle.id)}>Accept</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        </CardContent>
      </Card>
    </PageSection>
  );
}

function optionalNumber(value: string) {
  return value ? Number(value) : undefined;
}
