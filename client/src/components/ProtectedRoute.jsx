import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Verifying security credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated visitors to login, preserving intended location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role restriction is present and user does not match
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-900/90 border border-rose-900/50 rounded-3xl text-center space-y-5 shadow-2xl backdrop-blur-xl">
        <div className="p-4 w-fit mx-auto rounded-2xl bg-rose-950/80 text-rose-400 border border-rose-800/40">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Access Restricted</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            This module requires <span className="text-emerald-400 font-semibold uppercase">{allowedRoles.join(' / ')}</span> clearance. Your current role is <span className="text-amber-400 font-semibold uppercase">{user?.role}</span>.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to={user?.role === 'admin' ? '/admin/dashboard' : '/citizen/dashboard'}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 text-xs font-semibold transition-colors border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to My Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
