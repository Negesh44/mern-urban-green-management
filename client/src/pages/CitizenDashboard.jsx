import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  PlusCircle,
  AlertCircle,
  Heart,
  Award,
  Check,
  Eye,
  Trees,
  Sparkles,
  ArrowRight,
  Shield,
  FileText,
  Compass,
} from 'lucide-react';
import API from '../services/api';
import AssetMap from '../components/AssetMap';
import { useAuth } from '../context/AuthContext';
import { chennaiAssetsFallback } from '../data/chennaiAssetsFallback';
import toast from 'react-hot-toast';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState(chennaiAssetsFallback);
  const [loading, setLoading] = useState(false);
  const [adoptedCount, setAdoptedCount] = useState(2);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportLocation, setReportLocation] = useState('Semmozhi Poonga / Cathedral Road');

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await API.get('/api/assets');
      if (res.data?.data && res.data.data.length > 0) {
        setAssets(res.data.data);
      }
    } catch (err) {
      console.warn('Backend unavailable, displaying catalogued Chennai assets fallback:', err.message);
    }
  };

  const handleQuickReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportText.trim()) {
      toast.error('Please enter an issue description');
      return;
    }

    setReportSubmitting(true);
    try {
      await API.post('/api/reports', {
        description: `[Quick Report - ${reportLocation}]: ${reportText.trim()}`,
        location: { lat: 13.0827, lng: 80.2707 }, // Default Chennai Central
      });

      setReportSubmitted(true);
      toast.success('Hazard alert registered successfully! Municipal arborists notified.');
      setTimeout(() => {
        setReportSubmitted(false);
        setReportText('');
      }, 5000);
    } catch (err) {
      const rawMsg = err.response?.data?.message || err.message || '';
      const displayMsg = rawMsg.includes('buffering timed out')
        ? 'Database was reconnecting. Please click "Submit Incident Alert" again now.'
        : rawMsg || 'Failed to submit report. Please log in.';
      toast.error(displayMsg);
    } finally {
      setReportSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* If logged in user is admin, show convenient portal switcher banner */}
      {user?.role === 'admin' && (
        <div className="p-4 rounded-2xl bg-teal-950/60 border border-teal-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-teal-200">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-teal-400" />
            <span>
              You are logged in as an <strong>Administrator</strong> currently previewing the <strong>Citizen Community Portal</strong>.
            </span>
          </div>
          <Link
            to="/admin/dashboard"
            className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0"
          >
            <span>Open Executive Admin Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Citizen Community Portal &bull; Chennai Urban Green Registry</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Chennai Canopy & Green Reserves</h1>
          <p className="text-xs text-slate-400 mt-1">
            Explore Chennai's parks, heritage trees, mangrove sanctuaries, and report environmental hazards to municipal arborists.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/citizen/report"
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-950/50 transition-all hover:scale-105"
          >
            <AlertCircle className="w-4 h-4" />
            <span>GPS Hazard Reporter</span>
          </Link>

          <Link
            to="/citizen/reports"
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4 text-teal-400" />
            <span>My Reports</span>
          </Link>

          <div className="px-4 py-2.5 rounded-2xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/40">
            <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            <span>Adopted Trees: {adoptedCount}</span>
          </div>
        </div>
      </div>

      {/* 1. Interactive Leaflet GIS Map centered on Chennai */}
      <section>
        <AssetMap assets={assets} loading={loading} onRefresh={fetchAssets} />
      </section>

      {/* 2. Highlights Grid & Citizen Hazard Reporting */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Nearby Green Asset Highlights (Col 1 & 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trees className="w-5 h-5 text-emerald-400" />
              <span>Catalogued Chennai Green Reserves & Flora</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {assets.length} Public Reserves
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {assets.slice(0, 6).map((asset) => (
              <div
                key={asset._id}
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-800/50 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800 font-mono">
                      {asset.type.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        asset.healthStatus === 'Healthy' || asset.healthStatus === 'Excellent'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : asset.healthStatus === 'Diseased'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {asset.healthStatus}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100">{asset.name}</h4>
                  {asset.species && (
                    <p className="text-xs text-slate-400 italic -mt-1">{asset.species}</p>
                  )}

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {asset.description || 'Monitored municipal greenery in Chennai.'}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
                  <span className="text-[10px] font-mono text-slate-500">
                    📍 {asset.location?.lat.toFixed(4)}, {asset.location?.lng.toFixed(4)}
                  </span>
                  <Link
                    to={`/assets/${asset._id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    <span>View Info</span>
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Citizen Hazard Quick Report Form (Col 3) */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" />
                <span>Quick Incident Report</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Chennai Wards</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Spotted a fallen branch, diseased tree, or water leak in Chennai? Send an immediate report to Greater Chennai Corporation arborists.
            </p>

            {reportSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Hazard report submitted! A municipal arborist team has been alerted.</span>
              </div>
            ) : (
              <form onSubmit={handleQuickReportSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Chennai Location / Area
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Semmozhi Poonga, Anna Nagar Tower, Adyar"
                    value={reportLocation}
                    onChange={(e) => setReportLocation(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Issue Description
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe issue (e.g. fallen branch blocking road, fungal infestation)..."
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reportSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{reportSubmitting ? 'Registering...' : 'Submit Incident Alert'}</span>
                </button>
              </form>
            )}

            <div className="pt-3 border-t border-slate-800/80 text-center">
              <Link
                to="/citizen/report"
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1"
              >
                <span>Need GPS coordinates & photo upload? Use full report &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CitizenDashboard;
