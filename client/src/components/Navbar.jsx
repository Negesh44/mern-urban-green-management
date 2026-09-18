import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Trees,
  LogIn,
  UserPlus,
  LogOut,
  User,
  AlertTriangle,
  FileText,
  MapPin,
  Shield,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/85 border-b border-emerald-900/40 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group" onClick={closeMenu}>
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Trees className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg text-emerald-400">SmartUrban</span>
              <span className="font-light text-lg text-slate-200">Green</span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Citizen / Public Focus) */}
          <nav className="hidden md:flex items-center space-x-1.5">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive('/')
                  ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-800/60 shadow-sm'
                  : 'text-slate-300 hover:text-emerald-300 hover:bg-slate-900/60'
              }`}
            >
              Home
            </Link>

            <Link
              to="/citizen/dashboard"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isActive('/citizen/dashboard')
                  ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-800/60 shadow-sm'
                  : 'text-slate-300 hover:text-emerald-300 hover:bg-slate-900/60'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Green Map</span>
            </Link>

            <Link
              to="/citizen/report"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isActive('/citizen/report')
                  ? 'bg-amber-950/90 text-amber-300 border border-amber-800/60 shadow-sm'
                  : 'text-slate-300 hover:text-amber-300 hover:bg-slate-900/60'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Report Hazard</span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/citizen/reports"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isActive('/citizen/reports')
                    ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-800/60 shadow-sm'
                    : 'text-slate-300 hover:text-emerald-300 hover:bg-slate-900/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-teal-400" />
                <span>My Reports</span>
              </Link>
            )}

            {/* If Admin visits public/citizen view, provide shortcut to Admin Sidebar / Dashboard */}
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-800/80 transition-colors flex items-center gap-1.5 ml-1"
              >
                <Shield className="w-3.5 h-3.5 text-teal-400" />
                <span>Admin Console</span>
              </Link>
            )}

            <div className="h-4 w-px bg-slate-800 mx-1.5" />

            {/* Auth Actions */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-medium text-slate-200">{user?.name}</span>
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {user?.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-rose-400 hover:bg-rose-950/40 transition-colors flex items-center gap-1 border border-transparent hover:border-rose-900/50 cursor-pointer"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
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
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              aria-label="Open mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3 animate-fadeIn">
          <Link
            to="/"
            onClick={closeMenu}
            className={`block px-3 py-2 rounded-xl text-xs font-semibold ${
              isActive('/') ? 'bg-emerald-950 text-emerald-300' : 'text-slate-300'
            }`}
          >
            Home
          </Link>

          <Link
            to="/citizen/dashboard"
            onClick={closeMenu}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${
              isActive('/citizen/dashboard') ? 'bg-emerald-950 text-emerald-300' : 'text-slate-300'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Green Map</span>
          </Link>

          <Link
            to="/citizen/report"
            onClick={closeMenu}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${
              isActive('/citizen/report') ? 'bg-amber-950 text-amber-300' : 'text-slate-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Report Hazard</span>
          </Link>

          {isAuthenticated && (
            <Link
              to="/citizen/reports"
              onClick={closeMenu}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${
                isActive('/citizen/reports') ? 'bg-emerald-950 text-emerald-300' : 'text-slate-300'
              }`}
            >
              <FileText className="w-4 h-4 text-teal-400" />
              <span>My Reports</span>
            </Link>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              onClick={closeMenu}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-teal-950 text-teal-300 border border-teal-800"
            >
              <Shield className="w-4 h-4 text-teal-400" />
              <span>Admin Console</span>
            </Link>
          )}

          <div className="pt-2 border-t border-slate-800">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="text-xs text-slate-400 px-1">
                  Signed in as <span className="text-white font-medium">{user?.name}</span> ({user?.role})
                </div>
                <button
                  onClick={() => {
                    closeMenu();
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/40 transition-colors flex items-center gap-2 font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="text-center py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="text-center py-2 rounded-xl bg-emerald-600 text-xs font-semibold text-white"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
