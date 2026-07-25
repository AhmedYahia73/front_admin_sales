import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Heart, Calendar, Target, CheckCircle,User,
  TrendingUp, Award, Shield, UserCog, LayoutDashboard, Menu
} from 'lucide-react';
import { useGet } from '@/hooks/useGet';

const menuItems = [
  { name: 'Dashboard', path: '/home', icon: <LayoutDashboard size={20} /> },
  // تعديل dataKey ليطابق visitCount الراجع من الـ API
  { name: 'Visits', path: '/visits', icon: <Calendar size={20} />, dataKey: 'visitCount' },
  { name: 'Sales Man', path: '/sales-man', icon: <User size={20} />, dataKey: 'salesCount' },
  { name: 'Sales', path: '/sales', icon: <TrendingUp size={20} />, dataKey: 'salesCount' },
  { name: 'Targets', path: '/target', icon: <Target size={20} />, dataKey: 'targetCount' },
  { name: 'WishList', path: '/wishlist', icon: <Heart size={20} />, dataKey: 'wishlistCount' },
  { name: 'Leader', path: '/leader', icon: <UserCog size={20} />, dataKey: 'complaintCount' },
  { name: 'Admin', path: '/admin', icon: <Shield size={20} />, dataKey: 'adminCount' },
  {name:'Visit Status', path: 'visitstatus' , icon: <CheckCircle size={20}/>, dataKey: 'visitstatusCount'},

];

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { data, loading } = useGet('/api/admin/visits/report');

  return (
    <aside className={`h-screen bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col fixed left-0 top-0 transition-all duration-300 z-50 ${isOpen ? 'w-64' : 'w-20'}`}>

      {/* زر التبديل واللوجو */}
      <div className="p-6 flex items-center justify-between cursor-pointer" onClick={toggleSidebar}>
        {isOpen ? (
          <h1 className="text-xl font-bold text-primary truncate">Systego Sales</h1>
        ) : (
          <div className="w-full flex justify-center text-primary">
            <Menu size={24} />
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          // التعديل هنا: الوصول للـ Key الداخلي data.data
          const badgeCount = item.dataKey && data?.data ? data.data[item.dataKey] : null;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              title={!isOpen ? item.name : ""}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`
              }
            >
              {item.icon}

              {isOpen && (
                <div className="flex flex-1 items-center justify-between truncate">
                  <span>{item.name}</span>

                  {/* عرض الـ Badge عند وجود القيمة */}
                  {badgeCount !== null && badgeCount !== undefined && (
                    <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {loading ? '...' : badgeCount}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};