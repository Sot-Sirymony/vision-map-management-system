import { apiClient } from './apiClient';
import type { Review, ReviewRequest } from '../types/vision';

export function listReviews(token: string) {
  return apiClient<Review[]>('/reviews', { token });
}

export function createReview(token: string, request: ReviewRequest) {
  return apiClient<Review>('/reviews', {
    method: 'POST',
    token,
    body: JSON.stringify(request),
  });
}

export function updateReview(token: string, id: number, request: ReviewRequest) {
  return apiClient<Review>(`/reviews/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(request),
  });
}

export function archiveReview(token: string, id: number) {
  return apiClient<void>(`/reviews/${id}`, {
    method: 'DELETE',
    token,
  });
}
