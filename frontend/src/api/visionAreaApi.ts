import { apiClient } from './apiClient';
import type { VisionArea, VisionAreaRequest } from '../types/vision';

export function listVisionAreas(token: string) {
  return apiClient<VisionArea[]>('/vision-areas', { token });
}

export function createVisionArea(token: string, request: VisionAreaRequest) {
  return apiClient<VisionArea>('/vision-areas', {
    method: 'POST',
    token,
    body: JSON.stringify(request),
  });
}

export function updateVisionArea(token: string, id: number, request: VisionAreaRequest) {
  return apiClient<VisionArea>(`/vision-areas/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(request),
  });
}

export function archiveVisionArea(token: string, id: number) {
  return apiClient<void>(`/vision-areas/${id}`, {
    method: 'DELETE',
    token,
  });
}
