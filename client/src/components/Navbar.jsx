import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Trees,
  LayoutDashboard,
  UserCheck,
  LogIn,
  UserPlus,
  LogOut,
  Shield,
  User,
  AlertTriangle,
  FileText,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-emerald-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Trees className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg text-emerald-400">SmartUrban</span>
              <span className="font-light text-lg text-slate-200">Green</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive('/')
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  : 'text-slate-300 hover:text-emerald-300 hover:bg-slate-900/60'
              }`}
            >
              Home
            </Link>

            {/* Citizen Links */}
            {(!isAuthenticated || user?.role === 'citizen') && (
              <>
                <Link
                  to="/citizen/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive('/citizen/dashboard')
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                      : 'text-slate-300 hover:text-emerald-300 hover:bg-slate-900/60'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Green Map</span>
                </Link>

                <Link
                  to="/citizen/report"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive('/citizen/report')
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                      : 'text-slate-300 hover:text-amber-300 hover:bg-slate-900/60'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Report Hazard</span>
                </Link>

                {isAuthenticated && (
                  <Link
                    to="/citizen/reports"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      isActive('/citizen/reports')
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        : 'text-slate-300 hover:text-emerald-300 hover:bg-slate-900/60'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-400" />
                    <span>My Reports</span>
                  </Link>
                )}
              </>
            )}

            {/* Admin Links */}
            {isAuthenticated && user?.role === 'admin' && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive('/admin/dashboard')
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                      : 'text-slate-300 hover:text-emerald-300 hover:bg-slate-900/60'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-teal-400" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/admin/reports"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive('/admin/reports')
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                      : 'text-slate-300 hover:text-amber-300 hover:bg-slate-900/60'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Citizen Reports</span>
                </Link>
              </>
            )}

            <div className="h-4 w-px bg-slate-800 mx-1" />

            {/* Auth Actions */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800">
                  {user?.role === 'admin' ? (
                    <Shield className="w-3.5 h-3.5 text-teal-400" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span className="text-xs font-medium text-slate-200">{user?.name}</span>
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      user?.role === 'admin'
                        ? 'bg-teal-950 text-teal-300 border border-teal-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {user?.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-rose-400 hover:bg-rose-950/40 transition-colors flex items-center gap-1 border border-transparent hover:border-rose-900/50 cursor-pointer"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Link
                  to="/login"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive('/login')
                      ? 'text-emerald-400 bg-slate-900'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>

                <Link
                  to="/signup"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-md transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
