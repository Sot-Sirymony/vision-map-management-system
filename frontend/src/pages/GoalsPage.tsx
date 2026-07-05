import { FormEvent, useEffect, useState } from 'react';
import { listDreams } from '../api/dreamApi';
import { archiveGoal, createGoal, listGoals, updateGoal, updateGoalStatus } from '../api/goalApi';
import { listVisionAreas } from '../api/visionAreaApi';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '../components/common/EmptyState';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '../components/common/Button';
import { CrudModalForm } from '../components/common/CrudModalForm';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { ProgressBar } from '../components/common/ProgressBar';
import { StatusBadge } from '../components/common/StatusBadge';
import { Textarea } from '../components/common/Textarea';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCrudEntity } from '../hooks/useCrudEntity';
import type { Dream, Goal, GoalRequest, Priority, VisionArea, WorkStatus } from '../types/vision';
import { isOverdue } from '../utils/overdue';
import { priorityLabels, workStatusLabels } from '../utils/enumLabels';
import { PageSection } from './PageSection';

const statusOptions: { value: WorkStatus; label: string }[] = [
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'WAITING', label: 'Waiting' },
  { value: 'BLOCKED', label: 'Blocked' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'COMPLETED', label: 'Completed' },
];

export function GoalsPage() {
  const { token } = useAuth();
  const crud = useCrudEntity<Goal, GoalRequest>({
    token,
    entityLabel: 'goals',
    list: listGoals,
    create: createGoal,
    update: updateGoal,
    archive: archiveGoal,
  });
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [visionAreas, setVisionAreas] = useState<VisionArea[]>([]);
  const [dreamId, setDreamId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [successCriteria, setSuccessCriteria] = useState('');
  const [priority, setPriority] = useState<Priority>('HIGH');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState<WorkStatus>('NOT_STARTED');
  const [filterVisionAreaId, setFilterVisionAreaId] = useState('');
  const [filterDreamId, setFilterDreamId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterOverdueOnly, setFilterOverdueOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<WorkStatus>('IN_PROGRESS');
  const [bulkApplying, setBulkApplying] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!token) {
      return;
    }
    void crud.reload();
    void Promise.all([listDreams(token), listVisionAreas(token)]).then(([dreamData, areaData]) => {
      setDreams(dreamData.filter((dream) => dream.status !== 'ARCHIVED'));
      setVisionAreas(areaData);
      setDreamId((current) => current || String(dreamData[0]?.id ?? ''));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!dreamId) {
      return;
    }
    const success = await crud.save({
      dreamId: Number(dreamId),
      title,
      description,
      successCriteria,
      priority,
      targetDate: targetDate || undefined,
      status,
    });
    if (success) {
      setTitle('');
      setDescription('');
      setSuccessCriteria('');
    }
  }

  function startEdit(goal: Goal) {
    crud.startEdit(goal.id);
    setDreamId(String(goal.dreamId));
    setTitle(goal.title);
    setDescription(goal.description ?? '');
    setSuccessCriteria(goal.successCriteria ?? '');
    setPriority(goal.priority);
    setTargetDate(goal.targetDate ?? '');
    setStatus(goal.status);
  }

  function cancelEdit() {
    crud.cancelEdit();
    setTitle('');
    setDescription('');
    setSuccessCriteria('');
    setPriority('HIGH');
    setTargetDate('');
    setStatus('NOT_STARTED');
  }

  const filteredGoals = crud.items.filter((goal) => {
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

  const allFilteredSelected = filteredGoals.length > 0 && filteredGoals.every((goal) => selectedIds.has(goal.id));

  function toggleSelected(id: number) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds(allFilteredSelected ? new Set() : new Set(filteredGoals.map((goal) => goal.id)));
  }

  async function handleBulkApply() {
    if (!token || selectedIds.size === 0) {
      return;
    }
    setBulkApplying(true);
    try {
      await Promise.all([...selectedIds].map((id) => updateGoalStatus(token, id, bulkStatus)));
      await crud.reload();
      showToast(`Updated ${selectedIds.size} goal${selectedIds.size === 1 ? '' : 's'}.`);
      setSelectedIds(new Set());
    } catch (bulkError) {
      crud.setError(bulkError instanceof Error ? bulkError.message : 'Unable to update selected goals.');
    } finally {
      setBulkApplying(false);
    }
  }

  const formFields = (
    <>
      <label>
        Dream
        <Select value={dreamId} onValueChange={(value) => setDreamId(value ?? '')} required>
          <SelectTrigger className="w-full">
            <SelectValue>{(value: string) => dreams.find((dream) => String(dream.id) === value)?.title}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {dreams.map((dream) => <SelectItem value={String(dream.id)} key={dream.id}>{dream.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </label>
      <label>
        Title
        <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
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
      <CrudModalForm
        editing={crud.editingId !== null}
        createLabel="Create goal"
        editTitle="Edit Goal"
        saving={crud.saving}
        disabled={dreams.length === 0}
        onSubmit={handleSubmit}
        onCancelEdit={cancelEdit}
      >
        {formFields}
      </CrudModalForm>
      {crud.loading && <Loading />}
      {crud.error && <ErrorMessage message={crud.error} />}
      <Card className="filter-bar flex-row">
        <label>
          Vision Area
          <Select value={filterVisionAreaId} onValueChange={(value) => setFilterVisionAreaId(value ?? '')}>
            <SelectTrigger className="w-full">
              <SelectValue>{(value: string) => (value ? visionAreas.find((area) => String(area.id) === value)?.name : 'All')}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {visionAreas.map((area) => <SelectItem value={String(area.id)} key={area.id}>{area.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </label>
        <label>
          Dream
          <Select value={filterDreamId} onValueChange={(value) => setFilterDreamId(value ?? '')}>
            <SelectTrigger className="w-full">
              <SelectValue>{(value: string) => (value ? dreams.find((dream) => String(dream.id) === value)?.title : 'All')}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {dreams.map((dream) => <SelectItem value={String(dream.id)} key={dream.id}>{dream.title}</SelectItem>)}
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
      {selectedIds.size > 0 && (
        <Card className="bulk-actions-bar flex-row">
          <span className="bulk-count">{selectedIds.size} selected</span>
          <label>
            Set status
            <Select value={bulkStatus} onValueChange={(value) => setBulkStatus(value as WorkStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue>{(value: WorkStatus) => workStatusLabels[value]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => <SelectItem value={option.value} key={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </label>
          <Button type="button" onClick={() => void handleBulkApply()} disabled={bulkApplying}>
            {bulkApplying ? 'Applying...' : 'Apply'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setSelectedIds(new Set())}>Clear selection</Button>
        </Card>
      )}
      <Card>
        <CardContent>
        {filteredGoals.length === 0 ? (
          <EmptyState>No goals match these filters.</EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox checked={allFilteredSelected} onCheckedChange={toggleSelectAll} aria-label="Select all goals" />
                </TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Goal</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGoals.map((goal) => (
                <TableRow key={goal.id} className={isOverdue(goal.targetDate, goal.status) ? 'row-overdue' : ''}>
                  <TableCell>
                    <Checkbox checked={selectedIds.has(goal.id)} onCheckedChange={() => toggleSelected(goal.id)} aria-label={`Select ${goal.title}`} />
                  </TableCell>
                  <TableCell>{goal.code}</TableCell>
                  <TableCell className="font-medium">{goal.title}</TableCell>
                  <TableCell><PriorityBadge priority={goal.priority} /></TableCell>
                  <TableCell><StatusBadge status={goal.status} /></TableCell>
                  <TableCell><ProgressBar value={Number(goal.progressPercent)} /></TableCell>
                  <TableCell className="row-actions">
                    <Button type="button" variant="secondary" onClick={() => startEdit(goal)}>Edit</Button>
                    <Button type="button" variant="secondary" onClick={() => void crud.archive(goal.id)}>Archive</Button>
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
