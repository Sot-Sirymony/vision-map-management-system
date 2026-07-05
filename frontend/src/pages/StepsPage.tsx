import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listGoals } from '../api/goalApi';
import { archiveStep, createStep, listSteps, updateStep } from '../api/stepApi';
import { listTasks } from '../api/taskApi';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '../components/common/Button';
import { CrudModalForm } from '../components/common/CrudModalForm';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { ProgressBar } from '../components/common/ProgressBar';
import { StatusBadge } from '../components/common/StatusBadge';
import { Textarea } from '../components/common/Textarea';
import { useAuth } from '../context/AuthContext';
import { useCrudEntity } from '../hooks/useCrudEntity';
import type { Goal, Priority, TaskItem, VisionStep, VisionStepRequest, WorkStatus } from '../types/vision';
import { isOverdue } from '../utils/overdue';
import { priorityLabels, workStatusLabels } from '../utils/enumLabels';
import { PageSection } from './PageSection';

export function StepsPage() {
  const { token } = useAuth();
  const crud = useCrudEntity<VisionStep, VisionStepRequest>({
    token,
    entityLabel: 'steps',
    list: listSteps,
    create: createStep,
    update: updateStep,
    archive: archiveStep,
  });
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
  const [filterGoalId, setFilterGoalId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterOverdueOnly, setFilterOverdueOnly] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }
    void crud.reload();
    void Promise.all([listGoals(token), listTasks(token)]).then(([goalData, taskData]) => {
      setGoals(goalData);
      setTasks(taskData);
      setGoalId((current) => current || String(goalData[0]?.id ?? ''));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!goalId) {
      return;
    }
    const wasCreating = crud.editingId === null;
    const success = await crud.save({
      goalId: Number(goalId),
      title,
      description,
      sequenceNumber,
      complex,
      priority,
      targetDate: targetDate || undefined,
      status,
    });
    if (success) {
      setTitle('');
      setDescription('');
      if (wasCreating) {
        setSequenceNumber(sequenceNumber + 1);
      }
    }
  }

  function startEdit(step: VisionStep) {
    crud.startEdit(step.id);
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
    crud.cancelEdit();
    setTitle('');
    setDescription('');
    setComplex(false);
    setPriority('HIGH');
    setTargetDate('');
    setStatus('NOT_STARTED');
  }

  const filteredSteps = crud.items.filter((step) => {
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
        <Select value={goalId} onValueChange={(value) => setGoalId(value ?? '')} required>
          <SelectTrigger className="w-full">
            <SelectValue>{(value: string) => goals.find((goal) => String(goal.id) === value)?.title}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {goals.map((goal) => <SelectItem value={String(goal.id)} key={goal.id}>{goal.title}</SelectItem>)}
          </SelectContent>
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
        <Select value={status} onValueChange={(value) => setStatus(value as WorkStatus)}>
          <SelectTrigger className="w-full">
            <SelectValue>{(value: WorkStatus) => workStatusLabels[value]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NOT_STARTED">Not Started</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="WAITING">Waiting</SelectItem>
            <SelectItem value="BLOCKED">Blocked</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      </label>
      <label className="field-full">
        <span className="inline-meta">
          <Checkbox checked={complex} onCheckedChange={(checked) => setComplex(checked)} />
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
      <CrudModalForm
        editing={crud.editingId !== null}
        createLabel="Create step"
        editTitle="Edit Step"
        saving={crud.saving}
        disabled={goals.length === 0}
        onSubmit={handleSubmit}
        onCancelEdit={cancelEdit}
      >
        {formFields}
      </CrudModalForm>
      {crud.loading && <Loading />}
      {crud.error && <ErrorMessage message={crud.error} />}
      <Card className="filter-bar flex-row">
        <label>
          Goal
          <Select value={filterGoalId} onValueChange={(value) => setFilterGoalId(value ?? '')}>
            <SelectTrigger className="w-full">
              <SelectValue>{(value: string) => (value ? goals.find((goal) => String(goal.id) === value)?.title : 'All')}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {goals.map((goal) => <SelectItem value={String(goal.id)} key={goal.id}>{goal.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </label>
        <label>
          Status
          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value ?? '')}>
            <SelectTrigger className="w-full">
              <SelectValue>{(value: string) => (value ? workStatusLabels[value as WorkStatus] : 'All')}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="NOT_STARTED">Not Started</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="WAITING">Waiting</SelectItem>
              <SelectItem value="BLOCKED">Blocked</SelectItem>
              <SelectItem value="PAUSED">Paused</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label>
          Priority
          <Select value={filterPriority} onValueChange={(value) => setFilterPriority(value ?? '')}>
            <SelectTrigger className="w-full">
              <SelectValue>{(value: string) => (value ? priorityLabels[value as Priority] : 'All')}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label className="checkbox-field">
          <Checkbox checked={filterOverdueOnly} onCheckedChange={(checked) => setFilterOverdueOnly(checked)} />
          Overdue only
        </label>
      </Card>
      <Card>
        <CardContent>
        {filteredSteps.length === 0 ? (
          <EmptyState>No steps match these filters.</EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Step</TableHead>
                <TableHead>Seq</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSteps.map((step) => {
                const taskCount = tasks.filter((task) => task.stepId === step.id).length;
                const needsTasks = step.complex && taskCount === 0;
                return (
                  <TableRow key={step.id} className={isOverdue(step.targetDate, step.status) ? 'row-overdue' : ''}>
                    <TableCell>{step.code}</TableCell>
                    <TableCell className="font-medium">
                      {step.title}
                      {needsTasks && (
                        <div className="coaching-panel step-needs-tasks">
                          <strong>Complex step, no tasks yet</strong>
                          <p>Break this into executable tasks so it can actually move forward.</p>
                          <Link to={`/tasks?stepId=${step.id}`}>Break this into tasks →</Link>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{step.sequenceNumber}</TableCell>
                    <TableCell><PriorityBadge priority={step.priority} /></TableCell>
                    <TableCell><StatusBadge status={step.status} /></TableCell>
                    <TableCell><ProgressBar value={Number(step.progressPercent)} /></TableCell>
                    <TableCell>{taskCount}</TableCell>
                    <TableCell className="row-actions">
                      <Button type="button" variant="secondary" onClick={() => startEdit(step)}>Edit</Button>
                      <Button type="button" variant="secondary" onClick={() => void crud.archive(step.id)}>Archive</Button>
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
