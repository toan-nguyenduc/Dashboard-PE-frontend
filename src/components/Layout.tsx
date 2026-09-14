import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/hooks/useAuth';
import { APP_CONFIG } from '@/config/app.config';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  
  const { username, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      to: '/',
      label: 'Videos (PE)',
      desc: 'Giám sát tiến độ Transcode',
      code: 'VID',
    },
    {
      to: '/csm-media',
      label: 'CSM Media',
      desc: 'Kho media & Re-encode',
      code: 'CSM',
    },
  ];

  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ===== Top Header Bar ===== */}
      <header className="sticky top-0 z-40 h-14 border-b border-border bg-card/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Hamburger (Visible on mobile/tablet < md) */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Mở menu"
          >
            <span className="text-lg font-bold">☰</span>
          </Button>

          {/* Brand Logo & Title */}
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-sm shadow-xs">
              PE
            </div>
            <span className="font-bold tracking-tight text-base sm:text-lg hidden xs:inline">
              {APP_CONFIG.title}
            </span>
          </div>

          {/* Desktop Collapse Rail Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:inline-flex text-xs text-muted-foreground hover:text-foreground h-8 px-2"
          >
            {collapsed ? '▶ Mở rộng' : '◀ Thu gọn'}
          </Button>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="h-8 px-2.5 text-xs font-medium border-border"
            title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
          >
            {isDark ? '☀️ Sáng' : '🌙 Tối'}
          </Button>

          <Separator orientation="vertical" className="h-5 hidden sm:block" />

          {/* Username & Avatar */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-foreground">{username || 'Quản trị viên'}</span>
          </div>

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLogoutDialogOpen(true)}
            className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            Đăng xuất
          </Button>
        </div>
      </header>

      {/* ===== Main Body Wrapper ===== */}
      <div className="flex-1 flex overflow-hidden">
        {/* ===== Desktop Sidebar (md and up) ===== */}
        <aside
          className={cn(
            'hidden md:flex flex-col border-r border-border bg-card transition-all duration-200 shrink-0 select-none',
            collapsed ? 'w-16' : 'w-60'
          )}
        >
          <nav className="flex-1 p-2 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                  title={collapsed ? `${item.label} - ${item.desc}` : undefined}
                >
                  <span
                    className={cn(
                      'text-xs font-mono px-1.5 py-0.5 rounded tracking-wider',
                      isActive
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-foreground'
                    )}
                  >
                    {item.code}
                  </span>

                  {!collapsed && (
                    <div className="flex flex-col truncate">
                      <span className="truncate">{item.label}</span>
                      <span
                        className={cn(
                          'text-[11px] font-normal truncate',
                          isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        )}
                      >
                        {item.desc}
                      </span>
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar Footer info */}
          {!collapsed && (
            <div className="p-3 border-t border-border text-[11px] text-muted-foreground flex justify-between items-center">
              <span>Pertitle Encoding</span>
              <span className="font-mono">v1.0</span>
            </div>
          )}
        </aside>

        {/* ===== Mobile Sheet Drawer Navigation (< md) ===== */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-72 p-0 flex flex-col">
            <SheetHeader className="p-4 border-b border-border text-left">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-sm">
                  PE
                </div>
                <div>
                  <SheetTitle className="text-base font-bold">{APP_CONFIG.title}</SheetTitle>
                  <p className="text-xs text-muted-foreground">Hệ thống giám sát Transcode</p>
                </div>
              </div>
            </SheetHeader>

            <nav className="flex-1 p-3 space-y-1.5">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <span
                      className={cn(
                        'text-xs font-mono px-1.5 py-0.5 rounded tracking-wider',
                        isActive
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {item.code}
                    </span>
                    <div className="flex flex-col">
                      <span>{item.label}</span>
                      <span className={cn('text-xs font-normal', isActive ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                        {item.desc}
                      </span>
                    </div>
                  </NavLink>
                );
              })}
            </nav>

            <div className="p-4 border-t border-border bg-muted/20 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tài khoản:</span>
                <span className="font-semibold text-foreground">{username || 'Quản trị viên'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Chế độ giao diện:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTheme}
                  className="h-7 px-2 text-xs"
                >
                  {isDark ? '☀️ Sáng' : '🌙 Tối'}
                </Button>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="w-full text-xs mt-2"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setLogoutDialogOpen(true);
                }}
              >
                Đăng xuất
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* ===== Main Content Area ===== */}
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ===== Logout Confirmation Dialog ===== */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận đăng xuất</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống Dashboard PE không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>
              Hủy bỏ
            </Button>
            <Button variant="destructive" onClick={handleLogoutConfirm}>
              Đăng xuất
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
