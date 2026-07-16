import { apiClient } from './apiClient';
import type { IdealPartnerProfile, IdealPartnerProfileRequest } from '../types/vision';

export function listIdealPartnerProfiles(token: string, includeArchived = false) {
  return apiClient<IdealPartnerProfile[]>(`/ideal-partner-profiles?includeArchived=${includeArchived}`, { token });
}

export function createIdealPartnerProfile(token: string, request: IdealPartnerProfileRequest) {
  return apiClient<IdealPartnerProfile>('/ideal-partner-profiles', {
    method: 'POST',
    token,
    body: JSON.stringify(request),
  });
}

export function updateIdealPartnerProfile(token: string, id: number, request: IdealPartnerProfileRequest) {
  return apiClient<IdealPartnerProfile>(`/ideal-partner-profiles/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(request),
  });
}

export function archiveIdealPartnerProfile(token: string, id: number) {
  return apiClient<void>(`/ideal-partner-profiles/${id}`, {
    method: 'DELETE',
    token,
  });
}
