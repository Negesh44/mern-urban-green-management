import React, { useState, useEffect } from 'react';
import { X, Trees, Upload, MapPin, AlertCircle, Save, CheckCircle2 } from 'lucide-react';
import API from '../services/api';
import LocationPickerMap from './LocationPickerMap';

const AssetFormModal = ({ isOpen, onClose, asset = null, onSaved }) => {
  const isEditing = Boolean(asset && asset._id);

  const [formData, setFormData] = useState({
    type: 'tree',
    name: '',
    species: '',
    age: '',
    plantingDate: '',
    area: '',
    healthStatus: 'Healthy',
    description: '',
    lat: 28.6139,
    lng: 77.2090,
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (asset) {
      setFormData({
        type: asset.type || 'tree',
        name: asset.name || '',
        species: asset.species || '',
        age: asset.age !== undefined ? asset.age : '',
        plantingDate: asset.plantingDate ? asset.plantingDate.split('T')[0] : '',
        area: asset.area !== undefined ? asset.area : '',
        healthStatus: asset.healthStatus || 'Healthy',
        description: asset.description || '',
        lat: asset.location?.lat || 28.6139,
        lng: asset.location?.lng || 77.2090,
      });
    } else {
      setFormData({
        type: 'tree',
        name: '',
        species: '',
        age: '',
        plantingDate: '',
        area: '',
        healthStatus: 'Healthy',
        description: '',
        lat: 28.6139,
        lng: 77.2090,
      });
    }
    setSelectedFiles([]);
    setErrorMsg('');
  }, [asset, isOpen]);

  if (!isOpen) return null;

  const handleLocationSelect = ({ lat, lng }) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Asset name is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('type', formData.type);
      data.append('name', formData.name.trim());
      data.append('healthStatus', formData.healthStatus);
      data.append('description', formData.description.trim());
      data.append('lat', formData.lat);
      data.append('lng', formData.lng);

      if (formData.type === 'tree') {
        if (formData.species) data.append('species', formData.species.trim());
        if (formData.age !== '') data.append('age', formData.age);
        if (formData.plantingDate) data.append('plantingDate', formData.plantingDate);
      } else {
        if (formData.area !== '') data.append('area', formData.area);
      }

      // Append image files if any selected
      selectedFiles.forEach((file) => {
        data.append('images', file);
      });

      let res;
      if (isEditing) {
        res = await API.put(`/api/assets/${asset._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await API.post('/api/assets', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setIsSubmitting(false);
      if (onSaved) onSaved(res.data.data);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      const msg = err.response?.data?.message || err.message || 'Failed to save asset';
      setErrorMsg(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-800/40">
              <Trees className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEditing ? `Edit Asset: ${asset.name}` : 'Register New Green Asset'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditing ? 'Modify attributes, condition or canopy coordinates' : 'Input taxonomy, location coordinates and imagery'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Asset Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Asset Classification *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="tree">Tree Specimen</option>
                <option value="park">Public Park / Gardens</option>
                <option value="urban_forest">Urban Forest Reserve</option>
                <option value="green_belt">Green Belt / Buffer</option>
              </select>
            </div>

            {/* Health / Condition */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Health Status / Condition *
              </label>
              <select
                value={formData.healthStatus}
                onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Healthy">Healthy (Optimal)</option>
                <option value="Diseased">Diseased (Requires Treatment)</option>
                <option value="Dead">Dead (Hazard Risk)</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
          </div>

          {/* Asset Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Asset Name / Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Heritage Peepal Specimen #01 or North Botanical Park"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Dynamic Fields for Trees */}
          {formData.type === 'tree' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1.5">
                  Species / Botanical Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ficus religiosa"
                  value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1.5">
                  Estimated Age (Years)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 25"
                  min="0"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1.5">
                  Planting Date
                </label>
                <input
                  type="date"
                  value={formData.plantingDate}
                  onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          ) : (
            /* Area field for parks/forests/belts */
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1.5">
                Total Land Area (Square Meters)
              </label>
              <input
                type="number"
                placeholder="e.g. 120000"
                min="0"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Ecological Description & Notes
            </label>
            <textarea
              rows={2}
              placeholder="Provide canopy characteristics, environmental conditions, and municipal importance..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Interactive Mini-Map Location Picker */}
          <div className="space-y-2">
            <LocationPickerMap
              location={{ lat: Number(formData.lat), lng: Number(formData.lng) }}
              onLocationSelect={handleLocationSelect}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 font-mono mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-mono mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Upload Canopy / Specimen Images
            </label>
            <div className="flex items-center gap-3">
              <label className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-700/60 text-slate-200 text-xs font-medium cursor-pointer flex items-center gap-2 transition-colors">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Choose Image Files</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-slate-400">
                {selectedFiles.length > 0
                  ? `${selectedFiles.length} file(s) selected: ${selectedFiles.map((f) => f.name).join(', ')}`
                  : isEditing && asset.images?.length > 0
                  ? `${asset.images.length} existing image(s)`
                  : 'No new file chosen'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-700/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'Save Changes' : 'Create Asset'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetFormModal;
