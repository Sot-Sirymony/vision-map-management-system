import { apiClient } from './apiClient';
import type { ProgressLog } from '../types/vision';

export function listProgressLogs(token: string) {
  return apiClient<ProgressLog[]>('/progress-logs', { token });
}
