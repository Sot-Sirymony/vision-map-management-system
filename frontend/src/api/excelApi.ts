import { apiClient } from './apiClient';
import type { ExcelImportSummary } from '../types/vision';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

export async function exportExcelWorkbook(token: string) {
  const response = await fetch(`${API_BASE_URL}/excel/export`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Export failed with status ${response.status}`);
  }

  return response.blob();
}

export function importExcelWorkbook(token: string, file: File) {
  const body = new FormData();
  body.append('file', file);
  return apiClient<ExcelImportSummary>('/excel/import', {
    method: 'POST',
    token,
    body,
  });
}
