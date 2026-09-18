import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Custom Pin for Location Picker
const pickerIcon = L.divIcon({
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background-color: #10b981;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid #ffffff;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="width: 8px; height: 8px; background-color: #ffffff; border-radius: 50%; transform: rotate(45deg);"></div>
    </div>
  `,
  className: 'location-picker-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Click handler component inside MapContainer
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect({
        lat: Number(e.latlng.lat.toFixed(6)),
        lng: Number(e.latlng.lng.toFixed(6)),
      });
    },
  });
  return null;
};

const LocationPickerMap = ({ location = { lat: 28.6139, lng: 77.2090 }, onLocationSelect }) => {
  const center = [location.lat || 28.6139, location.lng || 77.2090];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span className="font-semibold flex items-center gap-1.5 text-emerald-400">
          <MapPin className="w-3.5 h-3.5" />
          <span>Click map to place coordinate pin</span>
        </span>
        <span className="font-mono text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
          Lat: {location.lat || '--'}, Lng: {location.lng || '--'}
        </span>
      </div>

      <div className="h-56 w-full rounded-2xl overflow-hidden border border-slate-800 relative z-0">
        <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={onLocationSelect} />
          {location.lat && location.lng && (
            <Marker position={[location.lat, location.lng]} icon={pickerIcon} />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default LocationPickerMap;
