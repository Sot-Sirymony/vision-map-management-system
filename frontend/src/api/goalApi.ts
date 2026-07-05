import { apiClient } from './apiClient';
import type { Goal, GoalRequest } from '../types/vision';

export function listGoals(token: string) {
  return apiClient<Goal[]>('/goals', { token });
}

export function createGoal(token: string, request: GoalRequest) {
  return apiClient<Goal>('/goals', {
    method: 'POST',
    token,
    body: JSON.stringify(request),
  });
}

export function updateGoal(token: string, id: number, request: GoalRequest) {
  return apiClient<Goal>(`/goals/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(request),
  });
}

export function archiveGoal(token: string, id: number) {
  return apiClient<void>(`/goals/${id}`, {
    method: 'DELETE',
    token,
  });
}
