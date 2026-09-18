import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { Filter, Trees, MapPin, ExternalLink, RefreshCw, Eye, Sparkles } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Helper component to auto-recenter map when selected asset or filters change
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

// Generate custom color-coded map markers
const getMarkerIcon = (asset) => {
  let color = '#10b981'; // Default Green (Healthy)

  if (asset.type === 'tree') {
    if (asset.healthStatus === 'Healthy') {
      color = '#10b981'; // Green
    } else if (asset.healthStatus === 'Diseased') {
      color = '#f59e0b'; // Orange
    } else if (asset.healthStatus === 'Dead') {
      color = '#ef4444'; // Red
    }
  } else if (asset.type === 'park') {
    color = '#0284c7'; // Blue
  } else if (asset.type === 'urban_forest') {
    color = '#2563eb'; // Deep Blue
  } else if (asset.type === 'green_belt') {
    color = '#0d9488'; // Teal Blue
  }

  const iconHtml = `
    <div style="position: relative; width: 34px; height: 34px;">
      <div style="
        position: absolute;
        width: 32px;
        height: 32px;
        background-color: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid #ffffff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background-color: #ffffff;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-marker',
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
  });
};

const AssetMap = ({ assets = [], loading = false, onRefresh }) => {
  const [typeFilter, setTypeFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');

  // Filtered Assets list
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchType = typeFilter === 'all' || asset.type === typeFilter;
      const matchHealth = healthFilter === 'all' || asset.healthStatus === healthFilter;
      return matchType && matchHealth;
    });
  }, [assets, typeFilter, healthFilter]);

  // Center coordinate calculation
  const defaultCenter = [28.6139, 77.2090];
  const center = useMemo(() => {
    if (filteredAssets.length > 0 && filteredAssets[0].location?.lat && filteredAssets[0].location?.lng) {
      return [filteredAssets[0].location.lat, filteredAssets[0].location.lng];
    }
    return defaultCenter;
  }, [filteredAssets]);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Top Filter Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
            <Trees className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Interactive GIS Urban Canopy Map</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 font-mono">
                {filteredAssets.length} of {assets.length} assets
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Real-time geolocated municipal vegetation and park canopy registry
            </p>
          </div>
        </div>

        {/* Filter Controls & Legend */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Asset Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Asset Types</option>
              <option value="tree" className="bg-slate-900">Trees Only</option>
              <option value="park" className="bg-slate-900">Parks</option>
              <option value="urban_forest" className="bg-slate-900">Urban Forests</option>
              <option value="green_belt" className="bg-slate-900">Green Belts</option>
            </select>
          </div>

          {/* Health Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Conditions</option>
              <option value="Healthy" className="bg-slate-900">Healthy (Green)</option>
              <option value="Diseased" className="bg-slate-900">Diseased (Orange)</option>
              <option value="Dead" className="bg-slate-900">Dead (Red)</option>
              <option value="Excellent" className="bg-slate-900">Excellent</option>
              <option value="Good" className="bg-slate-900">Good</option>
            </select>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
              title="Refresh Assets"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-[520px] bg-slate-950">
        {loading && (
          <div className="absolute inset-0 z-10 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center space-x-3">
            <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-slate-300">Synchronizing GIS Telemetry...</span>
          </div>
        )}

        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <ChangeView center={center} zoom={13} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredAssets.map((asset) => {
            if (!asset.location?.lat || !asset.location?.lng) return null;

            return (
              <Marker
                key={asset._id}
                position={[asset.location.lat, asset.location.lng]}
                icon={getMarkerIcon(asset)}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-1 max-w-[260px] text-slate-900">
                    {asset.images && asset.images.length > 0 && (
                      <div className="w-full h-28 rounded-lg overflow-hidden mb-2 bg-slate-100">
                        <img
                          src={asset.images[0]}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <h4 className="font-bold text-sm text-slate-900 leading-snug">
                      {asset.name}
                    </h4>
                    {asset.species && (
                      <p className="text-[11px] text-slate-600 italic mb-1">{asset.species}</p>
                    )}

                    <div className="flex items-center gap-1.5 my-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                        {asset.type.replace('_', ' ')}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          asset.healthStatus === 'Healthy' || asset.healthStatus === 'Excellent'
                            ? 'bg-emerald-100 text-emerald-800'
                            : asset.healthStatus === 'Diseased'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {asset.healthStatus}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-0.5 mb-3">
                      {asset.age && <p>Age: <strong className="text-slate-800">{asset.age} years</strong></p>}
                      {asset.area && <p>Area: <strong className="text-slate-800">{asset.area.toLocaleString()} m²</strong></p>}
                      <p className="font-mono text-[10px] text-slate-500">
                        📍 {asset.location.lat.toFixed(4)}, {asset.location.lng.toFixed(4)}
                      </p>
                    </div>

                    <Link
                      to={`/assets/${asset._id}`}
                      className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Full Details</span>
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Visual Color Legend Bar */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-slate-300">Marker Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
            <span>Healthy Tree</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm"></span>
            <span>Diseased Tree</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-sm"></span>
            <span>Dead / Hazard</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-sky-500 inline-block shadow-sm"></span>
            <span>Park / Forest / Belt</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          Tiles: OpenStreetMap contributors
        </div>
      </div>
    </div>
  );
};

export default AssetMap;
