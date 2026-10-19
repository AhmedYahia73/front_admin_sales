import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronLeft, User, Menu } from 'lucide-react';
import { removeAuthToken } from '@/utils/auth';
import { Button } from '@/components/ui/button';

export const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();

  // استرجاع بيانات المستخدم من LocalStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = userData?.name || 'User';

  const handleLogout = () => {
    // إزالة التوكن من الكوكيز
    removeAuthToken();
    // مسح بيانات المستخدم من الـ LocalStorage
    localStorage.removeItem('user');
    // التوجيه لصفحة الدخول
    navigate('/login', { replace: true });
  };

  return (
    <nav className="h-16 flex items-center justify-between px-3 sm:px-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-30 shadow-xs">
      {/* Navigation Buttons: Toggle Menu (Mobile) + Back Button */}
      <div className="flex items-center gap-1 sm:gap-2">
        {onToggleSidebar && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleSidebar}
            className="lg:hidden text-zinc-600 hover:text-primary dark:text-zinc-400"
            aria-label="Toggle Sidebar Menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="text-zinc-600 hover:text-primary dark:text-zinc-400"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
      </div>

      {/* User Information & Logout Button */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 max-w-[140px] sm:max-w-[200px]">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className="truncate">
            <span className="hidden sm:inline text-zinc-400 dark:text-zinc-500">Hello, </span>
            {userName}
          </span>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs sm:text-sm px-2.5 sm:px-3 h-8 sm:h-9 gap-1 sm:gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Logout</span>
        </Button>
      </div>
    </nav>
  );
};