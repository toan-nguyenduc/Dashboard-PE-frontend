import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/auth/context/AuthContext";
import { ProtectedRoute } from "@/auth/guards/ProtectedRoute";
import { LoginPage } from "@/auth/components/LoginPage";
import { Layout } from "@/components/Layout";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import { ConfigProvider } from "antd";
import { getAntdTheme } from "@/config/antd-theme";
import "@/styles/index.css";

import { VideoListPage } from "@/features/video/pages/VideoListPage";
import { CsmMediaListPage } from "@/features/csm-media/pages/CsmMediaListPage";
import { KpiChartPage } from "@/features/placeholder/KpiChartPage";
import { VisualVmafPage } from "@/features/placeholder/VisualVmafPage";
import { ConfigCsmPage } from "@/features/placeholder/ConfigCsmPage";

function AntdConfigWrapper({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();
  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      {children}
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AntdConfigWrapper>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public login route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected dashboard routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<VideoListPage />} />
                <Route path="csm-media" element={<CsmMediaListPage />} />
                <Route path="kpi-chart" element={<KpiChartPage />} />
                <Route path="visual-vmaf" element={<VisualVmafPage />} />
                <Route path="config-csm/*" element={<ConfigCsmPage />} />
                {/* Fallback inside Layout */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>

              {/* Global Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </BrowserRouter>
      </AntdConfigWrapper>
    </ThemeProvider>
  );
}

export default App;

