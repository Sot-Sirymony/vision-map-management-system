import { FormEvent, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listDreams } from '../api/dreamApi';
import { listGoals } from '../api/goalApi';
import { listSteps } from '../api/stepApi';
import { listVisionAreas } from '../api/visionAreaApi';
import { archiveTask, permanentlyDeleteTask, createTask, listTasks, restoreTask, updateTask, updateTaskStatus } from '../api/taskApi';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { BulkArchiveAction } from '../components/common/BulkArchiveAction';
import { CrudModalForm } from '../components/common/CrudModalForm';
import { DataTable, type DataTableColumn } from '../components/common/DataTable';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { ProgressBar } from '../components/common/ProgressBar';
import { RowActionsMenu } from '../components/common/RowActionsMenu';
import { ShowArchivedToggle } from '../components/common/ShowArchivedToggle';
import { StatusBadge } from '../components/common/StatusBadge';
import { StatusBoard } from '../components/common/StatusBoard';
import { ViewToggle, type ViewMode } from '../components/common/ViewToggle';
import { Textarea } from '../components/common/Textarea';
import { useAuth } from '../context/AuthContext';
import { useCrudEntity } from '../hooks/useCrudEntity';
import { FilterSelect, optionsFromEntities, optionsFromLabels } from '../components/common/FilterSelect';
import { useUrlFilter, useUrlFlag } from '../hooks/useUrlFilter';
import type { Dream, Goal, ObstacleType, Priority, TaskItem, TaskItemRequest, VisionArea, VisionStep, WorkStatus } from '../types/vision';
import { isOverdue } from '../utils/overdue';
import { suggestPartnerFor } from '../utils/partnerSuggestion';
import { obstacleTypeLabels, priorityLabels, workStatusLabels } from '../utils/enumLabels';
import { priorityRank, workStatusRank } from '../utils/sortRank';
import { PageSection } from './PageSection';

const columns: WorkStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'WAITING', 'BLOCKED', 'COMPLETED', 'PAUSED'];
const blockerCategories: ObstacleType[] = ['KNOWLEDGE', 'SKILL', 'TIME', 'MONEY', 'DECISION', 'PARTNER', 'MOTIVATION'];

