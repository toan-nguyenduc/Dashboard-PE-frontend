import { useState } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu, sidebarClasses } from 'react-pro-sidebar';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Activity, Database, BarChart2, Eye, Settings, Cpu, FileJson, UserCircle, LogOut, Sun, Moon, ChevronLeft, ChevronRight, Info, ChevronUp, ChevronDown } from 'lucide-react';
import { APP_CONFIG } from '@/config/app.config';
import { UserProfileDialog } from '@/auth/components/UserProfileDialog';
import { LogoutConfirmDialog } from '@/auth/components/LogoutConfirmDialog';

interface AppSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggled: boolean;
  setToggled: (toggled: boolean) => void;
  isMobile: boolean;
}

export function AppSidebar({ collapsed, setCollapsed, toggled, setToggled, isMobile }: AppSidebarProps) {
  const { isDark, toggleTheme } = useTheme();
  const { username, logout, updateUser } = useAuth();
  const location = useLocation();

  const [isUserExpanded, setIsUserExpanded] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Material UI Color palette
  const themeColors = isDark
    ? {
        sidebarBg: '#121212', // Material UI dark background
        subMenuBg: '#1e1e1e', // Material UI dark surface
        menuItemText: '#b0bec5',
        menuItemTextHover: '#ffffff',
        menuItemBgHover: '#292929',
        menuItemBgActive: '#292929',
        menuItemTextActive: '#90caf9', // Material UI blue 200
      }
    : {
        sidebarBg: '#ffffff',
        subMenuBg: '#f8f9fa',
        menuItemText: '#5e6278',
        menuItemTextHover: '#181c32',
        menuItemBgHover: '#f5f8fa',
        menuItemBgActive: '#f5f8fa',
        menuItemTextActive: '#1976d2',
      };

  return (
    <>
      <Sidebar
        collapsed={collapsed}
        toggled={toggled}
        onBackdropClick={() => setToggled(false)}
        breakPoint="md"
        backgroundColor={themeColors.sidebarBg}
        rootStyles={{
          [`.${sidebarClasses.container}`]: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: themeColors.sidebarBg,
          },
          ['.ps-submenu-content']: {
            backgroundColor: `${themeColors.subMenuBg} !important`,
          },
          ['.ps-menuitem-root']: {
            backgroundColor: 'transparent',
          },
          borderRight: isDark ? '1px solid #333333' : '1px solid #eff2f5',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 min-h-[64px] border-b border-border/50">
          {!collapsed && (
            <div className="flex items-center gap-2 select-none overflow-hidden font-inter">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-sm shadow-md shrink-0">
                PE
              </div>
              <span className="font-bold tracking-tight text-base whitespace-nowrap">
                {APP_CONFIG.title}
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setCollapsed(!collapsed);
              setIsUserExpanded(false);
            }}
            className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 mx-auto"
            title={collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none font-inter text-sm">
          <Menu
            menuItemStyles={{
              button: ({ active }) => ({
                color: active ? themeColors.menuItemTextActive : themeColors.menuItemText,
                backgroundColor: active ? themeColors.menuItemBgActive : 'transparent',
                fontWeight: active ? 600 : 500,
                fontFamily: 'Inter, Roboto, sans-serif',
                '&:hover': {
                  backgroundColor: themeColors.menuItemBgHover,
                  color: themeColors.menuItemTextHover,
                },
              }),
              subMenuContent: () => ({
                backgroundColor: themeColors.subMenuBg,
              }),
            }}
          >
            <MenuItem 
              component={<Link to="/" />} 
              active={location.pathname === '/'}
              icon={<Activity size={20} />}
            >
              Giám sát Transcode
            </MenuItem>
            <MenuItem 
              component={<Link to="/csm-media" />} 
              active={location.pathname.startsWith('/csm-media')}
              icon={<Database size={20} />}
            >
              Kho video CSM
            </MenuItem>
            <MenuItem 
              component={<Link to="/kpi-chart" />} 
              active={location.pathname === '/kpi-chart'}
              icon={<BarChart2 size={20} />}
            >
              Biểu đồ KPI
            </MenuItem>
            <MenuItem 
              component={<Link to="/visual-vmaf" />} 
              active={location.pathname === '/visual-vmaf'}
              icon={<Eye size={20} />}
            >
              Visual VMAF
            </MenuItem>

            <SubMenu 
              label="Config CSM" 
              icon={<Settings size={20} />}
              active={location.pathname.startsWith('/config-csm')}
              defaultOpen={location.pathname.startsWith('/config-csm')}
            >
              <MenuItem 
                component={<Link to="/config-csm/profile" />}
                active={location.pathname === '/config-csm/profile'}
                icon={<UserCircle size={18} />}
              >
                CSM Profile
              </MenuItem>
              <MenuItem 
                component={<Link to="/config-csm/detail-gpu" />}
                active={location.pathname === '/config-csm/detail-gpu'}
                icon={<Cpu size={18} />}
              >
                Detail GPU
              </MenuItem>
              <MenuItem 
                component={<Link to="/config-csm/profile-master" />}
                active={location.pathname === '/config-csm/profile-master'}
                icon={<FileJson size={18} />}
              >
                CSM Profile Master
              </MenuItem>
            </SubMenu>
          </Menu>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border mt-auto flex flex-col gap-2 font-inter">
          {/* User Info Inline Drawer (Pushes up from that line) */}
          {isUserExpanded && !collapsed && (
            <div className="p-2 rounded-xl bg-card border border-border shadow-md space-y-1 animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
              <div className="px-2.5 py-1.5 border-b border-border/60">
                <p className="text-xs font-bold text-foreground truncate font-inter">
                  {username || 'Admin'}
                </p>
                <p className="text-[11px] text-muted-foreground font-roboto truncate">
                  {localStorage.getItem('pe_user_email') || 'admin@viettel.vn'}
                </p>
              </div>

              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-xs font-medium font-inter h-8 hover:bg-muted"
                onClick={() => {
                  setIsUserExpanded(false);
                  if (isMobile) setToggled(false);
                  setIsUserProfileOpen(true);
                }}
              >
                <Info size={14} className="mr-2 text-primary" />
                Thông tin
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-xs font-medium font-inter h-8 text-destructive hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20"
                onClick={() => {
                  setIsUserExpanded(false);
                  if (isMobile) setToggled(false);
                  setIsLogoutConfirmOpen(true);
                }}
              >
                <LogOut size={14} className="mr-2" />
                Đăng xuất
              </Button>
            </div>
          )}

          {/* User Avatar Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (collapsed) {
                setCollapsed(false);
                setIsUserExpanded(true);
              } else {
                setIsUserExpanded(!isUserExpanded);
              }
            }}
            className={`justify-${collapsed ? 'center' : 'between'} px-2.5 py-2 w-full h-9 font-inter text-xs sm:text-sm font-medium border-border/80 bg-background hover:bg-muted/50`}
            title="Tài khoản cá nhân"
          >
            <div className="flex items-center gap-2 truncate">
              <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                {(username || 'Admin').charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <span className="font-inter text-xs font-semibold text-foreground truncate max-w-[120px] text-left">
                  {username || 'Admin'}
                </span>
              )}
            </div>
            {!collapsed && (
              <span className="text-muted-foreground shrink-0 ml-1">
                {isUserExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </span>
            )}
          </Button>

          {/* Theme Mode Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className={`justify-${collapsed ? 'center' : 'start'} px-2.5 py-2 w-full h-9 font-inter text-xs sm:text-sm font-medium border-border/80 hover:bg-muted/50`}
            title={isDark ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
          >
            {isDark ? <Sun size={17} className="text-yellow-500 shrink-0" /> : <Moon size={17} className="text-blue-500 shrink-0" />}
            {!collapsed && (
              <span className="ml-2 font-inter text-xs font-semibold text-foreground tracking-tight">
                {isDark ? 'Chế độ Sáng' : 'Chế độ Tối'}
              </span>
            )}
          </Button>
        </div>
      </Sidebar>

      {/* User Profile Dialog (View & Edit) */}
      <UserProfileDialog
        open={isUserProfileOpen}
        onOpenChange={setIsUserProfileOpen}
        onProfileUpdated={(newName) => updateUser(newName)}
      />

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        open={isLogoutConfirmOpen}
        onOpenChange={setIsLogoutConfirmOpen}
        onConfirm={logout}
      />
    </>
  );
}
