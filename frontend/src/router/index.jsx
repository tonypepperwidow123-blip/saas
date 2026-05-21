import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';

// Public Pages
import Home from '../pages/public/Home';
import Pricing from '../pages/public/Pricing';
import Shop from '../pages/public/Shop';
import PluginDetails from '../pages/public/PluginDetails';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Customer Pages
import CustomerDashboard from '../pages/customer/Dashboard';
import CustomerOrders from '../pages/customer/Orders';
import Downloads from '../pages/customer/Downloads';
import CustomerLicenses from '../pages/customer/Licenses';
import CustomerSettings from '../pages/customer/Settings';

// Developer Pages
import DeveloperDashboard from '../pages/developer/Dashboard';
import UploadPlugin from '../pages/developer/UploadPlugin';
import UploadVersion from '../pages/developer/UploadVersion';
import DeveloperPlugins from '../pages/developer/Plugins';
import Licenses from '../pages/developer/Licenses';
import Customers from '../pages/developer/Customers';
import DeveloperAnalytics from '../pages/developer/Analytics';
import DeveloperRevenue from '../pages/developer/Revenue';
import DeveloperPlan from '../pages/developer/MyPlan';
import DeveloperSettings from '../pages/developer/Settings';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import AdminPlugins from '../pages/admin/Plugins';
import Developers from '../pages/admin/Developers';
import CustomersAdmin from '../pages/admin/Customers';
import Admins from '../pages/admin/Admins';
import AdminUsers from '../pages/admin/Users';
import PendingApprovals from '../pages/admin/PendingApprovals';
import AdminLicenses from '../pages/admin/Licenses';
import Transactions from '../pages/admin/Transactions';
import AdminAnalytics from '../pages/admin/Analytics';
import Revenue from '../pages/admin/Revenue';
import AdminSettings from '../pages/admin/Settings';
import DebugPage from '../pages/admin/Debug';

export const router = createBrowserRouter(
  [
    // Public Routes
    {
      path: '/',
      element: <PublicLayout />,
      children: [
        { index: true, element: <Home /> },
        { path: 'pricing', element: <Pricing /> },
        { path: 'shop', element: <Shop /> },
        { path: 'plugins/:id', element: <PluginDetails /> },
      ],
    },

    // Auth Routes
    {
      path: '/',
      element: <AuthLayout />,
      children: [
        { path: 'login', element: <Login /> },
        { path: 'register', element: <Register /> },
        { path: 'forgot-password', element: <ForgotPassword /> },
      ],
    },

    // Developer Routes
    {
      path: '/developer',
      element: <DashboardLayout />,
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: 'dashboard', element: <DeveloperDashboard /> },
        { path: 'upload', element: <UploadPlugin /> },
        { path: 'plugins', element: <DeveloperPlugins /> },
        { path: 'plugins/:id/upload-version', element: <UploadVersion /> },
        { path: 'customers', element: <Customers /> },
        { path: 'licenses', element: <Licenses /> },
        { path: 'analytics', element: <DeveloperAnalytics /> },
        { path: 'revenue', element: <DeveloperRevenue /> },
        { path: 'plan', element: <DeveloperPlan /> },
        { path: 'settings', element: <DeveloperSettings /> },
      ],
    },

    // Customer Routes
    {
      path: '/customer',
      element: <DashboardLayout />,
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: 'dashboard', element: <CustomerDashboard /> },
        { path: 'downloads', element: <Downloads /> },
        { path: 'licenses', element: <CustomerLicenses /> },
        { path: 'orders', element: <CustomerOrders /> },
        { path: 'settings', element: <CustomerSettings /> },
      ],
    },

    // Admin Routes
    {
      path: '/admin',
      element: <DashboardLayout />,
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: 'dashboard', element: <AdminDashboard /> },
        { path: 'developers', element: <Developers /> },
        { path: 'customers', element: <CustomersAdmin /> },
        { path: 'admins', element: <Admins /> },
        { path: 'users', element: <AdminUsers /> },
        { path: 'plugins', element: <AdminPlugins /> },
        { path: 'pending-approvals', element: <PendingApprovals /> },
        { path: 'licenses', element: <AdminLicenses /> },
        { path: 'revenue', element: <Revenue /> },
        { path: 'transactions', element: <Transactions /> },
        { path: 'analytics', element: <AdminAnalytics /> },
        { path: 'settings', element: <AdminSettings /> },
        { path: 'debug', element: <DebugPage /> },
      ],
    },

    // Catch all - redirect to home
    { path: '*', element: <Navigate to="/" replace /> },
  ],
  {
    future: {
      v7_fetcherPersist: true,
      v7_relativeSplatPath: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionStatusInteger: true,
      v7_startTransition: true,
    },
  }
);