import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trees, ShieldCheck, Activity, MapPin, ArrowRight, CheckCircle2, Server } from 'lucide-react';
import API from '../services/api';

const Landing = () => {
  const [apiStatus, setApiStatus] = useState({ loading: true, data: null, error: null });

  useEffect(() => {
    fetchBackendStatus();
  }, []);

  const fetchBackendStatus = async () => {
    setApiStatus({ loading: true, data: null, error: null });
    try {
      const res = await API.get('/');
      setApiStatus({ loading: false, data: res.data, error: null });
    } catch (err) {
      setApiStatus({
        loading: false,
        data: null,
        error: err.message || 'Unable to connect to backend server',
      });
    }
  };

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-950/40 via-slate-900/60 to-slate-950 p-8 sm:p-12 lg:p-16 border border-emerald-800/30">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/50 border border-emerald-700/50 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Urban Ecological Intelligence
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Smart Urban Green <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 bg-clip-text text-transparent">
              Management System
            </span>
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed">
            Monitor canopy health, map urban tree biodiversity, manage municipal green reserves, and engage citizens with real-time ecological telemetry.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/citizen/dashboard"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-700/30 transition-all flex items-center gap-2"
            >
              Explore Citizen Portal
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/admin/dashboard"
              className="px-6 py-3.5 rounded-xl bg-slate-800/90 text-slate-200 hover:text-white hover:bg-slate-700 border border-slate-700/80 font-semibold transition-all flex items-center gap-2"
            >
              Admin Operations
            </Link>
          </div>
        </div>

        {/* Backend API Live Status Badge */}
        <div className="mt-10 p-5 rounded-2xl bg-slate-950/70 border border-slate-800 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-900 text-emerald-400 border border-emerald-900/40">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Backend API Connection Test</h4>
                <p className="text-xs text-slate-400">Target: <code className="text-emerald-300 font-mono">http://localhost:5000/</code></p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {apiStatus.loading && (
                <span className="text-xs text-amber-400 flex items-center gap-1.5 bg-amber-950/50 px-3 py-1.5 rounded-lg border border-amber-800/50">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  Pinging backend...
                </span>
              )}
              {apiStatus.data && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono">{apiStatus.data.message || 'API Connected'}</span>
                </div>
              )}
              {apiStatus.error && (
                <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/60 px-3 py-1.5 rounded-lg border border-rose-800/60">
                  <span>Status: {apiStatus.error}</span>
                </div>
              )}
              <button
                onClick={fetchBackendStatus}
                className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
              >
                Re-check
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-700/50 transition-all space-y-3">
          <div className="p-3 w-fit rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">GIS Tree & Park Registry</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Interactive spatial visualization of urban forests, tree species geolocation, and canopy density maps with Leaflet integration.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-teal-700/50 transition-all space-y-3">
          <div className="p-3 w-fit rounded-xl bg-teal-950/80 text-teal-400 border border-teal-800/40">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Sensor & Health Telemetry</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Soil moisture indices, microclimate temperature sensors, and real-time vegetative index analytics powered by Recharts.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-700/50 transition-all space-y-3">
          <div className="p-3 w-fit rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Citizen Reporting & Governance</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Report fallen limbs, request tree plantation, and participate in community urban greenery preservation initiatives.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
