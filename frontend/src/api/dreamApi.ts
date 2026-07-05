import { apiClient } from './apiClient';
import type { Dream, DreamRequest } from '../types/vision';

export function listDreams(token: string) {
  return apiClient<Dream[]>('/dreams', { token });
}

export function createDream(token: string, request: DreamRequest) {
  return apiClient<Dream>('/dreams', {
    method: 'POST',
    token,
    body: JSON.stringify(request),
  });
}

export function updateDream(token: string, id: number, request: DreamRequest) {
  return apiClient<Dream>(`/dreams/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(request),
  });
}

export function archiveDream(token: string, id: number) {
  return apiClient<void>(`/dreams/${id}`, {
    method: 'DELETE',
    token,
  });
}
