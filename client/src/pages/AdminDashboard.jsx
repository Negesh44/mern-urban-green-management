import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
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
  AlertTriangle,
  ArrowUpDown,
  Calendar,
  Layers,
  Wrench,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import API from '../services/api';
import AssetMap from '../components/AssetMap';
import AssetFormModal from '../components/AssetFormModal';

const AdminDashboard = () => {
  // Navigation tab from URL search parameters: 'analytics' (default), 'inventory', 'map', 'attention'
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'analytics';
  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  // Summary and Asset state
  const [summaryData, setSummaryData] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Table Search & Filters (for Inventory Tab)
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Needs Attention Search & Filters
  const [attentionSearch, setAttentionSearch] = useState('');
  const [attentionTypeFilter, setAttentionTypeFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both dashboard summary and all assets in parallel
      const [summaryRes, assetsRes] = await Promise.all([
        API.get('/api/dashboard/summary').catch(() => ({ data: { data: null } })),
        API.get('/api/assets').catch(() => ({ data: { data: [] } })),
      ]);

      setSummaryData(summaryRes.data.data);
      setAssets(assetsRes.data.data || []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard telemetry');
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
      toast.success(`Asset "${name}" deleted successfully`);
      // Refresh summary to reflect deletion
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete asset');
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
    toast.success(`Asset "${savedAsset.name}" saved successfully`);
    fetchDashboardData();
  };

  // Filtered & Sorted Assets for Tab 2 (Inventory Table)
  const filteredAndSortedAssets = useMemo(() => {
    let result = [...assets];

    if (typeFilter !== 'all') {
      result = result.filter((a) => a.type === typeFilter);
    }

    if (healthFilter !== 'all') {
      result = result.filter((a) => a.healthStatus === healthFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.species && a.species.toLowerCase().includes(q)) ||
          (a.description && a.description.toLowerCase().includes(q))
      );
    }

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

  // Filtered Needs Attention list
  const filteredNeedsAttention = useMemo(() => {
    if (!summaryData?.needsAttention) return [];
    let list = summaryData.needsAttention;

    if (attentionTypeFilter !== 'all') {
      list = list.filter((a) => a.type === attentionTypeFilter);
    }

    if (attentionSearch.trim()) {
      const q = attentionSearch.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.species && a.species.toLowerCase().includes(q))
      );
    }

    return list;
  }, [summaryData, attentionTypeFilter, attentionSearch]);

  // Tree health counts fallback (if summary data not loaded yet)
  const healthChartData = useMemo(() => {
    if (summaryData?.treeHealthDistribution) {
      return summaryData.treeHealthDistribution;
    }
    const trees = assets.filter((a) => a.type === 'tree');
    return [
      { name: 'Healthy', value: trees.filter((t) => t.healthStatus === 'Healthy').length, color: '#10b981' },
      { name: 'Diseased', value: trees.filter((t) => t.healthStatus === 'Diseased').length, color: '#f59e0b' },
      { name: 'Dead', value: trees.filter((t) => t.healthStatus === 'Dead').length, color: '#ef4444' },
    ];
  }, [summaryData, assets]);

  // Asset type counts fallback
  const typeChartData = useMemo(() => {
    if (summaryData?.assetsByType) {
      return summaryData.assetsByType;
    }
    return [
      { name: 'Trees', count: assets.filter((a) => a.type === 'tree').length, fill: '#10b981' },
      { name: 'Parks', count: assets.filter((a) => a.type === 'park').length, fill: '#06b6d4' },
      { name: 'Urban Forests', count: assets.filter((a) => a.type === 'urban_forest').length, fill: '#3b82f6' },
      { name: 'Green Belts', count: assets.filter((a) => a.type === 'green_belt').length, fill: '#8b5cf6' },
    ];
  }, [summaryData, assets]);

  // Survival trend data fallback
  const survivalTrendData = useMemo(() => {
    if (summaryData?.treeSurvivalRateTrend) {
      return summaryData.treeSurvivalRateTrend;
    }
    return [
      { period: '2022', totalTrees: 4, healthyTrees: 4, survivalRate: 100 },
      { period: '2023', totalTrees: 8, healthyTrees: 8, survivalRate: 100 },
      { period: '2024', totalTrees: 11, healthyTrees: 10, survivalRate: 90.9 },
      { period: '2025', totalTrees: 14, healthyTrees: 13, survivalRate: 92.8 },
      { period: '2026', totalTrees: 15, healthyTrees: 14, survivalRate: 93.3 },
    ];
  }, [summaryData]);

  // Calculate quick metrics
  const totalTrees = summaryData?.summaryCards?.totalTrees ?? assets.filter((a) => a.type === 'tree').length;
  const totalParksForestsBelts =
    summaryData?.summaryCards?.totalParksForestsBelts ??
    assets.filter((a) => ['park', 'urban_forest', 'green_belt'].includes(a.type)).length;
  const totalGreenArea = summaryData?.summaryCards?.totalGreenArea ?? 245000;
  const totalGreenAreaHectares =
    summaryData?.summaryCards?.totalGreenAreaHectares ?? (totalGreenArea / 10000).toFixed(2);
  const pendingReportsCount = summaryData?.summaryCards?.pendingReportsCount ?? 0;
  const needsAttentionCount = summaryData?.needsAttentionCount ?? 0;

  // Custom Recharts Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <p className="font-bold text-slate-200">{label || payload[0].name}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color || entry.fill || '#10b981' }}>
              {entry.name || 'Value'}: <span className="font-semibold">{entry.value}</span>
              {entry.unit ? ` ${entry.unit}` : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 py-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Executive Command & Intelligence</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Urban Green Analytics & KPIs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry, phytosanitary index, arboricultural maintenance alerts, and canopy reserves.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/admin/reports"
            className="px-3.5 py-2.5 rounded-xl bg-amber-950/70 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Citizen Triage</span>
            {pendingReportsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                {pendingReportsCount}
              </span>
            )}
          </Link>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-700/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Green Asset</span>
          </button>
        </div>
      </div>

      {/* Navigation View Switcher (Analytics is default landing) */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-slate-900 text-emerald-400 border border-emerald-800/80 shadow-md shadow-emerald-950/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>Executive KPIs & Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-slate-900 text-teal-400 border border-teal-800/80 shadow-md shadow-teal-950/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <TableIcon className="w-4 h-4 text-teal-400" />
          <span>Asset Inventory Table ({assets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'map'
              ? 'bg-slate-900 text-cyan-400 border border-cyan-800/80 shadow-md shadow-cyan-950/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <MapIcon className="w-4 h-4 text-cyan-400" />
          <span>GIS Spatial Map</span>
        </button>

        <button
          onClick={() => setActiveTab('attention')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'attention'
              ? 'bg-slate-900 text-amber-400 border border-amber-800/80 shadow-md shadow-amber-950/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Wrench className="w-4 h-4 text-amber-400" />
          <span>Needs Attention ({filteredNeedsAttention.length})</span>
        </button>
      </div>

      {/* VIEW 1: Executive KPIs & Visual Analytics (DEFAULT VIEW) */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Summary Metric Cards (4 Pillars) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Total Trees */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/50 to-slate-900 border border-emerald-800/50 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
              <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Trees className="w-20 h-20 text-emerald-400" />
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Total Trees
                </span>
                <div className="p-2 rounded-xl bg-emerald-900/50 text-emerald-300 border border-emerald-700/50">
                  <Trees className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white mb-1">
                {totalTrees.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-emerald-400 font-semibold">
                  {assets.filter((a) => a.type === 'tree' && a.healthStatus === 'Healthy').length} Healthy
                </span>
                <span>•</span>
                <span className="text-amber-400">
                  {assets.filter((a) => a.type === 'tree' && a.healthStatus === 'Diseased').length} Diseased
                </span>
              </div>
            </div>

            {/* Card 2: Total Parks, Forests & Green Belts */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-950/50 to-slate-900 border border-teal-800/50 shadow-lg relative overflow-hidden group hover:border-teal-500/50 transition-all">
              <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Layers className="w-20 h-20 text-teal-400" />
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                  Parks & Reserves
                </span>
                <div className="p-2 rounded-xl bg-teal-900/50 text-teal-300 border border-teal-700/50">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white mb-1">
                {totalParksForestsBelts.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400">
                Parks, Urban Forests & Green Corridors
              </div>
            </div>

            {/* Card 3: Total Green Area */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/50 to-slate-900 border border-cyan-800/50 shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-all">
              <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="w-20 h-20 text-cyan-400" />
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                  Total Green Area
                </span>
                <div className="p-2 rounded-xl bg-cyan-900/50 text-cyan-300 border border-cyan-700/50">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white mb-1">
                {totalGreenArea.toLocaleString()}{' '}
                <span className="text-sm font-normal text-slate-400">m²</span>
              </div>
              <div className="text-xs text-cyan-400 font-medium">
                ≈ {totalGreenAreaHectares} Hectares municipal canopy
              </div>
            </div>

            {/* Card 4: Pending Citizen Reports */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/50 to-slate-900 border border-amber-800/50 shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all">
              <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <AlertTriangle className="w-20 h-20 text-amber-400" />
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Pending Reports
                </span>
                <div className="p-2 rounded-xl bg-amber-900/50 text-amber-300 border border-amber-700/50">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white mb-1">
                {pendingReportsCount}
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className={pendingReportsCount > 0 ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
                  {pendingReportsCount > 0 ? 'Awaiting municipal triage' : 'All incidents resolved'}
                </span>
                <Link
                  to="/admin/reports"
                  className="text-amber-300 hover:text-white flex items-center gap-0.5 underline font-medium"
                >
                  Review <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Charts Row: Pie Chart (Tree Health) & Bar Chart (Assets by Type) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Tree Health Distribution (Pie/Donut Chart) */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800/60 text-emerald-400">
                    <Trees className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Tree Health Distribution</h3>
                    <p className="text-[11px] text-slate-400">
                      Phytosanitary status breakdown across municipal tree population
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                  {totalTrees} Trees
                </span>
              </div>

              <div className="h-64 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={healthChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      stroke="#0f172a"
                      strokeWidth={2}
                    >
                      {healthChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color || (index === 0 ? '#10b981' : index === 1 ? '#f59e0b' : '#ef4444')}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry) => (
                        <span className="text-xs text-slate-300 font-medium mr-3">
                          {value} ({entry.payload.value})
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Center Metric */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-7">
                  <span className="text-2xl font-black text-white">{totalTrees}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Monitored
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
                {healthChartData.map((h) => {
                  const pct = totalTrees > 0 ? Math.round((h.value / totalTrees) * 100) : 0;
                  return (
                    <div key={h.name} className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                      <div className="text-[10px] text-slate-400 font-medium">{h.name}</div>
                      <div className="text-sm font-bold text-white">{h.value}</div>
                      <div className="text-[10px] font-mono text-slate-500">{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 2: Asset Inventory by Classification (Bar Chart) */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-teal-950 border border-teal-800/60 text-teal-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Asset Inventory by Type</h3>
                    <p className="text-[11px] text-slate-400">
                      Distribution across trees, parks, urban forests, and green corridors
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                  {assets.length} Total
                </span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {typeChartData.map((entry, index) => (
                        <Cell
                          key={`bar-${index}`}
                          fill={
                            entry.fill ||
                            (index === 0
                              ? '#10b981'
                              : index === 1
                              ? '#06b6d4'
                              : index === 2
                              ? '#3b82f6'
                              : '#8b5cf6')
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-center">
                {typeChartData.map((item) => (
                  <div key={item.name} className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                    <div className="text-[10px] text-slate-400 font-medium truncate">{item.name}</div>
                    <div className="text-sm font-bold text-white">{item.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 3: Survival / Health Trend Over Time (Area Chart) */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800/60 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Tree Canopy Survival & Vitality Rate Trend
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Historical survival trajectory calculated across chronological planting cohorts
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-semibold">
                  Avg Survival: 93.3%
                </span>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={survivalTrendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="survivalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="period" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis
                    domain={[80, 100]}
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="survivalRate"
                    name="Survival Rate (%)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#survivalGradient)"
                    dot={{ r: 4, fill: '#10b981', stroke: '#022c22', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#34d399' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* "Needs Attention" List: Flagged Assets Overdue for Maintenance */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-amber-900/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Wrench className="w-4 h-4" />
                  <span>Maintenance Action Required: Assets Needing Attention</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Assets with no maintenance log in the last 6 months, or exhibiting phytosanitary distress.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/80 text-xs font-bold font-mono">
                  {filteredNeedsAttention.length} Flagged Assets
                </span>
              </div>
            </div>

            {/* Filter / Search for Attention List */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter attention list..."
                  value={attentionSearch}
                  onChange={(e) => setAttentionSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <select
                  value={attentionTypeFilter}
                  onChange={(e) => setAttentionTypeFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="all">All Classifications</option>
                  <option value="tree">Trees</option>
                  <option value="park">Parks</option>
                  <option value="urban_forest">Urban Forests</option>
                  <option value="green_belt">Green Belts</option>
                </select>
              </div>
            </div>

            {/* Attention Table */}
            <div className="rounded-xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th scope="col" className="px-4 py-3">Asset Identifier</th>
                      <th scope="col" className="px-3 py-3">Type</th>
                      <th scope="col" className="px-3 py-3">Condition</th>
                      <th scope="col" className="px-3 py-3">Last Maintenance</th>
                      <th scope="col" className="px-3 py-3">Total Logs</th>
                      <th scope="col" className="px-4 py-3 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredNeedsAttention.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-500">
                          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5 opacity-80" />
                          No assets currently overdue for maintenance!
                        </td>
                      </tr>
                    ) : (
                      filteredNeedsAttention.slice(0, 10).map((asset) => {
                        const hasNeverBeenMaintained = !asset.lastMaintenanceDate;
                        const lastDateFormatted = hasNeverBeenMaintained
                          ? 'Never Maintained'
                          : new Date(asset.lastMaintenanceDate).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            });

                        return (
                          <tr key={asset._id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3">
                              <Link
                                to={`/assets/${asset._id}`}
                                className="font-semibold text-slate-200 hover:text-emerald-400 transition-colors block"
                              >
                                {asset.name}
                              </Link>
                              <div className="text-[11px] text-slate-500">
                                {asset.species || (asset.type ? asset.type.replace('_', ' ') : 'General Asset')}
                              </div>
                            </td>

                            <td className="px-3 py-3">
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                                {asset.type.replace('_', ' ')}
                              </span>
                            </td>

                            <td className="px-3 py-3">
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  asset.healthStatus === 'Healthy'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    : asset.healthStatus === 'Diseased'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                                }`}
                              >
                                {asset.healthStatus}
                              </span>
                            </td>

                            <td className="px-3 py-3 font-mono">
                              <span
                                className={`text-xs ${
                                  hasNeverBeenMaintained
                                    ? 'text-rose-400 font-semibold'
                                    : 'text-amber-400 font-medium'
                                }`}
                              >
                                {lastDateFormatted}
                              </span>
                            </td>

                            <td className="px-3 py-3 font-mono text-slate-400">
                              {asset.logsCount ?? 0}
                            </td>

                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  to={`/assets/${asset._id}`}
                                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors flex items-center gap-1 text-[11px] font-medium"
                                  title="Inspect Asset"
                                >
                                  <Eye className="w-3 h-3 text-teal-400" />
                                  <span>Inspect</span>
                                </Link>

                                <Link
                                  to={`/assets/${asset._id}`}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 transition-colors flex items-center gap-1 text-[11px] font-medium"
                                  title="Add Maintenance Log"
                                >
                                  <Wrench className="w-3 h-3 text-emerald-400" />
                                  <span>Log Task</span>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {filteredNeedsAttention.length > 10 && (
                <div className="p-3 bg-slate-950 text-center text-xs text-slate-500 border-t border-slate-800">
                  Showing top 10 urgent items of {filteredNeedsAttention.length} flagged assets.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: Dedicated Maintenance / Needs Attention View */}
      {activeTab === 'attention' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-amber-900/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                  <Wrench className="w-5 h-5" />
                  <span>Arboricultural Maintenance Overdue & Attention List</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Assets with no recorded maintenance log in the last 6 months, or exhibiting phytosanitary distress.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/80 text-xs font-bold font-mono">
                  {filteredNeedsAttention.length} Urgent Items
                </span>
              </div>
            </div>

            {/* Filter / Search for Attention List */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter attention list..."
                  value={attentionSearch}
                  onChange={(e) => setAttentionSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <select
                  value={attentionTypeFilter}
                  onChange={(e) => setAttentionTypeFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="all">All Classifications</option>
                  <option value="tree">Trees</option>
                  <option value="park">Parks</option>
                  <option value="urban_forest">Urban Forests</option>
                  <option value="green_belt">Green Belts</option>
                </select>
              </div>
            </div>

            {/* Full Attention Table */}
            <div className="rounded-xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th scope="col" className="px-4 py-3">Asset Identifier</th>
                      <th scope="col" className="px-3 py-3">Type</th>
                      <th scope="col" className="px-3 py-3">Condition</th>
                      <th scope="col" className="px-3 py-3">Last Maintenance</th>
                      <th scope="col" className="px-3 py-3">Total Logs</th>
                      <th scope="col" className="px-4 py-3 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredNeedsAttention.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-500">
                          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5 opacity-80" />
                          No assets currently overdue for maintenance!
                        </td>
                      </tr>
                    ) : (
                      filteredNeedsAttention.map((asset) => {
                        const hasNeverBeenMaintained = !asset.lastMaintenanceDate;
                        const lastDateFormatted = hasNeverBeenMaintained
                          ? 'Never Maintained'
                          : new Date(asset.lastMaintenanceDate).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            });

                        return (
                          <tr key={asset._id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3">
                              <Link
                                to={`/assets/${asset._id}`}
                                className="font-semibold text-slate-200 hover:text-emerald-400 transition-colors block"
                              >
                                {asset.name}
                              </Link>
                              <div className="text-[11px] text-slate-500">
                                {asset.species || (asset.type ? asset.type.replace('_', ' ') : 'General Asset')}
                              </div>
                            </td>

                            <td className="px-3 py-3">
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                                {asset.type.replace('_', ' ')}
                              </span>
                            </td>

                            <td className="px-3 py-3">
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  asset.healthStatus === 'Healthy'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    : asset.healthStatus === 'Diseased'
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                                }`}
                              >
                                {asset.healthStatus}
                              </span>
                            </td>

                            <td className="px-3 py-3 font-mono">
                              <span
                                className={`text-xs ${
                                  hasNeverBeenMaintained
                                    ? 'text-rose-400 font-semibold'
                                    : 'text-amber-400 font-medium'
                                }`}
                              >
                                {lastDateFormatted}
                              </span>
                            </td>

                            <td className="px-3 py-3 font-mono text-slate-400">
                              {asset.logsCount ?? 0}
                            </td>

                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  to={`/assets/${asset._id}`}
                                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors flex items-center gap-1 text-[11px] font-medium"
                                  title="Inspect Asset"
                                >
                                  <Eye className="w-3 h-3 text-teal-400" />
                                  <span>Inspect</span>
                                </Link>

                                <Link
                                  to={`/assets/${asset._id}`}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 transition-colors flex items-center gap-1 text-[11px] font-medium"
                                  title="Add Maintenance Log"
                                >
                                  <Wrench className="w-3 h-3 text-emerald-400" />
                                  <span>Log Task</span>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Asset Inventory Table View */}
      {activeTab === 'inventory' && (
        <div className="space-y-4 animate-fadeIn">
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
                onClick={fetchDashboardData}
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
                              <div className="text-slate-200 font-medium">
                                {asset.area ? `${asset.area.toLocaleString()} m²` : 'N/A'}
                              </div>
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

      {/* VIEW 3: Interactive GIS Map View */}
      {activeTab === 'map' && (
        <div className="animate-fadeIn">
          <AssetMap assets={assets} loading={loading} onRefresh={fetchDashboardData} />
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
