import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Heart, Calendar, Target, CheckCircle, User,
  TrendingUp, Shield, UserCog, LayoutDashboard, Menu,
  FileText, ChevronDown, Clock, History, Package, Contact, X
} from 'lucide-react';
import { useGet } from '@/hooks/useGet';
import { brandConfig } from '@/utils/brand';

const menuItems = [
  { name: 'Dashboard', path: '/home', icon: <LayoutDashboard size={20} /> },
  { name: 'Leads', path: '/leads', icon: <Contact size={20} />, dataKey: 'leadsCount' },
  { name: 'Visits', path: '/visits', icon: <Calendar size={20} />, dataKey: 'visitCount' },
  { name: 'Sales', path: '/sales', icon: <TrendingUp size={20} />, dataKey: 'salesCount' },
  { name: 'Sales Man', path: '/sales-man', icon: <User size={20} /> },
  { name: 'Targets', path: '/target', icon: <Target size={20} />, dataKey: 'targetCount' },
  { name: 'WishList', path: '/wishlist', icon: <Heart size={20} />, dataKey: 'wishlistCount' },
  { name: 'Leader', path: '/leader', icon: <UserCog size={20} />, dataKey: 'complaintCount' },
  { name: 'Admin', path: '/admin', icon: <Shield size={20} />, dataKey: 'adminCount' },
  { name: 'Visit Status', path: '/visitstatus', icon: <CheckCircle size={20} />, dataKey: 'visitstatusCount' },
  { name: 'Products', path: '/products', icon: <Package size={20} /> },
  
  // إضافة قسم Requests مع القائمة المنسدلة
  {
    name: 'Requests',
    icon: <FileText size={20} />,
    children: [
      { name: 'Pending Requests', path: '/requests', icon: <Clock size={18} />, dataKey: 'pendingRequestsCount' },
      { name: 'History Requests', path: '/history-requests', icon: <History size={18} />, dataKey: 'historyRequestsCount' },
    ]
  }
];

export const Sidebar = ({ 
  isOpen, 
  toggleSidebar, 
  isDesktopExpanded, 
  isMobileOpen = false, 
  closeMobileSidebar 
}) => {
  const isExpanded = isDesktopExpanded !== undefined ? isDesktopExpanded : isOpen;
  const { data, loading } = useGet('/api/admin/visits/report');
  
  // حالة لإدارة فتح وإغلاق قائمة Requests المنسدلة
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);

  const toggleRequestsMenu = () => {
    if (!isExpanded) {
      toggleSidebar?.();
      setIsRequestsOpen(true);
    } else {
      setIsRequestsOpen((prev) => !prev);
    }
  };

  const handleNavClick = () => {
    if (closeMobileSidebar) {
      closeMobileSidebar();
    }
  };

  return (
    <aside 
      className={`h-screen bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col fixed left-0 top-0 transition-all duration-300 z-50 ${
        isMobileOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full'
      } lg:translate-x-0 ${isExpanded ? 'lg:w-64' : 'lg:w-20'}`}
    >
      {/* Header: Brand title / toggle / mobile close */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 lg:border-b-0">
        <div 
          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0" 
          onClick={toggleSidebar}
        >
          <h1 className={`text-xl font-bold text-primary truncate ${isExpanded ? 'block' : 'block lg:hidden'}`}>
            {brandConfig.appTitle}
          </h1>
          <div className={`w-full justify-center text-primary ${isExpanded ? 'hidden' : 'hidden lg:flex'}`}>
            <Menu size={24} />
          </div>
        </div>

        {/* Mobile Close Button */}
        {closeMobileSidebar && (
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="lg:hidden p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 sm:px-4 py-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          // في حالة وجود قائمة فرعية (Children)
          if (item.children) {
            return (
              <div key={item.name} className="flex flex-col">
                {/* الزر الرئيسي لـ Requests */}
                <button
                  type="button"
                  onClick={toggleRequestsMenu}
                  title={!isExpanded ? item.name : ""}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className={`font-medium ${isExpanded ? 'block' : 'block lg:hidden'}`}>{item.name}</span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${isRequestsOpen ? 'rotate-180' : ''} ${isExpanded ? 'block' : 'block lg:hidden'}`}
                  />
                </button>

                {/* العناصر الفرعية داخل Requests */}
                {isRequestsOpen && (
                  <div className={`ml-4 pl-2 border-l-2 border-zinc-200 dark:border-zinc-800 space-y-1 mt-1 ${isExpanded ? 'block' : 'block lg:hidden'}`}>
                    {item.children.map((subItem) => {
                      const badgeCount = subItem.dataKey && data?.data ? data.data[subItem.dataKey] : null;

                      return (
                        <NavLink
                          key={subItem.name}
                          to={subItem.path}
                          onClick={handleNavClick}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                              isActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`
                          }
                        >
                          {subItem.icon}
                          <div className="flex flex-1 items-center justify-between truncate">
                            <span>{subItem.name}</span>
                            {badgeCount !== null && badgeCount !== undefined && (
                              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                                {loading ? '...' : badgeCount}
                              </span>
                            )}
                          </div>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // العناصر العادية بدون Sub-menu
          const badgeCount = item.dataKey && data?.data ? data.data[item.dataKey] : null;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              title={!isExpanded ? item.name : ""}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`
              }
            >
              {item.icon}

              <div className={`flex flex-1 items-center justify-between truncate ${isExpanded ? 'flex' : 'flex lg:hidden'}`}>
                <span>{item.name}</span>

                {badgeCount !== null && badgeCount !== undefined && (
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    {loading ? '...' : badgeCount}
                  </span>
                )}
              </div>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};