export function TasksBoardPage() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterStepId = searchParams.get('stepId');
  const [autoOpenCreate, setAutoOpenCreate] = useState(false);
  const crud = useCrudEntity<TaskItem, TaskItemRequest>({
    token,
    entityLabel: 'tasks',
    list: listTasks,
    create: createTask,
    update: updateTask,
    archive: archiveTask,
    permanentlyDelete: permanentlyDeleteTask,
    restore: restoreTask,
  });
  const [steps, setSteps] = useState<VisionStep[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [visionAreas, setVisionAreas] = useState<VisionArea[]>([]);
  const [stepId, setStepId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('');
  const [priority, setPriority] = useState<Priority>('HIGH');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<WorkStatus>('NOT_STARTED');
  const [progressPercent, setProgressPercent] = useState(0);
  const [blockerReason, setBlockerReason] = useState('');
  const [blockerCategory, setBlockerCategory] = useState<ObstacleType | ''>('');
  const [nextAction, setNextAction] = useState('');
  // In the URL, not component state: the dashboard links straight into a
  // filtered board, and a filtered board stays shareable and bookmarkable.
  const [filterOwner, setFilterOwner] = useUrlFilter('owner');
  const [filterPriority, setFilterPriority] = useUrlFilter('priority');
  const [filterVisionAreaId, setFilterVisionAreaId] = useUrlFilter('visionAreaId');
  const [filterDreamId, setFilterDreamId] = useUrlFilter('dreamId');
  const [filterGoalId, setFilterGoalId] = useUrlFilter('goalId');
  const [filterOverdueOnly, setFilterOverdueOnly] = useUrlFlag('overdue');
  // Due-date range (BRD C-6). Inclusive on both ends; either bound may be empty.
  // This is what makes the dashboard's "Due This Week" tile a link.
  const [filterDueFrom, setFilterDueFrom] = useUrlFilter('dueFrom');
  const [filterDueTo, setFilterDueTo] = useUrlFilter('dueTo');
  // In board view this narrows the board to a single column ("show me the
  // blocked ones" means showing one column); in list view it filters rows, so
  // a dashboard drill-down lands on the same set either way.
  const [filterStatus, setFilterStatus] = useUrlFilter('status');
  const visibleColumns = filterStatus
    ? columns.filter((column) => column === filterStatus)
    : columns;
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Arrived from a step's "Add task" shortcut: pre-select that step and open the
  // create form, then strip the params so a refresh doesn't reopen it.
  useEffect(() => {
    if (searchParams.get('create') !== 'task') {
      return;
    }
    const parent = searchParams.get('parent');
    if (parent) {
      setStepId(parent);
    }
    setAutoOpenCreate(true);
    const next = new URLSearchParams(searchParams);
    next.delete('create');
    next.delete('parent');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }
    void crud.reload();
    void listSteps(token).then((stepData) => {
      setSteps(stepData);
      setStepId((current) => current || filterStepId || String(stepData[0]?.id ?? ''));
    });
    void listGoals(token).then(setGoals);
    void listDreams(token).then(setDreams);
    void listVisionAreas(token).then(setVisionAreas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!stepId) {
      return false;
    }
    const success = await crud.save({
      stepId: Number(stepId),
      title,
      description,
      owner,
      priority,
      startDate: startDate || undefined,
      dueDate,
      status,
      progressPercent,
      blockerReason: blockerReason || undefined,
      nextAction,
    });
    if (success) {
      setTitle('');
      setDescription('');
      setBlockerReason('');
      setBlockerCategory('');
      setNextAction('');
      setProgressPercent(0);
    }
    return success;
  }

  async function handleMove(id: number, nextStatus: WorkStatus) {
    if (!token) {
      return;
    }
    try {
      await updateTaskStatus(token, id, nextStatus);
      await crud.reload();
    } catch (moveError) {
      crud.setError(moveError instanceof Error ? moveError.message : 'Unable to update task status.');
    }
  }

  function startEdit(task: TaskItem) {
    crud.startEdit(task.id);
    setStepId(String(task.stepId));
    setTitle(task.title);
    setDescription(task.description ?? '');
    setOwner(task.owner);
    setPriority(task.priority);
    setStartDate(task.startDate ?? '');
    setDueDate(task.dueDate);
    setStatus(task.status);
    setProgressPercent(task.progressPercent);
    setBlockerReason(task.blockerReason ?? '');
    setBlockerCategory('');
    setNextAction(task.nextAction ?? '');
  }

  function cancelEdit() {
    crud.cancelEdit();
    setTitle('');
    setDescription('');
    setOwner('');
    setPriority('HIGH');
    setStartDate('');
    setDueDate('');
    setStatus('NOT_STARTED');
    setProgressPercent(0);
    setBlockerReason('');
    setBlockerCategory('');
    setNextAction('');
  }

  const stepById = new Map(steps.map((step) => [step.id, step]));
  const goalById = new Map(goals.map((goal) => [goal.id, goal]));
  const dreamById = new Map(dreams.map((dream) => [dream.id, dream]));
  const dreamsForFilter = filterVisionAreaId
    ? dreams.filter((dream) => String(dream.visionAreaId) === filterVisionAreaId)
    : dreams;
  const goalsForFilter = filterDreamId
    ? goals.filter((goal) => String(goal.dreamId) === filterDreamId)
    : goals;

  const visibleTasks = crud.items.filter((task) => {
    if (filterStepId && String(task.stepId) !== filterStepId) {
      return false;
    }
    if (filterOwner && !task.owner.toLowerCase().includes(filterOwner.toLowerCase())) {
      return false;
    }
    if (filterPriority && task.priority !== filterPriority) {
      return false;
    }
    if (filterStatus && task.status !== filterStatus) {
      return false;
    }
    if (filterOverdueOnly && !isOverdue(task.dueDate, task.status)) {
      return false;
    }
    // Due-date range: string compare is safe because dueDate is ISO yyyy-MM-dd.
    if (filterDueFrom && task.dueDate < filterDueFrom) {
      return false;
    }
    if (filterDueTo && task.dueDate > filterDueTo) {
      return false;
    }
    if (searchTerm) {
      const haystack = `${task.title} ${task.owner} ${task.description ?? ''} ${task.nextAction ?? ''} ${task.blockerReason ?? ''}`.toLowerCase();
      if (!haystack.includes(searchTerm.toLowerCase())) {
        return false;
      }
    }
    const step = stepById.get(task.stepId);
    if (filterGoalId && String(step?.goalId ?? '') !== filterGoalId) {
      return false;
    }
    if (filterDreamId) {
      const goal = step ? goalById.get(step.goalId) : undefined;
      if (String(goal?.dreamId ?? '') !== filterDreamId) {
        return false;
      }
    }
    if (filterVisionAreaId) {
      const goal = step ? goalById.get(step.goalId) : undefined;
      const dream = goal ? dreamById.get(goal.dreamId) : undefined;
      if (String(dream?.visionAreaId ?? '') !== filterVisionAreaId) {
        return false;
      }
    }
    return true;
  });

  const taskColumns: DataTableColumn<TaskItem>[] = [
    { key: 'title', label: 'Task', sortValue: (task) => task.title, sx: { fontWeight: 500 }, render: (task) => task.title },
    { key: 'owner', label: 'Owner', sortValue: (task) => task.owner, render: (task) => task.owner },
    { key: 'dueDate', label: 'Due', sortValue: (task) => task.dueDate, render: (task) => task.dueDate },
    {
      key: 'priority',
      label: 'Priority',
      sortValue: (task) => priorityRank(task.priority),
      render: (task) => <PriorityBadge priority={task.priority} />,
    },
    {
      key: 'status',
      label: 'Status',
      sortValue: (task) => workStatusRank(task.status),
      render: (task) => <StatusBadge status={task.status} />,
    },
    {
      key: 'progress',
      label: 'Progress',
      sortValue: (task) => Number(task.progressPercent),
      sx: { width: 160 },
      render: (task) => <ProgressBar value={Number(task.progressPercent)} />,
    },
    {
      key: 'actions',
      label: 'Action',
      className: 'row-actions',
      render: (task) => (
        <RowActionsMenu
          onEdit={() => startEdit(task)}
          onArchive={() => void crud.archive(task.id)}
          onRestore={() => void crud.restore(task.id)}
          onDeletePermanently={() => void crud.permanentlyDelete(task.id)}
          archived={task.archived}
          label="Task actions"
        />
      ),
    },
  ];

  const formFields = (
    <>
      <label>
        Step
        <FormControl fullWidth size="small" required>
          <Select value={stepId} onChange={(event) => setStepId(event.target.value)}>
            {steps.map((step) => <MenuItem value={String(step.id)} key={step.id}>{step.title}</MenuItem>)}
          </Select>
        </FormControl>
      </label>
      <label>
        Title
        <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
      </label>
      <label>
        Owner
        <Input value={owner} onChange={(event) => setOwner(event.target.value)} required />
      </label>
      <label>
        Due Date
        <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} required />
      </label>
      <label>
        Start Date
        <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
      </label>
      <label>
        Progress
        <Input type="number" min="0" max="100" value={progressPercent} onChange={(event) => setProgressPercent(Number(event.target.value))} required />
      </label>
      <label>
        Priority
        <FormControl fullWidth size="small">
          <Select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
            <MenuItem value="LOW">Low</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
            <MenuItem value="HIGH">High</MenuItem>
            <MenuItem value="CRITICAL">Critical</MenuItem>
          </Select>
        </FormControl>
      </label>
      <label>
        Status
        <FormControl fullWidth size="small">
          <Select value={status} onChange={(event) => setStatus(event.target.value as WorkStatus)}>
            {columns.map((column) => <MenuItem value={column} key={column}>{workStatusLabels[column]}</MenuItem>)}
          </Select>
        </FormControl>
      </label>
      {status === 'BLOCKED' && (
        <label>
          What's missing?
          <FormControl fullWidth size="small">
            <Select displayEmpty value={blockerCategory} onChange={(event) => setBlockerCategory(event.target.value as ObstacleType)}>
              <MenuItem value="" disabled><em>Select a category...</em></MenuItem>
              {blockerCategories.map((category) => <MenuItem value={category} key={category}>{obstacleTypeLabels[category]}</MenuItem>)}
            </Select>
          </FormControl>
          {blockerCategory && (
            <span className="field-hint">
              {suggestPartnerFor(blockerCategory)?.label ?? 'Look for a partner or connector who can help directly.'}
            </span>
          )}
        </label>
      )}
      <label className="field-full">
        Blocker Reason
        <Textarea value={blockerReason} onChange={(event) => setBlockerReason(event.target.value)} required={status === 'BLOCKED'} />
      </label>
      <label className="field-full">
        Next Action
        <Textarea value={nextAction} onChange={(event) => setNextAction(event.target.value)} />
      </label>
      <label className="field-full">
        Description
        <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>
    </>
  );

  return (
    <PageSection title="Tasks Board" subtitle="Manage executable work by status.">
      <CrudModalForm
        editing={crud.editingId !== null}
        createLabel="Create task"
        editTitle="Edit Task"
        saving={crud.saving}
        disabled={steps.length === 0}
        autoOpenCreate={autoOpenCreate}
        onSubmit={handleSubmit}
        onCancelEdit={cancelEdit}
      >
        {formFields}
      </CrudModalForm>
      {crud.loading && <Loading />}
      {crud.error && <ErrorMessage message={crud.error} />}
      <Card className="filter-bar flex-row">
        <label>
          Owner
          <Input value={filterOwner} onChange={(event) => setFilterOwner(event.target.value)} placeholder="Any owner" />
        </label>
        <FilterSelect
          label="Priority"
          value={filterPriority}
          onChange={setFilterPriority}
          options={optionsFromLabels(priorityLabels)}
        />
        <FilterSelect
          label="Status"
          value={filterStatus}
          onChange={setFilterStatus}
          options={optionsFromLabels(workStatusLabels)}
        />
        <FilterSelect
          label="Vision Area"
          value={filterVisionAreaId}
          onChange={(value) => {
            setFilterVisionAreaId(value);
            setFilterDreamId('');
            setFilterGoalId('');
          }}
          options={optionsFromEntities(visionAreas, (area) => area.name)}
        />
        <FilterSelect
          label="Dream"
          value={filterDreamId}
          onChange={(value) => {
            setFilterDreamId(value);
            setFilterGoalId('');
          }}
          options={optionsFromEntities(dreamsForFilter, (dream) => dream.title)}
        />
        <FilterSelect
          label="Goal"
          value={filterGoalId}
          onChange={setFilterGoalId}
          options={optionsFromEntities(goalsForFilter, (goal) => goal.title)}
        />
        <label>
          Due from
          <Input type="date" value={filterDueFrom} onChange={(event) => setFilterDueFrom(event.target.value)} />
        </label>
        <label>
          Due to
          <Input type="date" value={filterDueTo} onChange={(event) => setFilterDueTo(event.target.value)} />
        </label>
        <label className="checkbox-field">
          <Checkbox checked={filterOverdueOnly} onChange={(event) => setFilterOverdueOnly(event.target.checked)} />
          Overdue only
        </label>
        <ShowArchivedToggle checked={crud.showArchived} onToggle={crud.toggleShowArchived} />
      </Card>
      {filterStepId && (
        <Card className="filter-banner flex-row">
          <span>Showing tasks for step: <strong>{steps.find((step) => String(step.id) === filterStepId)?.title ?? filterStepId}</strong></span>
          <Link to="/tasks">Clear filter</Link>
        </Card>
      )}
      <div className="toolbar">
        <Input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search Here"
          aria-label="Search tasks"
        />
      </div>
      <div className="view-toggle-row">
        <ViewToggle value={viewMode} onChange={setViewMode} label="Task view" />
      </div>
      {viewMode === 'list' ? (
        <Card>
          <CardContent>
            <DataTable
              rows={visibleTasks}
              columns={taskColumns}
              emptyMessage="No tasks match these filters."
              rowClassName={(task) => (task.archived ? 'row-archived' : isOverdue(task.dueDate, task.status) ? 'row-overdue' : '')}
              selection={{
                selectedIds,
                onChange: setSelectedIds,
                rowLabel: (task) => task.title,
                actions: (
                  <BulkArchiveAction
                    selectedIds={selectedIds}
                    entityLabel="task(s)"
                    onArchive={async (ids) => {
                      await crud.archiveMany(ids);
                      setSelectedIds(new Set());
                    }}
                  />
                ),
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <StatusBoard
          items={visibleTasks}
          columns={visibleColumns.map((column) => ({ value: column, label: workStatusLabels[column] }))}
          moveOptions={columns.map((column) => ({ value: column, label: workStatusLabels[column] }))}
          statusOf={(task) => task.status}
          entityLabel="tasks"
          onMove={(task, nextStatus) => void handleMove(task.id, nextStatus)}
          cardClassName={taskHighlightClass}
          renderCard={(task) => (
            <>
              <strong>{task.title}</strong>
              <p>{task.owner} · Due {task.dueDate}</p>
              <div className="inline-meta">
                <PriorityBadge priority={task.priority} />
                <span>{task.progressPercent}%</span>
              </div>
              <ProgressBar value={Number(task.progressPercent)} />
              {task.blockerReason && <p>{task.blockerReason}</p>}
            </>
          )}
          cardActions={(task) => (
            <RowActionsMenu
              onEdit={() => startEdit(task)}
              onArchive={() => void crud.archive(task.id)}
              onRestore={() => void crud.restore(task.id)}
              onDeletePermanently={() => void crud.permanentlyDelete(task.id)}
              archived={task.archived}
              label="Task actions"
            />
          )}
        />
      )}
    </PageSection>
  );
}

function taskHighlightClass(task: TaskItem) {
  if (isOverdue(task.dueDate, task.status)) {
    return 'list-card--overdue';
  }
  if (task.status === 'BLOCKED') {
    return 'list-card--blocked';
  }
  return '';
}
