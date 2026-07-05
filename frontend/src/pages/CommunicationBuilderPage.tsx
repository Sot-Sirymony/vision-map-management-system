import { FormEvent, useEffect, useState } from 'react';
import { archiveCommunicationMessage, createCommunicationMessage, listCommunicationMessages, updateCommunicationMessage } from '../api/communicationApi';
import { listDreams } from '../api/dreamApi';
import { listGoals } from '../api/goalApi';
import { listPartners } from '../api/partnerApi';
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
        <Select value={partnerId} onValueChange={(value) => setPartnerId(value ?? '')}>
          <SelectTrigger className="w-full">
            <SelectValue>{(value: string) => (value ? partners.find((partner) => String(partner.id) === value)?.name : 'None')}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {partners.map((partner) => <SelectItem value={String(partner.id)} key={partner.id}>{partner.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </label>
      <label>
        Audience
        <Input value={audience} onChange={(event) => setAudience(event.target.value)} />
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
        Follow Up
        <Input type="date" value={followUpDate} onChange={(event) => setFollowUpDate(event.target.value)} />
      </label>
      <label>
        Subject
        <Input value={subject} onChange={(event) => setSubject(event.target.value)} />
      </label>
      <label>
        Status
        <Select value={status} onValueChange={(value) => setStatus(value as CommunicationStatus)}>
          <SelectTrigger className="w-full">
            <SelectValue>{(value: CommunicationStatus) => communicationStatusLabels[value]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(['DRAFT', 'SENT', 'FOLLOWED_UP', 'REPLIED', 'CLOSED'] as const).map((value) => (
              <SelectItem value={value} key={value}>{communicationStatusLabels[value]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Follow Up</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {crud.items.map((message) => (
                <TableRow key={message.id}>
                  <TableCell className="font-medium">{message.subject || '-'}</TableCell>
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
