import { FormEvent, useEffect, useState } from 'react';
import { archiveCommunicationMessage, createCommunicationMessage, listCommunicationMessages, updateCommunicationMessage } from '../api/communicationApi';
import { listDreams } from '../api/dreamApi';
import { listGoals } from '../api/goalApi';
import { listPartners } from '../api/partnerApi';
import { listTasks } from '../api/taskApi';
import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { Modal } from '../components/common/Modal';
import { Select } from '../components/common/Select';
import { StatusBadge } from '../components/common/StatusBadge';
import { Textarea } from '../components/common/Textarea';
import { useAuth } from '../context/AuthContext';
import type { CommunicationMessage, CommunicationStatus, Dream, Goal, Partner, TaskItem } from '../types/vision';
import { PageSection } from './PageSection';

export function CommunicationBuilderPage() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  async function load() {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const [messagePage, partnerPage, dreamData, goalData, taskData] = await Promise.all([
        listCommunicationMessages(token, page, 20),
        listPartners(token, 0, 500),
        listDreams(token),
        listGoals(token),
        listTasks(token),
      ]);
      setMessages(messagePage.content);
      setTotalPages(messagePage.totalPages);
      setPartners(partnerPage.content);
      setDreams(dreamData);
      setGoals(goalData);
      setTasks(taskData);
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load communication messages.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [token, page]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token) {
      return;
    }
    setSaving(true);
    try {
      const request_ = {
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
      };
      if (editingId !== null) {
        await updateCommunicationMessage(token, editingId, request_);
        setEditingId(null);
      } else {
        await createCommunicationMessage(token, request_);
      }
      setSubject('');
      setPurpose('');
      setRequest('');
      setExpectedOutcome('');
      setMessageBody('');
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save message.');
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(id: number) {
    if (!token) {
      return;
    }
    try {
      await archiveCommunicationMessage(token, id);
      await load();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : 'Unable to archive message.');
    }
  }

  function startEdit(message: CommunicationMessage) {
    setEditingId(message.id);
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
    setEditingId(null);
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
        <Select value={partnerId} onChange={(event) => setPartnerId(event.target.value)}>
          <option value="">None</option>
          {partners.map((partner) => <option value={partner.id} key={partner.id}>{partner.name}</option>)}
        </Select>
      </label>
      <label>
        Audience
        <Input value={audience} onChange={(event) => setAudience(event.target.value)} />
      </label>
      <label>
        Dream
        <Select value={relatedDreamId} onChange={(event) => setRelatedDreamId(event.target.value)}>
          <option value="">None</option>
          {dreams.map((dream) => <option value={dream.id} key={dream.id}>{dream.title}</option>)}
        </Select>
      </label>
      <label>
        Goal
        <Select value={relatedGoalId} onChange={(event) => setRelatedGoalId(event.target.value)}>
          <option value="">None</option>
          {goals.map((goal) => <option value={goal.id} key={goal.id}>{goal.title}</option>)}
        </Select>
      </label>
      <label>
        Task
        <Select value={relatedTaskId} onChange={(event) => setRelatedTaskId(event.target.value)}>
          <option value="">None</option>
          {tasks.map((task) => <option value={task.id} key={task.id}>{task.title}</option>)}
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
        <Select value={status} onChange={(event) => setStatus(event.target.value as CommunicationStatus)}>
          {['DRAFT', 'SENT', 'FOLLOWED_UP', 'REPLIED', 'CLOSED'].map((value) => (
            <option value={value} key={value}>{formatLabel(value)}</option>
          ))}
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
      {editingId === null && (
        <div className="panel">
          <form className="form-grid" onSubmit={handleSubmit}>
            {formFields}
            <div className="field-full row-actions">
              <Button type="button" variant="secondary" onClick={handleGenerateMessage}>Generate message</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save message'}</Button>
            </div>
          </form>
        </div>
      )}
      {editingId !== null && (
        <Modal title="Edit Message" onClose={cancelEdit}>
          <form className="form-grid" onSubmit={handleSubmit}>
            {formFields}
            <div className="field-full row-actions">
              <Button type="button" variant="secondary" onClick={handleGenerateMessage}>Generate message</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
              <Button type="button" variant="secondary" onClick={cancelEdit}>Cancel</Button>
            </div>
          </form>
        </Modal>
      )}
      {loading && <Loading />}
      {error && <ErrorMessage message={error} />}
      <div className="panel table-wrap">
        {messages.length === 0 ? (
          <div className="empty-state">No messages yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Audience</th>
                <th>Status</th>
                <th>Follow Up</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr key={message.id}>
                  <td>{message.subject || '-'}</td>
                  <td>{message.audience || '-'}</td>
                  <td><StatusBadge status={message.status} /></td>
                  <td>{message.followUpDate || '-'}</td>
                  <td className="row-actions">
                    <Button type="button" variant="secondary" onClick={() => startEdit(message)}>Edit</Button>
                    <Button type="button" variant="secondary" onClick={() => void handleArchive(message.id)}>Archive</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {totalPages > 1 && (
          <div className="pagination">
            <Button type="button" variant="secondary" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>Previous</Button>
            <span>Page {page + 1} of {totalPages}</span>
            <Button type="button" variant="secondary" disabled={page + 1 >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button>
          </div>
        )}
      </div>
    </PageSection>
  );
}

function optionalNumber(value: string) {
  return value ? Number(value) : undefined;
}

function formatLabel(value: string) {
  return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}
