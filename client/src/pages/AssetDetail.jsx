import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import {
  Trees,
  MapPin,
  Calendar,
  Layers,
  Wrench,
  Shield,
  PlusCircle,
  ArrowLeft,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  Heart,
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import AssetFormModal from '../components/AssetFormModal';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';

const detailPinIcon = L.divIcon({
  html: `
    <div style="
      width: 36px;
      height: 36px;
      background-color: #10b981;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid #ffffff;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="width: 10px; height: 10px; background-color: #ffffff; border-radius: 50%; transform: rotate(45deg);"></div>
    </div>
  `,
  className: 'detail-pin-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const AssetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Maintenance Log Form State
  const [isLoggingMaintenance, setIsLoggingMaintenance] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    action: '',
    performedBy: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [maintenanceSuccessMsg, setMaintenanceSuccessMsg] = useState('');
  const [maintenanceErrorMsg, setMaintenanceErrorMsg] = useState('');

  // Delete State
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchAssetDetails();
  }, [id]);

  const fetchAssetDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/api/assets/${id}`);
      setAsset(res.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load asset details');
      setLoading(false);
    }
  };

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    setMaintenanceErrorMsg('');
    setMaintenanceSuccessMsg('');

    if (!maintenanceForm.action || !maintenanceForm.performedBy) {
      const msg = 'Action and Performed By are required fields.';
      setMaintenanceErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setIsLoggingMaintenance(true);
    try {
      const res = await API.post('/api/maintenance', {
        assetId: id,
        ...maintenanceForm,
      });

      setMaintenanceSuccessMsg('Maintenance record logged successfully!');
      toast.success('Maintenance record logged successfully!');
      setMaintenanceForm({
        action: '',
        performedBy: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });

      // Update maintenance list in state
      setAsset((prev) => ({
        ...prev,
        maintenanceHistory: [res.data.data, ...(prev.maintenanceHistory || [])],
      }));

      setIsLoggingMaintenance(false);
    } catch (err) {
      setIsLoggingMaintenance(false);
      const errMsg = err.response?.data?.message || 'Failed to record maintenance task';
      setMaintenanceErrorMsg(errMsg);
      toast.error(errMsg);
    }
  };

  const handleDeleteAsset = async () => {
    if (!window.confirm(`Are you sure you want to delete "${asset.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await API.delete(`/api/assets/${id}`);
      toast.success(`Asset "${asset.name}" removed from inventory`);
      navigate(isAdmin ? '/admin/dashboard' : '/citizen/dashboard');
    } catch (err) {
      setIsDeleting(false);
      toast.error(err.response?.data?.message || 'Failed to delete asset');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading green asset telemetry & history...</p>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="max-w-lg mx-auto my-16 p-8 bg-slate-900 border border-rose-900/50 rounded-3xl text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Asset Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'The requested asset record does not exist.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assets</span>
        </button>

        {isAdmin && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 text-teal-400" />
              <span>Edit Asset</span>
            </button>
            <button
              onClick={handleDeleteAsset}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-rose-800/60 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Asset Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-emerald-900/40 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Top Info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase font-bold px-3 py-1 rounded-full bg-slate-950 text-emerald-400 border border-emerald-900/60 font-mono">
                {asset.type.replace('_', ' ')}
              </span>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  asset.healthStatus === 'Healthy' || asset.healthStatus === 'Excellent'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                    : asset.healthStatus === 'Diseased'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                    : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                }`}
              >
                Status: {asset.healthStatus}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {asset.name}
            </h1>

            {asset.species && (
              <p className="text-sm text-emerald-300/80 italic -mt-2">
                Species: <strong>{asset.species}</strong>
              </p>
            )}

            <p className="text-sm text-slate-300 leading-relaxed">
              {asset.description || 'No ecological description provided for this municipal asset.'}
            </p>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {asset.age !== undefined && (
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Age</div>
                  <div className="text-lg font-bold text-white mt-0.5">{asset.age} yrs</div>
                </div>
              )}

              {asset.plantingDate && (
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Planted</div>
                  <div className="text-sm font-bold text-white mt-1">
                    {new Date(asset.plantingDate).toLocaleDateString()}
                  </div>
                </div>
              )}

              {asset.area && (
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Area</div>
                  <div className="text-lg font-bold text-white mt-0.5">{asset.area.toLocaleString()} m²</div>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Coordinates</div>
                <div className="text-xs font-mono text-emerald-400 mt-1">
                  {asset.location?.lat.toFixed(4)}, {asset.location?.lng.toFixed(4)}
                </div>
              </div>
            </div>
          </div>

          {/* Right Image / Showcase */}
          <div className="space-y-4">
            <div className="h-56 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              {asset.images && asset.images.length > 0 ? (
                <img
                  src={asset.images[0]}
                  alt={asset.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
                  <Trees className="w-10 h-10" />
                  <span className="text-xs">No image uploaded</span>
                </div>
              )}
            </div>

            {/* Mini Map Pinned to Location */}
            {asset.location?.lat && asset.location?.lng && (
              <div className="h-44 w-full rounded-2xl overflow-hidden border border-slate-800 relative z-0">
                <MapContainer
                  center={[asset.location.lat, asset.location.lng]}
                  zoom={15}
                  scrollWheelZoom={false}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[asset.location.lat, asset.location.lng]} icon={detailPinIcon} />
                </MapContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Maintenance History & Logging Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Maintenance History Timeline (Col 1 & 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-teal-400" />
              <span>Maintenance & Arborist History</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {asset.maintenanceHistory?.length || 0} event(s)
            </span>
          </div>

          {(!asset.maintenanceHistory || asset.maintenanceHistory.length === 0) ? (
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
              <Clock className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-300 font-medium">No recorded maintenance activity</p>
              <p className="text-xs text-slate-500">Scheduled municipal checkups and inspections will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {asset.maintenanceHistory.map((log) => (
                <div
                  key={log._id}
                  className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-teal-800/50 transition-all space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                      {log.action}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(log.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-400">Performed by:</span>
                    <span className="font-semibold text-slate-200">{log.performedBy}</span>
                  </div>

                  {log.notes && (
                    <p className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                      {log.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin "Add Maintenance Log" Form (Col 3) */}
        {isAdmin ? (
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-teal-900/40 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider">
              <PlusCircle className="w-4 h-4" />
              <span>Log Maintenance Action</span>
            </div>
            <p className="text-xs text-slate-400">
              Record canopy pruning, disease treatments, or drip irrigation overhauls for this asset.
            </p>

            {maintenanceSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{maintenanceSuccessMsg}</span>
              </div>
            )}

            {maintenanceErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>{maintenanceErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleMaintenanceSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Activity / Action *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Canopy Trimming or Foliar Spray"
                  value={maintenanceForm.action}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, action: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Personnel / Team *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Municipal Forestry Unit A"
                  value={maintenanceForm.performedBy}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, performedBy: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Execution Date
                </label>
                <input
                  type="date"
                  required
                  value={maintenanceForm.date}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, date: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Inspection Notes & Observations
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide technical notes, dosage, or follow-up recommendations..."
                  value={maintenanceForm.notes}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingMaintenance}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoggingMaintenance ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Record Activity</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Citizen Info Box */
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase">
              <Heart className="w-4 h-4" />
              <span>Citizen Stewardship</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Citizens can inspect maintenance history and track when municipal arborists last performed care routines on this asset.
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <AssetFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          asset={asset}
          onSaved={(updatedAsset) => {
            setAsset((prev) => ({ ...prev, ...updatedAsset }));
          }}
        />
      )}
    </div>
  );
};

export default AssetDetail;
