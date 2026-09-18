import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Lock, Mail, User, Trees, AlertCircle, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'citizen',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match. Please verify.');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const result = await signup({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    });
    setIsSubmitting(false);

    if (result.success) {
      navigate(result.user.role === 'admin' ? '/admin/dashboard' : '/citizen/dashboard', {
        replace: true,
      });
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Create Account</h2>
          <p className="text-xs text-slate-400">Join the Urban Green ecosystem network</p>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                placeholder="Jane Forester"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                placeholder="jane@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password (Min 6 chars)
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

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Account Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'citizen' })}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  formData.role === 'citizen'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <User className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-100">Citizen</div>
                  <div className="text-[10px] text-slate-400">Report & adopt trees</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'admin' })}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  formData.role === 'admin'
                    ? 'bg-teal-950/80 border-teal-500 text-teal-300 ring-1 ring-teal-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Shield className="w-4 h-4 mt-0.5 shrink-0 text-teal-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-100">Admin</div>
                  <div className="text-[10px] text-slate-400">Manage green zones</div>
                </div>
              </button>
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
                <UserPlus className="w-4 h-4" />
                <span>Register & Proceed</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-emerald-400 font-medium hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
