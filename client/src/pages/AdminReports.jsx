import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Table as TableIcon,
  Map as MapIcon,
  Filter,
  RefreshCw,
  Trees,
  Wrench,
  MapPin,
  Calendar,
  X,
  PlusCircle,
  ExternalLink,
  Check,
} from 'lucide-react';
import API from '../services/api';
import 'leaflet/dist/leaflet.css';

// Status icons for Leaflet map
const getReportMarkerIcon = (status) => {
  let color = '#f59e0b'; // Amber for Pending
  if (status === 'In Progress') color = '#06b6d4'; // Cyan
  if (status === 'Resolved') color = '#10b981'; // Green

  return L.divIcon({
    html: `
      <div style="
        width: 30px;
        height: 30px;
        background-color: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%; transform: rotate(45deg);"></div>
      </div>
    `,
    className: 'report-map-pin',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState('table'); // 'table' or 'map'
  const [reports, setReports] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Conversion Modal State
  const [convertingReport, setConvertingReport] = useState(null);
  const [convertForm, setConvertForm] = useState({
    assetId: '',
    action: '',
    performedBy: 'Emergency Rapid Response Arborist Team',
    date: new Date().toISOString().split('T')[0],
    reportStatus: 'In Progress',
    notes: '',
  });
  const [isConverting, setIsConverting] = useState(false);
  const [convertSuccessMsg, setConvertSuccessMsg] = useState('');
  const [convertErrorMsg, setConvertErrorMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reportsRes, assetsRes] = await Promise.all([
        API.get('/api/reports'),
        API.get('/api/assets'),
      ]);
      setReports(reportsRes.data.data || []);
      setAssets(assetsRes.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load reports data', err);
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await API.put(`/api/reports/${reportId}`, { status: newStatus });
      setReports((prev) =>
        prev.map((r) => (r._id === reportId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update report status');
    }
  };

  const handleOpenConvertModal = (report) => {
    setConvertingReport(report);
    setConvertForm({
      assetId: report.assetId?._id || (assets.length > 0 ? assets[0]._id : ''),
      action: `Remediation: ${report.description.substring(0, 70)}`,
      performedBy: 'Emergency Rapid Response Arborist Team',
      date: new Date().toISOString().split('T')[0],
      reportStatus: 'In Progress',
      notes: `Addressing citizen report #${report._id.substring(report._id.length - 6)}. Incident: ${report.description}`,
    });
    setConvertErrorMsg('');
    setConvertSuccessMsg('');
  };

  const handleConvertSubmit = async (e) => {
    e.preventDefault();
    if (!convertForm.assetId) {
      setConvertErrorMsg('Please select a green asset to link this maintenance task.');
      return;
    }

    setIsConverting(true);
    setConvertErrorMsg('');
    try {
      const res = await API.post(`/api/reports/${convertingReport._id}/convert`, convertForm);
      setIsConverting(false);
      setConvertSuccessMsg('Converted to maintenance task!');

      // Update report in state
      setReports((prev) =>
        prev.map((r) => (r._id === convertingReport._id ? res.data.report : r))
      );

      setTimeout(() => {
        setConvertingReport(null);
        setConvertSuccessMsg('');
      }, 1500);
    } catch (err) {
      setIsConverting(false);
      setConvertErrorMsg(err.response?.data?.message || 'Failed to convert report.');
    }
  };

  const filteredReports = useMemo(() => {
    if (statusFilter === 'all') return reports;
    return reports.filter((r) => r.status === statusFilter);
  }, [reports, statusFilter]);

  const mapCenter = useMemo(() => {
    if (filteredReports.length > 0 && filteredReports[0].location?.lat) {
      return [filteredReports[0].location.lat, filteredReports[0].location.lng];
    }
    return [28.6139, 77.2090];
  }, [filteredReports]);

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Municipal Incident Management</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Citizen Hazard Reports</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review community incident alerts, update triage statuses, and convert reported hazards into municipal maintenance work orders.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* View Toggle */}
        <div className="flex items-center gap-2 border-b sm:border-b-0 border-slate-800 pb-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('table')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'table'
                ? 'bg-slate-900 text-emerald-400 border border-emerald-900/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>Incident Table ({filteredReports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'map'
                ? 'bg-slate-900 text-teal-400 border border-teal-900/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>GIS Hazard Map</span>
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
          {['all', 'Pending', 'In Progress', 'Resolved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-slate-800 text-teal-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'all' ? 'All Incidents' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: Table View */}
      {activeTab === 'table' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Report & Photo</th>
                  <th className="px-4 py-3.5">Reported By</th>
                  <th className="px-4 py-3.5">Location / Asset</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Triage Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                      <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2" />
                      Loading citizen reports...
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                      No citizen reports found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report._id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Photo + Description */}
                      <td className="px-5 py-4 max-w-xs">
                        <div className="flex items-start gap-3">
                          {report.photo ? (
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                              <img src={report.photo} alt="Incident" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 text-slate-600">
                              <AlertTriangle className="w-5 h-5 text-amber-500/60" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-100 leading-snug line-clamp-2">
                              {report.description}
                            </p>
                            <span className="font-mono text-[10px] text-slate-500">
                              #{report._id.substring(report._id.length - 6)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Citizen */}
                      <td className="px-4 py-4">
                        <div className="text-slate-200 font-medium">{report.citizenId?.name || 'Citizen'}</div>
                        <div className="text-[11px] text-slate-500">{report.citizenId?.email}</div>
                      </td>

                      {/* Location & Asset */}
                      <td className="px-4 py-4">
                        {report.assetId ? (
                          <Link
                            to={`/assets/${report.assetId._id}`}
                            className="font-medium text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <Trees className="w-3.5 h-3.5 shrink-0" />
                            <span>{report.assetId.name}</span>
                          </Link>
                        ) : (
                          <span className="text-slate-400 italic">Uncatalogued</span>
                        )}
                        <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                          📍 {report.location?.lat.toFixed(4)}, {report.location?.lng.toFixed(4)}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 font-mono text-[11px] text-slate-400">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-4 py-4">
                        <select
                          value={report.status}
                          onChange={(e) => handleStatusChange(report._id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer focus:outline-none ${
                            report.status === 'Resolved'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : report.status === 'In Progress'
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                              : 'bg-amber-950 text-amber-300 border-amber-800'
                          }`}
                        >
                          <option value="Pending" className="bg-slate-900 text-amber-300">Pending</option>
                          <option value="In Progress" className="bg-slate-900 text-cyan-300">In Progress</option>
                          <option value="Resolved" className="bg-slate-900 text-emerald-300">Resolved</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleOpenConvertModal(report)}
                          className="px-3 py-1.5 rounded-xl bg-teal-950/80 hover:bg-teal-900/80 text-teal-300 border border-teal-800/80 text-xs font-semibold transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                          title="Convert to maintenance work order"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Convert to Task</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: GIS Hazard Map View */}
      {activeTab === 'map' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Spatial Citizen Hazard Density Map ({filteredReports.length} incidents)</span>
            </h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Pending
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> In Progress
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Resolved
              </span>
            </div>
          </div>

          <div className="h-[500px] w-full bg-slate-950 relative z-0">
            <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {filteredReports.map((report) => {
                if (!report.location?.lat || !report.location?.lng) return null;
                return (
                  <Marker
                    key={report._id}
                    position={[report.location.lat, report.location.lng]}
                    icon={getReportMarkerIcon(report.status)}
                  >
                    <Popup>
                      <div className="p-1 max-w-[240px] text-slate-900 text-xs space-y-2">
                        {report.photo && (
                          <div className="h-24 w-full rounded-lg overflow-hidden">
                            <img src={report.photo} alt="Incident" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <h4 className="font-bold text-slate-900">{report.description}</h4>
                        <div className="flex items-center justify-between text-[11px] text-slate-600">
                          <span>By: {report.citizenId?.name || 'Citizen'}</span>
                          <span className="font-bold">{report.status}</span>
                        </div>
                        <button
                          onClick={() => handleOpenConvertModal(report)}
                          className="w-full py-1 rounded bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[11px] transition-colors"
                        >
                          Convert to Maintenance Task
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      )}

      {/* Convert to Maintenance Task Modal */}
      {convertingReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-teal-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-950 text-teal-400 border border-teal-800/50">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Convert to Maintenance Task</h3>
                  <p className="text-xs text-slate-400">Issue #{convertingReport._id.substring(convertingReport._id.length - 6)}</p>
                </div>
              </div>

              <button
                onClick={() => setConvertingReport(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {convertSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{convertSuccessMsg}</span>
              </div>
            )}

            {convertErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>{convertErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleConvertSubmit} className="space-y-3.5">
              {/* Target Asset Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Assign to Municipal Asset *
                </label>
                <select
                  required
                  value={convertForm.assetId}
                  onChange={(e) => setConvertForm({ ...convertForm, assetId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="">-- Choose Asset to Link --</option>
                  {assets.map((asset) => (
                    <option key={asset._id} value={asset._id}>
                      {asset.name} ({asset.type.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Maintenance Action */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Maintenance Action Title *
                </label>
                <input
                  type="text"
                  required
                  value={convertForm.action}
                  onChange={(e) => setConvertForm({ ...convertForm, action: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Assigned Crew */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Assigned Team / Arborist Crew *
                </label>
                <input
                  type="text"
                  required
                  value={convertForm.performedBy}
                  onChange={(e) => setConvertForm({ ...convertForm, performedBy: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Status advancement */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    required
                    value={convertForm.date}
                    onChange={(e) => setConvertForm({ ...convertForm, date: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Advance Report Status
                  </label>
                  <select
                    value={convertForm.reportStatus}
                    onChange={(e) => setConvertForm({ ...convertForm, reportStatus: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                  >
                    <option value="In Progress">Set to 'In Progress'</option>
                    <option value="Resolved">Set to 'Resolved'</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Arborist Work Order Notes
                </label>
                <textarea
                  rows={2}
                  value={convertForm.notes}
                  onChange={(e) => setConvertForm({ ...convertForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setConvertingReport(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConverting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isConverting ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Dispatch Work Order</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
