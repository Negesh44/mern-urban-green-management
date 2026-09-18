import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AlertTriangle,
  Camera,
  MapPin,
  Crosshair,
  Trees,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import API from '../services/api';
import LocationPickerMap from '../components/LocationPickerMap';
import toast from 'react-hot-toast';

const ReportIssue = () => {
  const navigate = useNavigate();

  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({ lat: 28.6139, lng: 77.2090 });
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [assets, setAssets] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchNearbyAssets();
    handleDetectLocation();
  }, []);

  const fetchNearbyAssets = async () => {
    try {
      const res = await API.get('/api/assets');
      setAssets(res.data.data || []);
    } catch (err) {
      console.error('Failed to load asset directory for selector:', err);
    }
  };

  // Browser Geolocation auto-detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    setLocationMessage('Querying GPS satellites...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detected = {
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
        };
        setLocation(detected);
        setIsDetectingLocation(false);
        setLocationMessage(`Detected accuracy: ±${Math.round(position.coords.accuracy || 10)}m`);
        toast.success('GPS coordinates detected');
      },
      (error) => {
        setIsDetectingLocation(false);
        setLocationMessage('Could not detect exact GPS position. Tap the map to set location.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      toast('Photo attached', { icon: '📸' });
    }
  };

  const handleLocationSelect = (newLoc) => {
    setLocation(newLoc);
    setLocationMessage('Pin placed manually on map.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!description.trim()) {
      const msg = 'Please describe the hazard or condition.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('description', description.trim());
      formData.append('lat', location.lat);
      formData.append('lng', location.lng);
      if (selectedAssetId) {
        formData.append('assetId', selectedAssetId);
      }
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      await API.post('/api/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setIsSubmitting(false);
      setSubmitSuccess(true);
      toast.success('Hazard report submitted to municipal arborists!');
    } catch (err) {
      setIsSubmitting(false);
      const errText = err.response?.data?.message || 'Failed to submit report. Please try again.';
      setErrorMessage(errText);
      toast.error(errText);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-amber-950/80 text-amber-400 border border-amber-800/50 shadow-lg shadow-amber-950/30">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Report Green Hazard</h1>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Notice fallen tree branches, diseased vegetation, broken park sprinklers, or uncatalogued ecological hazards? Notify municipal arborists.
        </p>
      </div>

      {submitSuccess ? (
        <div className="p-8 rounded-3xl bg-slate-900 border border-emerald-800/60 text-center space-y-5 shadow-2xl backdrop-blur-xl animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Report Successfully Logged!</h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              Your hazard report has been routed to the municipal tree care triage backlog. You can track status updates in your citizen dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/citizen/reports"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs shadow-lg hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center gap-2"
            >
              <span>View My Reports</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                setSubmitSuccess(false);
                setDescription('');
                setPhotoFile(null);
                setPhotoPreview(null);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Hazard Description *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe the issue in detail (e.g., large broken limb hanging over cycling path, roots uplifting sidewalk, or severe bark disease)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none placeholder:text-slate-600"
              />
            </div>

            {/* Optional Link to Nearby Asset */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Link to Known Catalogued Asset (Optional)</span>
                <span className="text-[11px] text-slate-500 font-normal">Optional</span>
              </label>
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
              >
                <option value="">-- Uncatalogued / General Location Hazard --</option>
                {assets.map((asset) => (
                  <option key={asset._id} value={asset._id}>
                    {asset.name} ({asset.type.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>

            {/* Photo Upload with Live Preview */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Attach Incident Photograph
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-dashed border-slate-700 hover:border-emerald-500/80 text-slate-200 text-xs font-semibold cursor-pointer flex items-center justify-center gap-2 transition-colors">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>Choose Photo File</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>

                {photoPreview ? (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-emerald-800/80 bg-slate-950 shrink-0">
                    <img src={photoPreview} alt="Hazard preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">Supports JPG, PNG, WEBP (Max 10MB)</span>
                )}
              </div>
            </div>

            {/* Geolocation Section */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Hazard Coordinates & Map Pin *
                </label>

                <button
                  type="button"
                  onClick={autoDetectLocation}
                  disabled={isDetectingLocation}
                  className="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Crosshair className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                  <span>{isDetectingLocation ? 'Detecting GPS...' : 'Detect My Location'}</span>
                </button>
              </div>

              {locationMessage && (
                <p className="text-[11px] text-emerald-400 font-mono">{locationMessage}</p>
              )}

              {/* Interactive Mini-Map */}
              <LocationPickerMap location={location} onLocationSelect={handleLocationSelect} />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 font-mono mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={location.lat}
                    onChange={(e) => setLocation({ ...location, lat: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-mono mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={location.lng}
                    onChange={(e) => setLocation({ ...location, lng: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Transmit Hazard Report</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ReportIssue;
