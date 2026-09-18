import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, PlusCircle, AlertCircle, Heart, Award, Check, Eye, Trees, Sparkles, Filter } from 'lucide-react';
import API from '../services/api';
import AssetMap from '../components/AssetMap';

const CitizenDashboard = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adoptedCount, setAdoptedCount] = useState(2);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportLocation, setReportLocation] = useState('Central Park Sector 4');

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/assets');
      setAssets(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch assets for citizen view', err);
      setLoading(false);
    }
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setReportText('');
    }, 5000);
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Citizen Stewardship & Ecological Telemetry</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Urban Canopy & Green Reserve</h1>
          <p className="text-xs text-slate-400 mt-1">
            Explore public parks, locate heritage tree specimens, and report environmental hazards to city arborists.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/40">
            <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            <span>Adopted Trees: {adoptedCount}</span>
          </div>
        </div>
      </div>

      {/* 1. Interactive Leaflet GIS Map */}
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
              <span>Catalogued Municipal Green Reserves</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {assets.length} Public Assets
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
                    {asset.description || 'Monitored municipal greenery.'}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
                  <span className="text-[10px] font-mono text-slate-500">
                    📍 {asset.location?.lat.toFixed(3)}, {asset.location?.lng.toFixed(3)}
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

        {/* Citizen Hazard Report Form (Col 3) */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              <span>Report Urban Green Hazard</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Found a broken tree limb, diseased foliage, or irrigation leak? Alert the municipal green maintenance team.
            </p>

            {reportSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Hazard report submitted! A municipal arborist has been dispatched.</span>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Location / Landmark
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Central Park West Trail"
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
                    placeholder="Describe issue (e.g. fallen branch blocking walkway, pest infestation)..."
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Submit Incident Alert</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CitizenDashboard;
