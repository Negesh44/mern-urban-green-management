import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Trees,
  LayoutDashboard,
  Table as TableIcon,
  Map as MapIcon,
  AlertTriangle,
  Wrench,
  LogOut,
  Shield,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AdminSidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'analytics';

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      tab: 'analytics',
      icon: LayoutDashboard,
      desc: 'Executive KPIs & Charts',
    },
    {
      label: 'Assets',
      path: '/admin/dashboard?tab=inventory',
      tab: 'inventory',
      icon: TableIcon,
      desc: 'Catalog & CRUD Table',
    },
    {
      label: 'GIS Map',
      path: '/admin/dashboard?tab=map',
      tab: 'map',
      icon: MapIcon,
      desc: 'Spatial Canopy Map',
    },
    {
      label: 'Citizen Reports',
      path: '/admin/reports',
      tab: null,
      icon: AlertTriangle,
      desc: 'Hazard Triage & Dispatch',
      badge: 'Triage',
    },
    {
      label: 'Maintenance',
      path: '/admin/dashboard?tab=attention',
      tab: 'attention',
      icon: Wrench,
      desc: 'Overdue Action Items',
    },
  ];

  const isItemActive = (item) => {
    if (item.path === '/admin/reports') {
      return location.pathname === '/admin/reports';
    }
    if (location.pathname === '/admin/dashboard') {
      if (item.tab === 'analytics') {
        return !searchParams.get('tab') || searchParams.get('tab') === 'analytics';
      }
      return searchParams.get('tab') === item.tab;
    }
    return false;
  };

  return (
    <>
      {/* Mobile Top Header with Hamburger */}
      <div className="lg:hidden sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <Link to="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md">
            <Trees className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm text-emerald-400">SmartUrban</span>
            <span className="font-light text-sm text-slate-200">Admin</span>
          </div>
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950/95 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 space-y-6">
          {/* Logo Brand */}
          <div className="flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center gap-3 group">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Trees className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base text-emerald-400">SmartUrban</span>
                  <span className="font-light text-base text-slate-200">Green</span>
                </div>
                <div className="text-[10px] text-teal-400 font-semibold tracking-wider uppercase">
                  Admin Console
                </div>
              </div>
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1">
              Municipal Operations
            </div>

            {navItems.map((item) => {
              const active = isItemActive(item);
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    active
                      ? 'bg-gradient-to-r from-emerald-950/90 to-teal-950/60 text-emerald-300 border border-emerald-800/80 shadow-md shadow-emerald-950/40'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        active ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400'
                      } transition-colors`}
                    />
                    <div>
                      <div>{item.label}</div>
                      <div className="text-[10px] font-normal text-slate-500">{item.desc}</div>
                    </div>
                  </div>

                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick link to Citizen Public View */}
          <div className="pt-2 border-t border-slate-800/80">
            <Link
              to="/citizen/dashboard"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-emerald-300 hover:bg-slate-900/40 transition-colors border border-transparent hover:border-slate-800"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Switch to Citizen View</span>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-600" />
            </Link>
          </div>
        </div>

        {/* Bottom Profile & Logout Box */}
        <div className="p-4 m-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-950 text-teal-300 border border-teal-800/80">
              <Shield className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-100 truncate">{user?.name}</div>
              <div className="text-[10px] text-teal-400 font-mono font-medium uppercase">
                {user?.role} Role
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-900/60 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>End Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
