import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Lock, Mail, Trees, AlertCircle, Sparkles, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleQuickFill = (email, password) => {
    setFormData({ email, password });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.email || !formData.password) {
      setFormError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(formData.email, formData.password);
    setIsSubmitting(false);

    if (result.success) {
      const redirectPath =
        location.state?.from?.pathname ||
        (result.user.role === 'admin' ? '/admin/dashboard' : '/citizen/dashboard');
      navigate(redirectPath, { replace: true });
    } else {
      setFormError(result.error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-slate-900/90 border border-emerald-900/40 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-emerald-950/40 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-800/50 shadow-lg shadow-emerald-900/20">
            <Trees className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">System Login</h2>
          <p className="text-xs text-slate-400">Smart Urban Green Management & Telemetry Portal</p>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                placeholder="user@citygreen.gov"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Authenticate & Access</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Seed Credentials Card for Evaluation */}
        <div className="pt-2 border-t border-slate-800 space-y-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Quick-Fill Seeded Accounts</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@citygreen.gov', 'Admin@123')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-emerald-950/50 border border-slate-800 hover:border-emerald-700/60 text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
                <Shield className="w-3.5 h-3.5" />
                <span>Admin User</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">admin@citygreen.gov</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('citizen@citygreen.gov', 'Citizen@123')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-teal-950/50 border border-slate-800 hover:border-teal-700/60 text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-400 group-hover:text-teal-300">
                <User className="w-3.5 h-3.5" />
                <span>Citizen User</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">citizen@citygreen.gov</div>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          Need an account?{' '}
          <Link to="/signup" className="text-emerald-400 font-medium hover:underline">
            Register new account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
