import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';
import {
  Shield,
  Trees,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Map as MapIcon,
  Table as TableIcon,
  BarChart3,
  RefreshCw,
  Sparkles,
  Droplets,
  AlertTriangle,
  ArrowUpDown,
} from 'lucide-react';
import API from '../services/api';
import AssetMap from '../components/AssetMap';
import AssetFormModal from '../components/AssetFormModal';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'map', 'analytics'
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Table Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/api/assets');
      setAssets(res.data.data || []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch assets');
      setLoading(false);
    }
  };

  const handleDeleteAsset = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await API.delete(`/api/assets/${id}`);
      setAssets((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete asset');
    }
  };

  const handleOpenAddModal = () => {
    setEditingAsset(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (asset) => {
    setEditingAsset(asset);
    setIsModalOpen(true);
  };

  const handleAssetSaved = (savedAsset) => {
    setAssets((prev) => {
      const exists = prev.some((a) => a._id === savedAsset._id);
      if (exists) {
        return prev.map((a) => (a._id === savedAsset._id ? savedAsset : a));
      }
      return [savedAsset, ...prev];
    });
  };

  // Filtered & Sorted Assets
  const filteredAndSortedAssets = useMemo(() => {
    let result = [...assets];

    // Filter by type
    if (typeFilter !== 'all') {
      result = result.filter((a) => a.type === typeFilter);
    }

    // Filter by health
    if (healthFilter !== 'all') {
      result = result.filter((a) => a.healthStatus === healthFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.species && a.species.toLowerCase().includes(q)) ||
          (a.description && a.description.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'age' || sortField === 'area') {
        aVal = aVal || 0;
        bVal = bVal || 0;
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [assets, typeFilter, healthFilter, searchQuery, sortField, sortOrder]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Analytics Aggregation
  const typeCounts = useMemo(() => {
    return [
      { name: 'Trees', count: assets.filter((a) => a.type === 'tree').length },
      { name: 'Parks', count: assets.filter((a) => a.type === 'park').length },
      { name: 'Forests', count: assets.filter((a) => a.type === 'urban_forest').length },
      { name: 'Green Belts', count: assets.filter((a) => a.type === 'green_belt').length },
    ];
  }, [assets]);

  const healthCounts = useMemo(() => {
    const trees = assets.filter((a) => a.type === 'tree');
    return [
      { status: 'Healthy', count: trees.filter((t) => t.healthStatus === 'Healthy').length },
      { status: 'Diseased', count: trees.filter((t) => t.healthStatus === 'Diseased').length },
      { status: 'Dead', count: trees.filter((t) => t.healthStatus === 'Dead').length },
    ];
  }, [assets]);

  return (
    <div className="space-y-8 py-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Green Assets & Operations</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-700/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Asset</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-slate-900 text-emerald-400 border border-emerald-900/60 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <TableIcon className="w-4 h-4" />
          <span>Asset Inventory ({assets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'map'
              ? 'bg-slate-900 text-teal-400 border border-teal-900/60 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <MapIcon className="w-4 h-4" />
          <span>GIS Spatial Map</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-slate-900 text-cyan-400 border border-cyan-900/60 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Ecological Analytics</span>
        </button>
      </div>

      {/* TAB 1: Asset Inventory Table View */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Table Search & Filter Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, species or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="tree">Trees</option>
                <option value="park">Parks</option>
                <option value="urban_forest">Urban Forests</option>
                <option value="green_belt">Green Belts</option>
              </select>

              <select
                value={healthFilter}
                onChange={(e) => setHealthFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">All Health</option>
                <option value="Healthy">Healthy</option>
                <option value="Diseased">Diseased</option>
                <option value="Dead">Dead</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
              </select>

              <button
                onClick={fetchAssets}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                title="Refresh inventory"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">
                      <button
                        onClick={() => toggleSort('name')}
                        className="flex items-center gap-1 font-semibold hover:text-white"
                      >
                        <span>Asset</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      <button
                        onClick={() => toggleSort('type')}
                        className="flex items-center gap-1 font-semibold hover:text-white"
                      >
                        <span>Classification</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th scope="col" className="px-4 py-3.5">Taxonomy / Dimensions</th>
                    <th scope="col" className="px-4 py-3.5">
                      <button
                        onClick={() => toggleSort('healthStatus')}
                        className="flex items-center gap-1 font-semibold hover:text-white"
                      >
                        <span>Condition</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th scope="col" className="px-4 py-3.5">Coordinates</th>
                    <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-500">
                        <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2" />
                        Loading assets from database...
                      </td>
                    </tr>
                  ) : filteredAndSortedAssets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-500">
                        No assets found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedAssets.map((asset) => (
                      <tr key={asset._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800 flex items-center justify-center">
                              {asset.images && asset.images.length > 0 ? (
                                <img
                                  src={asset.images[0]}
                                  alt={asset.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Trees className="w-5 h-5 text-slate-600" />
                              )}
                            </div>
                            <div>
                              <Link
                                to={`/assets/${asset._id}`}
                                className="font-semibold text-slate-100 hover:text-emerald-400 transition-colors"
                              >
                                {asset.name}
                              </Link>
                              <div className="text-[11px] text-slate-500 line-clamp-1">
                                {asset.description || 'No description'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-slate-950 text-slate-300 border border-slate-800 font-mono">
                            {asset.type.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          {asset.type === 'tree' ? (
                            <div>
                              <div className="text-slate-200 font-medium">{asset.species || 'N/A'}</div>
                              <div className="text-[11px] text-slate-500">{asset.age ? `${asset.age} yrs old` : ''}</div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-slate-200 font-medium">{asset.area ? `${asset.area.toLocaleString()} m²` : 'N/A'}</div>
                              <div className="text-[11px] text-slate-500">Total area</div>
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                              asset.healthStatus === 'Healthy' || asset.healthStatus === 'Excellent'
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                                : asset.healthStatus === 'Diseased'
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                                : 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                            }`}
                          >
                            {asset.healthStatus}
                          </span>
                        </td>

                        <td className="px-4 py-4 font-mono text-[11px] text-slate-400">
                          {asset.location?.lat.toFixed(4)}, {asset.location?.lng.toFixed(4)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/assets/${asset._id}`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => handleOpenEditModal(asset)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Edit Asset"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteAsset(asset._id, asset.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Delete Asset"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Interactive GIS Map View */}
      {activeTab === 'map' && (
        <AssetMap assets={assets} loading={loading} onRefresh={fetchAssets} />
      )}

      {/* TAB 3: Ecological Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Trees className="w-4 h-4 text-emerald-400" />
                <span>Asset Inventory by Classification</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeCounts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} />
                    <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Tree Health & Phytosanitary Condition</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={healthCounts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="status" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} />
                    <Bar dataKey="count" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <AssetFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          asset={editingAsset}
          onSaved={handleAssetSaved}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
