import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { APP_CONFIG } from '@/config/app.config';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

/**
 * Local login page while external SSO is disabled.
 */
export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await login({ username, password });
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Đăng nhập thất bại');
    } finally {
      setIsSubmitting(false);
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

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Tên đăng nhập"
            autoComplete="username"
            required
          />
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mật khẩu"
            autoComplete="current-password"
            required
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 font-semibold text-sm shadow-md bg-primary hover:bg-primary/90 flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
