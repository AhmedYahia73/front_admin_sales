import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';

export const MainLayout = () => {
  // Desktop collapsed state (true = expanded w-64, false = collapsed w-20)
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(true);
  // Mobile drawer open state
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route navigation
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setIsDesktopExpanded((prev) => !prev);
    } else {
      setIsMobileOpen((prev) => !prev);
    }
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={closeMobileSidebar}
          onKeyDown={(e) => {
            if (e.key === 'Escape') closeMobileSidebar();
          }}
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isDesktopExpanded}
        isDesktopExpanded={isDesktopExpanded}
        isMobileOpen={isMobileOpen}
        toggleSidebar={toggleSidebar}
        closeMobileSidebar={closeMobileSidebar}
      />
      
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 min-w-0 flex flex-col ${
          isDesktopExpanded ? 'lg:ml-64' : 'lg:ml-20'
        } ml-0`}
      >
        <Navbar onToggleSidebar={toggleSidebar} />
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-8 w-full max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};