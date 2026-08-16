import { Routes, Route, Navigate } from 'react-router-dom';
import { BackendStatusBanner, ToastContainer, ThemeProvider } from 'glintly-ui';
import { resolveBackendHealthUrl } from '@/utils/backendHealthUrl';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import DashboardPage from '@/pages/DashboardPage';
import ComposePage from '@/pages/ComposePage';
import ConnectionsPage from '@/pages/ConnectionsPage';
import PostsPage from '@/pages/PostsPage';
import AutoRunPage from '@/pages/AutoRunPage';
import AutoRunDetailPage from '@/pages/AutoRunDetailPage';
import DocsPage from '@/pages/DocsPage';

export default function App() {
  return (
    <ThemeProvider config={{ defaultMode: 'light' }}>
      <BackendStatusBanner healthCheckUrl={resolveBackendHealthUrl()} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="compose" element={<ComposePage />} />
          <Route path="connections" element={<ConnectionsPage />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="auto" element={<AutoRunPage />} />
          <Route path="auto/:contextId" element={<AutoRunDetailPage />} />
          <Route path="docs" element={<DocsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="top-right" />
    </ThemeProvider>
  );
}
