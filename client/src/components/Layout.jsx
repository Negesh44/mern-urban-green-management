import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // If the logged in user is admin and is currently viewing an admin route, render executive sidebar
  const isAdminRoute = isAuthenticated && user?.role === 'admin' && location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-black flex flex-col lg:flex-row">
        {/* Left Executive Sidebar for Admin */}
        <AdminSidebar />

        {/* Main Admin Content Container */}
        <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
          <main className="flex-1 w-full px-4 sm:px-8 py-6 max-w-7xl mx-auto">
            <Outlet />
          </main>
          <footer className="border-t border-slate-900 bg-slate-950/60 py-5 text-center text-xs text-slate-500">
            <p>Smart Urban Green Management System &bull; Municipal Executive Console</p>
          </footer>
        </div>
      </div>
    );
  }

  // Otherwise, render citizen and guest top navigation
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-black">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <p>Smart Urban Green Management System &bull; MERN Stack Architectural Foundation</p>
      </footer>
    </div>
  );
};

export default Layout;
