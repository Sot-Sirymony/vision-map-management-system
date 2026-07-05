import { apiClient } from './apiClient';
import type { VisionStep, VisionStepRequest } from '../types/vision';

export function listSteps(token: string) {
  return apiClient<VisionStep[]>('/steps', { token });
}

export function createStep(token: string, request: VisionStepRequest) {
  return apiClient<VisionStep>('/steps', {
    method: 'POST',
    token,
    body: JSON.stringify(request),
  });
}

export function updateStep(token: string, id: number, request: VisionStepRequest) {
  return apiClient<VisionStep>(`/steps/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(request),
  });
}

export function archiveStep(token: string, id: number) {
  return apiClient<void>(`/steps/${id}`, {
    method: 'DELETE',
    token,
  });
}
