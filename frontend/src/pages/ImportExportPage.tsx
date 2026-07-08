import { ChangeEvent, useState } from 'react';
import { exportExcelWorkbook, importExcelWorkbook } from '../api/excelApi';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { Button } from '../components/common/Button';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Loading } from '../components/common/Loading';
import { useAuth } from '../context/AuthContext';
import type { ExcelImportSummary } from '../types/vision';
import { PageSection } from './PageSection';

export function ImportExportPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<ExcelImportSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleExport() {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const blob = await exportExcelWorkbook(token);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vision-mapping-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
      setError('');
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : 'Unable to export workbook.');
    } finally {
      setLoading(false);
    }
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!token || !file) {
      return;
    }
    setLoading(true);
    try {
      setSummary(await importExcelWorkbook(token, file));
      setError('');
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : 'Unable to import workbook.');
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  }

  return (
    <PageSection title="Import / Export" subtitle="Move Vision Mapping data between the system and Excel.">
      {loading && <Loading />}
      {error && <ErrorMessage message={error} />}
      <div className="two-column">
        <Card>
          <CardHeader title="Import Excel" />
          <CardContent>
            <label className="button button-secondary">
              Choose workbook
              <input type="file" accept=".xlsx" hidden onChange={(event) => void handleImport(event)} />
            </label>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Export Excel" />
          <CardContent>
            <Button type="button" onClick={() => void handleExport()}>Export workbook</Button>
          </CardContent>
        </Card>
      </div>
      {summary && (
        <Card>
          <CardHeader title="Import Summary" />
          <CardContent>
            <div className="metric-grid">
              <div className="metric-card">
                <p>Created</p>
                <strong>{summary.createdRecords}</strong>
              </div>
              <div className="metric-card">
                <p>Skipped</p>
                <strong>{summary.skippedRecords}</strong>
              </div>
              <div className="metric-card">
                <p>Sheets</p>
                <strong>{Object.keys(summary.rowsBySheet).length}</strong>
              </div>
              <div className="metric-card">
                <p>Errors</p>
                <strong>{summary.validationErrors.length}</strong>
              </div>
            </div>
            {summary.validationErrors.length > 0 && (
              <div className="stack-list">
                {summary.validationErrors.map((validationError) => (
                  <ErrorMessage message={validationError} key={validationError} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </PageSection>
  );
}
