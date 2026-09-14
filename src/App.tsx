import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/auth/context/AuthContext';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { LoginPage } from '@/auth/components/LoginPage';
import { Layout } from '@/components/Layout';
import { VideoListPage } from '@/features/video/pages/VideoListPage';
import { CsmMediaListPage } from '@/features/csm-media/pages/CsmMediaListPage';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from '@/components/ui/sonner';
import '@/styles/index.css';

/**
 * Root application component with Dark/Light ThemeProvider and Sonner Toaster.
 */
function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public login route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected dashboard routes */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<VideoListPage />} />
              <Route path="/csm-media" element={<CsmMediaListPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
