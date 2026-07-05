import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { CommunicationBuilderPage } from './pages/CommunicationBuilderPage';
import { DashboardPage } from './pages/DashboardPage';
import { DreamDetailPage } from './pages/DreamDetailPage';
import { DreamsPage } from './pages/DreamsPage';
import { GoalsPage } from './pages/GoalsPage';
import { ImportExportPage } from './pages/ImportExportPage';
import { LoginPage } from './pages/LoginPage';
import { ObstaclesPage } from './pages/ObstaclesPage';
import { PartnersPage } from './pages/PartnersPage';
import { RegisterPage } from './pages/RegisterPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { StepsPage } from './pages/StepsPage';
import { TasksBoardPage } from './pages/TasksBoardPage';
import { VisionAreasPage } from './pages/VisionAreasPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/vision-areas" element={<VisionAreasPage />} />
          <Route path="/dreams" element={<DreamsPage />} />
          <Route path="/dreams/:dreamId" element={<DreamDetailPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/steps" element={<StepsPage />} />
          <Route path="/tasks" element={<TasksBoardPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/obstacles" element={<ObstaclesPage />} />
          <Route path="/communication" element={<CommunicationBuilderPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/import-export" element={<ImportExportPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
