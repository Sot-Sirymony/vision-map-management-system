import { apiClient } from './apiClient';
import type { DashboardSummary } from '../types/vision';

export function getDashboardSummary(token: string) {
  return apiClient<DashboardSummary>('/dashboard', { token });
}
