import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trees,
  MapPin,
  BarChart3,
  AlertTriangle,
  Wrench,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Server,
  Sparkles,
  Users,
  Layers,
  Activity,
  Globe,
} from 'lucide-react';
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
    <div className="space-y-16 py-6 sm:py-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-950/60 via-slate-900/80 to-slate-950 p-8 sm:p-12 lg:p-16 border border-emerald-800/40 shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute -top-28 -right-28 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -left-28 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/50 border border-emerald-700/60 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Municipal Environmental Governance
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
            Smart Urban Green <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 bg-clip-text text-transparent">
              Management System
            </span>
          </h1>

          {/* Exact Project Abstract */}
          <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed font-normal bg-emerald-950/40 p-4 rounded-2xl border border-emerald-800/40 shadow-inner">
            <strong className="text-emerald-300 font-semibold">Abstract:</strong> MERN-stack web application for centralized urban green-space management with interactive mapping, environmental KPIs, and citizen reporting.
          </p>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Engineered for municipalities and civic communities to catalog urban trees, preserve biodiversity, monitor canopy health, automate arboricultural work orders, and empower citizens with real-time hazard reporting.
          </p>

          {/* Primary CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to="/signup"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-900/40 transition-all flex items-center gap-2 group cursor-pointer hover:scale-[1.02]"
            >
              <span>Get Started / Sign Up</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/login"
              className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:border-emerald-800"
            >
              <span>System Sign In</span>
            </Link>

            <Link
              to="/citizen/dashboard"
              className="px-5 py-3.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-300 hover:text-emerald-200 border border-emerald-800/60 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Explore Public Green Map</span>
            </Link>
          </div>
        </div>

        {/* Live System Telemetry Banner */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs text-slate-400">Catalogued Assets</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5">22+ Reserves</div>
            <div className="text-[10px] text-emerald-400 font-mono">Trees, Parks & Forests</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs text-slate-400">Green Canopy Area</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5">2.66M m²</div>
            <div className="text-[10px] text-teal-400 font-mono">≈ 266.5 Hectares</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs text-slate-400">Tree Survival Index</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5">93.3%</div>
            <div className="text-[10px] text-cyan-400 font-mono">5-Cohort Vitality</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs text-slate-400">Citizen Co-Governance</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5">Active</div>
            <div className="text-[10px] text-emerald-400 font-mono">GPS Hazard Triage</div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Core System Pillars & Capabilities
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Engineered with modern full-stack technologies to deliver an enterprise-grade ecological stewardship platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1: GIS Map */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-700/60 transition-all space-y-3 group">
            <div className="p-3 w-fit rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60 group-hover:scale-105 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Interactive GIS Canopy Map</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Spatial telemetry mapping with Leaflet & React-Leaflet. Visualizes trees, parks, urban forests, and linear belts with health-coded marker color schemes.
            </p>
          </div>

          {/* Feature 2: KPIs & Analytics */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-teal-700/60 transition-all space-y-3 group">
            <div className="p-3 w-fit rounded-xl bg-teal-950 text-teal-400 border border-teal-800/60 group-hover:scale-105 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Environmental KPIs & Trends</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time analytics powered by Recharts: tree health distribution donut charts, asset categorization bar charts, and historical cohort survival trends.
            </p>
          </div>

          {/* Feature 3: Citizen Reporting */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-700/60 transition-all space-y-3 group">
            <div className="p-3 w-fit rounded-xl bg-amber-950 text-amber-400 border border-amber-800/60 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Citizen Hazard Reporting</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Citizens submit geo-tagged incident reports with camera photo uploads, auto-detected GPS coordinates, and transparent status tracking.
            </p>
          </div>

          {/* Feature 4: Work Orders */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-700/60 transition-all space-y-3 group">
            <div className="p-3 w-fit rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60 group-hover:scale-105 transition-transform">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Maintenance & Task Dispatch</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Arborists schedule pruning, soil aeration, and pest control. Administrators convert citizen hazard reports directly into asset maintenance tasks.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Credentials & Quick Access Card */}
      <section className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Evaluation & Demonstration Portal</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">Pre-Seeded Evaluation Credentials</h3>
          </div>
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors w-fit"
          >
            Launch System Login
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Admin Credentials */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-teal-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wide">
                1. Municipal Administrator Account
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                ADMIN ROLE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Access the executive KPI dashboard, asset inventory table CRUD, incident triage dispatch, and work order creation.
            </p>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs space-y-1 text-slate-200">
              <div>Email: <span className="text-teal-300">admin@citygreen.gov</span></div>
              <div>Password: <span className="text-teal-300">Admin@123</span></div>
            </div>
          </div>

          {/* Citizen Credentials */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                2. Community Citizen Account
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                CITIZEN ROLE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Browse public green reserves, view botanical taxonomy, file geolocation-tagged hazard reports, and track resolution.
            </p>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs space-y-1 text-slate-200">
              <div>Email: <span className="text-emerald-300">citizen@citygreen.gov</span></div>
              <div>Password: <span className="text-emerald-300">Citizen@123</span></div>
            </div>
          </div>
        </div>

        {/* Backend Connectivity Status Bar */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>API Server Connectivity:</span>
            {apiStatus.loading ? (
              <span className="text-amber-400 font-mono">Verifying...</span>
            ) : apiStatus.data ? (
              <span className="text-emerald-400 font-mono font-semibold">Online (200 OK)</span>
            ) : (
              <span className="text-rose-400 font-mono">Offline</span>
            )}
          </div>

          <button
            onClick={fetchBackendStatus}
            className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
          >
            Check Status
          </button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
