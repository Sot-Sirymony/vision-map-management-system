import { FormEvent, useEffect, useState } from 'react';
import { archiveCommunicationMessage, createCommunicationMessage, listCommunicationMessages, updateCommunicationMessage } from '../api/communicationApi';
import { listDreams } from '../api/dreamApi';
import { listGoals } from '../api/goalApi';
import { listPartners } from '../api/partnerApi';
import { listTasks } from '../api/taskApi';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
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
import type { CommunicationMessage, CommunicationMessageRequest, CommunicationStatus, Dream, Goal, Partner, TaskItem } from '../types/vision';
import { communicationStatusLabels } from '../utils/enumLabels';
import { PageSection } from './PageSection';

export function CommunicationBuilderPage() {
  const { token } = useAuth();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const crud = useCrudEntity<CommunicationMessage, CommunicationMessageRequest>({
    token,
    entityLabel: 'communication messages',
    list: async (currentToken) => {
      const result = await listCommunicationMessages(currentToken, page, 20);
      setTotalPages(result.totalPages);
      return result.content;
    },
    create: createCommunicationMessage,
    update: updateCommunicationMessage,
    archive: archiveCommunicationMessage,
  });
  const [partners, setPartners] = useState<Partner[]>([]);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [partnerId, setPartnerId] = useState('');
  const [relatedDreamId, setRelatedDreamId] = useState('');
  const [relatedGoalId, setRelatedGoalId] = useState('');
  const [relatedTaskId, setRelatedTaskId] = useState('');
  const [audience, setAudience] = useState('');
  const [purpose, setPurpose] = useState('');
  const [subject, setSubject] = useState('');
  const [request, setRequest] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [status, setStatus] = useState<CommunicationStatus>('DRAFT');
  const [followUpDate, setFollowUpDate] = useState('');

  useEffect(() => {
    if (!token) {
      return;
    }
    void crud.reload();
    void Promise.all([listPartners(token, 0, 500), listDreams(token), listGoals(token), listTasks(token)]).then(
      ([partnerPage, dreamData, goalData, taskData]) => {
        setPartners(partnerPage.content);
        setDreams(dreamData);
        setGoals(goalData);
        setTasks(taskData);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const success = await crud.save({
      partnerId: optionalNumber(partnerId),
      relatedDreamId: optionalNumber(relatedDreamId),
      relatedGoalId: optionalNumber(relatedGoalId),
      relatedTaskId: optionalNumber(relatedTaskId),
      audience,
      purpose,
      subject,
      request,
      expectedOutcome,
      messageBody,
      status,
      followUpDate: followUpDate || undefined,
    });
    if (success) {
      setSubject('');
      setPurpose('');
      setRequest('');
      setExpectedOutcome('');
      setMessageBody('');
    }
    return success;
  }

  function startEdit(message: CommunicationMessage) {
    crud.startEdit(message.id);
    setPartnerId(message.partnerId ? String(message.partnerId) : '');
    setRelatedDreamId(message.relatedDreamId ? String(message.relatedDreamId) : '');
    setRelatedGoalId(message.relatedGoalId ? String(message.relatedGoalId) : '');
    setRelatedTaskId(message.relatedTaskId ? String(message.relatedTaskId) : '');
    setAudience(message.audience ?? '');
    setPurpose(message.purpose ?? '');
    setSubject(message.subject ?? '');
    setRequest(message.request ?? '');
    setExpectedOutcome(message.expectedOutcome ?? '');
    setMessageBody(message.messageBody ?? '');
    setStatus(message.status);
    setFollowUpDate(message.followUpDate ?? '');
  }

  function cancelEdit() {
    crud.cancelEdit();
    setPartnerId('');
    setRelatedDreamId('');
    setRelatedGoalId('');
    setRelatedTaskId('');
    setAudience('');
    setPurpose('');
    setSubject('');
    setRequest('');
    setExpectedOutcome('');
    setMessageBody('');
    setStatus('DRAFT');
    setFollowUpDate('');
  }

  const formFields = (
    <>
      <label>
        Partner
        <FormControl fullWidth size="small">
          <Select displayEmpty value={partnerId} onChange={(event) => setPartnerId(event.target.value)}>
            <MenuItem value="">None</MenuItem>
            {partners.map((partner) => <MenuItem value={String(partner.id)} key={partner.id}>{partner.name}</MenuItem>)}
          </Select>
        </FormControl>
      </label>
      <label>
        Audience
        <Input value={audience} onChange={(event) => setAudience(event.target.value)} />
      </label>
      <label>
        Dream
        <FormControl fullWidth size="small">
          <Select displayEmpty value={relatedDreamId} onChange={(event) => setRelatedDreamId(event.target.value)}>
            <MenuItem value="">None</MenuItem>
            {dreams.map((dream) => <MenuItem value={String(dream.id)} key={dream.id}>{dream.title}</MenuItem>)}
          </Select>
        </FormControl>
      </label>
      <label>
        Goal
        <FormControl fullWidth size="small">
          <Select displayEmpty value={relatedGoalId} onChange={(event) => setRelatedGoalId(event.target.value)}>
            <MenuItem value="">None</MenuItem>
            {goals.map((goal) => <MenuItem value={String(goal.id)} key={goal.id}>{goal.title}</MenuItem>)}
          </Select>
        </FormControl>
      </label>
      <label>
        Task
        <FormControl fullWidth size="small">
          <Select displayEmpty value={relatedTaskId} onChange={(event) => setRelatedTaskId(event.target.value)}>
            <MenuItem value="">None</MenuItem>
            {tasks.map((task) => <MenuItem value={String(task.id)} key={task.id}>{task.title}</MenuItem>)}
          </Select>
        </FormControl>
      </label>
      <label>
        Follow Up
        <Input type="date" value={followUpDate} onChange={(event) => setFollowUpDate(event.target.value)} />
      </label>
      <label>
        Subject
        <Input value={subject} onChange={(event) => setSubject(event.target.value)} />
      </label>
      <label>
        Status
        <FormControl fullWidth size="small">
          <Select value={status} onChange={(event) => setStatus(event.target.value as CommunicationStatus)}>
            {(['DRAFT', 'SENT', 'FOLLOWED_UP', 'REPLIED', 'CLOSED'] as const).map((value) => (
              <MenuItem value={value} key={value}>{communicationStatusLabels[value]}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </label>
      <label className="field-full">
        Purpose
        <Textarea value={purpose} onChange={(event) => setPurpose(event.target.value)} />
      </label>
      <label className="field-full">
        Request
        <Textarea value={request} onChange={(event) => setRequest(event.target.value)} />
      </label>
      <label className="field-full">
        Expected Outcome
        <Textarea value={expectedOutcome} onChange={(event) => setExpectedOutcome(event.target.value)} />
      </label>
      <label className="field-full">
        Message
        <Textarea value={messageBody} onChange={(event) => setMessageBody(event.target.value)} />
      </label>
    </>
  );

  function handleGenerateMessage() {
    const partner = partners.find((item) => item.id === Number(partnerId));
    const recipient = audience || partner?.name || 'Partner';
    setMessageBody(`Dear ${recipient},

I am working on ${purpose || 'an important vision mapping goal'}. I would appreciate your support with ${request || 'reviewing the next action and giving practical guidance'}.

Your guidance would help ${expectedOutcome || 'move this work forward with more clarity'}. I believe this work can also create useful learning and shared value.

Would you be available for a short conversation about this?

Best regards`);
  }

  return (
    <PageSection title="Communication" subtitle="Prepare support requests and follow-up messages.">
      <CrudModalForm
        editing={crud.editingId !== null}
        createLabel="Save message"
        editTitle="Edit Message"
        saving={crud.saving}
        onSubmit={handleSubmit}
        onCancelEdit={cancelEdit}
        extraActions={<Button type="button" variant="secondary" onClick={handleGenerateMessage}>Generate message</Button>}
      >
        {formFields}
      </CrudModalForm>
      {crud.loading && <Loading />}
      {crud.error && <ErrorMessage message={crud.error} />}
      <Card>
        <CardContent>
        {crud.items.length === 0 ? (
          <EmptyState>No messages yet.</EmptyState>
        ) : (
          <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Subject</TableCell>
                <TableCell>Audience</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Follow Up</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {crud.items.map((message) => (
                <TableRow key={message.id}>
                  <TableCell sx={{ fontWeight: 500 }}>{message.subject || '-'}</TableCell>
                  <TableCell>{message.audience || '-'}</TableCell>
                  <TableCell><StatusBadge status={message.status} /></TableCell>
                  <TableCell>{message.followUpDate || '-'}</TableCell>
                  <TableCell className="row-actions">
                    <Button type="button" variant="secondary" onClick={() => startEdit(message)}>Edit</Button>
                    <Button type="button" variant="secondary" onClick={() => void crud.archive(message.id)}>Archive</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </TableContainer>
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
