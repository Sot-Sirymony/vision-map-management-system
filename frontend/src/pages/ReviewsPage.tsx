import { FormEvent, useEffect, useState } from 'react';
import { listDreams } from '../api/dreamApi';
import { archiveReview, createReview, listReviews, updateReview } from '../api/reviewApi';
import { listVisionAreas } from '../api/visionAreaApi';
import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { Modal } from '../components/common/Modal';
import { Select } from '../components/common/Select';
import { StatusBadge } from '../components/common/StatusBadge';
import { Textarea } from '../components/common/Textarea';
import { useAuth } from '../context/AuthContext';
import type { Dream, Review, ReviewType, VisionArea } from '../types/vision';
import { PageSection } from './PageSection';

export function ReviewsPage() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [visionAreas, setVisionAreas] = useState<VisionArea[]>([]);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [reviewType, setReviewType] = useState<ReviewType>('WEEKLY');
  const [reviewDate, setReviewDate] = useState(new Date().toISOString().slice(0, 10));
  const [relatedVisionAreaId, setRelatedVisionAreaId] = useState('');
  const [relatedDreamId, setRelatedDreamId] = useState('');
  const [summary, setSummary] = useState('');
  const [completedTasks, setCompletedTasks] = useState('');
  const [blockedTasks, setBlockedTasks] = useState('');
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [nextActions, setNextActions] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  async function load() {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const [reviewData, areaData, dreamData] = await Promise.all([listReviews(token), listVisionAreas(token), listDreams(token)]);
      setReviews(reviewData);
      setVisionAreas(areaData);
      setDreams(dreamData);
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load reviews.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token) {
      return;
    }
    setSaving(true);
    try {
      const request = {
        reviewType,
        reviewDate,
        relatedVisionAreaId: optionalNumber(relatedVisionAreaId),
        relatedDreamId: optionalNumber(relatedDreamId),
        summary,
        completedTasks,
        blockedTasks,
        lessonsLearned,
        nextActions,
      };
      if (editingId !== null) {
        await updateReview(token, editingId, request);
        setEditingId(null);
      } else {
        await createReview(token, request);
      }
      setSummary('');
      setCompletedTasks('');
      setBlockedTasks('');
      setLessonsLearned('');
      setNextActions('');
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save review.');
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(id: number) {
    if (!token) {
      return;
    }
    try {
      await archiveReview(token, id);
      await load();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : 'Unable to archive review.');
    }
  }

  function startEdit(review: Review) {
    setEditingId(review.id);
    setReviewType(review.reviewType);
    setReviewDate(review.reviewDate);
    setRelatedVisionAreaId(review.relatedVisionAreaId ? String(review.relatedVisionAreaId) : '');
    setRelatedDreamId(review.relatedDreamId ? String(review.relatedDreamId) : '');
    setSummary(review.summary ?? '');
    setCompletedTasks(review.completedTasks ?? '');
    setBlockedTasks(review.blockedTasks ?? '');
    setLessonsLearned(review.lessonsLearned ?? '');
    setNextActions(review.nextActions ?? '');
  }

  function cancelEdit() {
    setEditingId(null);
    setReviewType('WEEKLY');
    setReviewDate(new Date().toISOString().slice(0, 10));
    setRelatedVisionAreaId('');
    setRelatedDreamId('');
    setSummary('');
    setCompletedTasks('');
    setBlockedTasks('');
    setLessonsLearned('');
    setNextActions('');
  }

  const formFields = (
    <>
      <label>
        Type
        <Select value={reviewType} onChange={(event) => setReviewType(event.target.value as ReviewType)}>
          {['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY'].map((value) => (
            <option value={value} key={value}>{formatLabel(value)}</option>
          ))}
        </Select>
      </label>
      <label>
        Date
        <Input type="date" value={reviewDate} onChange={(event) => setReviewDate(event.target.value)} required />
      </label>
      <label>
        Vision Area
        <Select value={relatedVisionAreaId} onChange={(event) => setRelatedVisionAreaId(event.target.value)}>
          <option value="">None</option>
          {visionAreas.map((area) => <option value={area.id} key={area.id}>{area.name}</option>)}
        </Select>
      </label>
      <label>
        Dream
        <Select value={relatedDreamId} onChange={(event) => setRelatedDreamId(event.target.value)}>
          <option value="">None</option>
          {dreams.map((dream) => <option value={dream.id} key={dream.id}>{dream.title}</option>)}
        </Select>
      </label>
      <label className="field-full">
        Summary
        <Textarea value={summary} onChange={(event) => setSummary(event.target.value)} />
      </label>
      <label className="field-full">
        Completed Tasks
        <Textarea value={completedTasks} onChange={(event) => setCompletedTasks(event.target.value)} />
      </label>
      <label className="field-full">
        Blocked Tasks
        <Textarea value={blockedTasks} onChange={(event) => setBlockedTasks(event.target.value)} />
      </label>
      <label className="field-full">
        Lessons Learned
        <Textarea value={lessonsLearned} onChange={(event) => setLessonsLearned(event.target.value)} />
      </label>
      <label className="field-full">
        Next Actions
        <Textarea value={nextActions} onChange={(event) => setNextActions(event.target.value)} />
      </label>
    </>
  );

  return (
    <PageSection title="Reviews" subtitle="Record daily, weekly, monthly, and quarterly reflections.">
      {editingId === null && (
        <div className="panel">
          <form className="form-grid" onSubmit={handleSubmit}>
            {formFields}
            <div className="field-full">
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create review'}</Button>
            </div>
          </form>
        </div>
      )}
      {editingId !== null && (
        <Modal title="Edit Review" onClose={cancelEdit}>
          <form className="form-grid" onSubmit={handleSubmit}>
            {formFields}
            <div className="field-full row-actions">
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
              <Button type="button" variant="secondary" onClick={cancelEdit}>Cancel</Button>
            </div>
          </form>
        </Modal>
      )}
      {loading && <Loading />}
      {error && <ErrorMessage message={error} />}
      <div className="panel table-wrap">
        {reviews.length === 0 ? (
          <div className="empty-state">No reviews yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Date</th>
                <th>Summary</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td><StatusBadge status={review.reviewType} /></td>
                  <td>{review.reviewDate}</td>
                  <td>{review.summary || '-'}</td>
                  <td><StatusBadge status={review.archived ? 'ARCHIVED' : 'ACTIVE'} /></td>
                  <td className="row-actions">
                    <Button type="button" variant="secondary" onClick={() => startEdit(review)}>Edit</Button>
                    <Button type="button" variant="secondary" onClick={() => void handleArchive(review.id)}>Archive</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
