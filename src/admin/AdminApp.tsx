import type { ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './auth';
import AdminLayout from './layout/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PostsPage from './pages/PostsPage';
import PostEditorPage from './pages/PostEditorPage';
import InquiriesPage from './pages/InquiriesPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectEditorPage from './pages/ProjectEditorPage';

function RequireAdmin({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="admin-loader">
        <span className="spinner-border text-primary" role="status" aria-label="Checking your session" />
      </div>
    );
  }
  if (status !== 'admin') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

export default function AdminApp() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="posts" element={<PostsPage />} />
        <Route path="posts/new" element={<PostEditorPage />} />
        <Route path="posts/:id" element={<PostEditorPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/new" element={<ProjectEditorPage />} />
        <Route path="projects/:id" element={<ProjectEditorPage />} />
        <Route path="inquiries" element={<InquiriesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
