import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [toggled, setToggled] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <AppSidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        toggled={toggled}
        setToggled={setToggled}
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Mobile Header (only visible on small screens to toggle sidebar) */}
        <header className="md:hidden flex items-center justify-between h-14 px-4 border-b border-border bg-card/95 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-xs shadow-xs">
              PE
            </div>
            <span className="font-bold tracking-tight text-sm">Dashboard PE</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setToggled(true)}>
            <Menu size={20} />
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8 xl:px-10">
          <div className="max-w-[1800px] mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
