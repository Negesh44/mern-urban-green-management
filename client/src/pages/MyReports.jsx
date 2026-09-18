import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  MapPin,
  Trees,
  Calendar,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import API from '../services/api';

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/reports');
      setReports(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch citizen reports', err);
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  const getStatusBadge = (status) => {
    if (status === 'Resolved') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Resolved</span>
        </span>
      );
    }
    if (status === 'In Progress') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800">
          <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>In Progress</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        <span>Pending Triage</span>
      </span>
    );
  };

  return (
    <div className="space-y-8 py-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <AlertCircle className="w-4 h-4" />
            <span>Citizen Stewardship Tracking</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">My Hazard Reports</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track status updates, arborist assignments, and resolution notes for your submitted issues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/citizen/report"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-700/20 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report New Issue</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
          {['all', 'Pending', 'In Progress', 'Resolved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'all' ? `All Reports (${reports.length})` : tab}
            </button>
          ))}
        </div>

        <button
          onClick={fetchMyReports}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
          title="Refresh Reports"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading your submitted reports...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-200">No reports found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't submitted any hazard reports under this filter. Spotted an issue in your neighborhood?
            </p>
          </div>
          <Link
            to="/citizen/report"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit a Report</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div
              key={report._id}
              className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-800/40 transition-all shadow-xl space-y-4"
            >
              {/* Card Header: Status + Date */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  {getStatusBadge(report.status)}
                  <span className="font-mono text-[11px] text-slate-500">
                    ID: #{report._id.substring(report._id.length - 6)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {new Date(report.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-col md:flex-row gap-5">
                {/* Photo Thumbnail */}
                {report.photo && (
                  <div className="w-full md:w-36 h-28 rounded-2xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                    <img
                      src={report.photo}
                      alt="Incident photo"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Description & Details */}
                <div className="flex-1 space-y-3">
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">
                    {report.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 font-mono text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        {report.location?.lat.toFixed(4)}, {report.location?.lng.toFixed(4)}
                      </span>
                    </div>

                    {report.assetId ? (
                      <Link
                        to={`/assets/${report.assetId._id}`}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:underline"
                      >
                        <Trees className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{report.assetId.name}</span>
                        <ExternalLink className="w-3 h-3 text-emerald-400" />
                      </Link>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">
                        General Location Hazard
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReports;
