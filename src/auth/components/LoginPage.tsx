import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { APP_CONFIG } from '@/config/app.config';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Keycloak SSO Login Page.
 * Pure centralized authentication via Keycloak OIDC/PKCE.
 */
export function LoginPage() {
  const [ssoLoading, setSsoLoading] = useState(false);
  const { loginWithKeycloak, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleKeycloakLogin = async () => {
    setSsoLoading(true);
    try {
      await loginWithKeycloak();
    } catch {
      toast.error('Không thể kết nối đến máy chủ Keycloak SSO. Vui lòng kiểm tra lại dịch vụ.');
      setSsoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-sm p-6 sm:p-8 bg-card border-border shadow-xl relative z-10 rounded-2xl">
        <div className="text-center mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xl shadow-md mx-auto mb-3">
            PE
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            {APP_CONFIG.title}
          </h1>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            Hệ thống giám sát và quản lý Pertitle Encoding (PE)
          </p>
        </div>

        {/* Primary Keycloak SSO Action */}
        <div className="space-y-4">
          <Button
            type="button"
            onClick={handleKeycloakLogin}
            disabled={ssoLoading}
            className="w-full h-11 font-semibold text-sm shadow-md bg-primary hover:bg-primary/90 flex items-center justify-center gap-2"
          >
            <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-primary-foreground/20">SSO</span>
            <span>{ssoLoading ? 'Đang chuyển hướng...' : 'Đăng nhập với Keycloak SSO'}</span>
          </Button>

          <div className="text-center">
            <span className="text-[11px] text-muted-foreground font-mono">
              Keycloak OpenID Connect
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
