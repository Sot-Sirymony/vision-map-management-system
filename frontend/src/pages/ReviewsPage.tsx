import { FormEvent, useEffect, useState } from 'react';
import { listDreams } from '../api/dreamApi';
import { archiveReview, createReview, listReviews, updateReview } from '../api/reviewApi';
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
import type { Dream, Review, ReviewRequest, ReviewType, VisionArea } from '../types/vision';
import { reviewTypeLabels } from '../utils/enumLabels';
import { PageSection } from './PageSection';

export function ReviewsPage() {
  const { token } = useAuth();
  const crud = useCrudEntity<Review, ReviewRequest>({
    token,
    entityLabel: 'reviews',
    list: listReviews,
    create: createReview,
    update: updateReview,
    archive: archiveReview,
  });
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

  useEffect(() => {
    if (!token) {
      return;
    }
    void crud.reload();
    void Promise.all([listVisionAreas(token), listDreams(token)]).then(([areaData, dreamData]) => {
      setVisionAreas(areaData);
      setDreams(dreamData);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const success = await crud.save({
      reviewType,
      reviewDate,
      relatedVisionAreaId: optionalNumber(relatedVisionAreaId),
      relatedDreamId: optionalNumber(relatedDreamId),
      summary,
      completedTasks,
      blockedTasks,
      lessonsLearned,
      nextActions,
    });
    if (success) {
      setSummary('');
      setCompletedTasks('');
      setBlockedTasks('');
      setLessonsLearned('');
      setNextActions('');
    }
  }

  function startEdit(review: Review) {
    crud.startEdit(review.id);
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
    crud.cancelEdit();
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
        <Select value={reviewType} onValueChange={(value) => setReviewType(value as ReviewType)}>
          <SelectTrigger className="w-full">
            <SelectValue>{(value: ReviewType) => reviewTypeLabels[value]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY'] as const).map((value) => (
              <SelectItem value={value} key={value}>{reviewTypeLabels[value]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      <label>
        Date
        <Input type="date" value={reviewDate} onChange={(event) => setReviewDate(event.target.value)} required />
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
      <CrudModalForm
        editing={crud.editingId !== null}
        createLabel="Create review"
        editTitle="Edit Review"
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
          <EmptyState>No reviews yet.</EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {crud.items.map((review) => (
                <TableRow key={review.id}>
                  <TableCell><StatusBadge status={review.reviewType} /></TableCell>
                  <TableCell>{review.reviewDate}</TableCell>
                  <TableCell>{review.summary || '-'}</TableCell>
                  <TableCell><StatusBadge status={review.archived ? 'ARCHIVED' : 'ACTIVE'} /></TableCell>
                  <TableCell className="row-actions">
                    <Button type="button" variant="secondary" onClick={() => startEdit(review)}>Edit</Button>
                    <Button type="button" variant="secondary" onClick={() => void crud.archive(review.id)}>Archive</Button>
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

function optionalNumber(value: string) {
  return value ? Number(value) : undefined;
}
