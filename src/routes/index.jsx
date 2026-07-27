import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { isAuthenticated } from '@/utils/auth';
import { LoginPage } from '@/components/LoginPage';
import Home from '@/Pages/Home';
import Visits from '@/Pages/Visits/Visits';
import VisitsAdd from '@/Pages/Visits/VisitsAdd';
import SalesAdd from '@/Pages/SalesMan/SalesManAdd';
import Sales from '@/Pages/Sales/Sales';
import SalesMan from '@/Pages/SalesMan/SalesMan';
import SalesManAdd from '@/Pages/SalesMan/SalesManAdd';
import WishList from '@/Pages/WishList/WishList';
import WishListAdd from '@/Pages/WishList/WishListAdd';
import Target from '@/Pages/Target/Target';
import TargetAdd from '@/Pages/Target/TargetAdd';
import Leader from '@/Pages/Leader/Leader';
import LeaderAdd from '@/Pages/Leader/LeaderAdd';
import Admin from '@/Pages/Admin/Admin';
import AdminAdd from '@/Pages/Admin/AdminAdd';
import VisitStatusAdd from '@/Pages/VisitStatus/VisitStatusAdd';
import VisitStatus from '@/Pages/VisitStatus/VisitStatus';
import PendingRequests from '@/Pages/StatusRequests/Requests';
import HistoryRequests from '@/Pages/StatusRequests/HistoryRequests';


// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Router Configuration
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (<ProtectedRoute><MainLayout /></ProtectedRoute>),
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: 'home', element: <Home /> },

      // reequests
      { path: 'requests', element: <PendingRequests /> },
      { path: 'history-requests', element: <HistoryRequests /> },
      
      // visits
      { path: 'visits', element: <Visits /> },
      { path: 'visits/add', element: <VisitsAdd /> },
      { path: 'visits/edit/:id', element: <VisitsAdd /> },

      // sales man
      { path: 'sales-man', element: <SalesMan /> },
      { path: 'sales-man/add', element: <SalesManAdd /> },
      { path: 'sales-man/:id/edit', element: <SalesManAdd /> },
      // sales
      { path: 'sales', element: <Sales /> },
      { path: 'sales/add', element: <SalesAdd /> },
      { path: 'sales/:id/edit', element: <SalesAdd /> },
      // wish_list
      { path: 'wishlist', element: <WishList /> },
      { path: 'wishlist/add', element: <WishListAdd /> },
      { path: 'wishlist/:id/edit', element: <WishListAdd /> },
      // target
      { path: 'target', element: <Target /> },
      { path: 'target/add', element: <TargetAdd /> },
      { path: 'target/:id/edit', element: <TargetAdd /> },
      // leader
      { path: 'leader', element: <Leader /> },
      { path: 'leader/add', element: <LeaderAdd /> },
      { path: 'leader/:id/edit', element: <LeaderAdd /> },
      //admin
      {
        path: 'admin',
        element: <Admin />
      },
      {
        path: 'admin/add',
        element: <AdminAdd />
      },
      {
        path: 'admin/:id/edit',
        element: <AdminAdd />
      },
      // visit status
      {
        path: 'visitstatus',
        element: <VisitStatus />
      },
      {
        path: 'visitstatus/add',
        element: <VisitStatusAdd />
      },
      {
        path: 'visitstatus/:id/edit',
        element: <VisitStatusAdd />
      }
    ],
  },

  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);