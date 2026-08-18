import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, ThemeProvider } from 'glintly-ui';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import DashboardPage from '@/pages/DashboardPage';
import PlatformPage from '@/pages/PlatformPage';
import InstagramAccountsPage from '@/pages/InstagramAccountsPage';
import InstagramDetailPage from '@/pages/InstagramDetailPage';
import DocsPage from '@/pages/DocsPage';

export default function App() {
  return (
    <ThemeProvider config={{ defaultMode: 'light' }}>
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
          <Route path="linkedin" element={<PlatformPage type="linkedin" />} />
          <Route path="instagram" element={<InstagramAccountsPage />} />
          <Route path="instagram/:connectionId" element={<InstagramDetailPage />} />
          <Route path="youtube" element={<PlatformPage type="youtube" />} />
          <Route path="community" element={<PlatformPage type="community" />} />
          <Route path="docs" element={<DocsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="top-right" />
    </ThemeProvider>
  );
}
