const Asset = require('../models/Asset');
const MaintenanceLog = require('../models/MaintenanceLog');
const Report = require('../models/Report');

// In-memory cache for dashboard KPIs (TTL: 30 seconds)
const dashboardCache = {
  data: null,
  timestamp: 0,
  ttl: 30 * 1000,
  get() {
    if (this.data && Date.now() - this.timestamp < this.ttl) {
      return this.data;
    }
    return null;
  },
  set(val) {
    this.data = val;
    this.timestamp = Date.now();
  },
  clear() {
    this.data = null;
    this.timestamp = 0;
  },
};

/**
 * @desc    Get aggregated dashboard KPIs, metrics, chart data & attention alerts
 * @route   GET /api/dashboard/summary
 * @access  Private (Admin only)
 */
exports.getDashboardSummary = async (req, res, next) => {
  try {
    const cached = dashboardCache.get();
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=45');
      return res.status(200).json(cached);
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Run ALL 7 database queries in PARALLEL for maximum throughput
    const [
      rawTypeCounts,
      rawHealthCounts,
      areaAggregation,
      pendingReportsCount,
      totalReportsCount,
      needsAttention,
      allTrees,
    ] = await Promise.all([
      // 1. Total assets by type
      Asset.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
          },
        },
      ]),

      // 2. Tree health distribution
      Asset.aggregate([
        { $match: { type: 'tree' } },
        {
          $group: {
            _id: '$healthStatus',
            count: { $sum: 1 },
          },
        },
      ]),

      // 3. Total Green Area
      Asset.aggregate([
        {
          $match: {
            type: { $in: ['park', 'urban_forest', 'green_belt'] },
          },
        },
        {
          $group: {
            _id: null,
            totalArea: { $sum: '$area' },
          },
        },
      ]),

      // 4. Pending citizen reports
      Report.countDocuments({ status: 'Pending' }),

      // 5. Total citizen reports
      Report.countDocuments(),

      // 6. Overdue / diseased attention items
      Asset.aggregate([
        {
          $lookup: {
            from: 'maintenancelogs',
            localField: '_id',
            foreignField: 'assetId',
            as: 'maintenanceHistory',
          },
        },
        {
          $addFields: {
            lastMaintenanceDate: { $max: '$maintenanceHistory.date' },
            logsCount: { $size: '$maintenanceHistory' },
          },
        },
        {
          $match: {
            $or: [
              { lastMaintenanceDate: null },
              { lastMaintenanceDate: { $exists: false } },
              { lastMaintenanceDate: { $lt: sixMonthsAgo } },
              { healthStatus: { $in: ['Diseased', 'Dead', 'Poor'] } },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            type: 1,
            species: 1,
            healthStatus: 1,
            location: 1,
            lastMaintenanceDate: 1,
            logsCount: 1,
            createdAt: 1,
          },
        },
        {
          $sort: {
            lastMaintenanceDate: 1,
            healthStatus: -1,
          },
        },
      ]),

      // 7. Tree survival cohort data
      Asset.find({ type: 'tree' }).select('plantingDate healthStatus createdAt').lean(),
    ]);

    const typeMap = {
      tree: { label: 'Trees', count: 0, fill: '#10b981' },
      park: { label: 'Parks', count: 0, fill: '#06b6d4' },
      urban_forest: { label: 'Urban Forests', count: 0, fill: '#3b82f6' },
      green_belt: { label: 'Green Belts', count: 0, fill: '#8b5cf6' },
    };

    rawTypeCounts.forEach((item) => {
      if (typeMap[item._id]) {
        typeMap[item._id].count = item.count;
      }
    });

    const assetsByType = Object.entries(typeMap).map(([key, val]) => ({
      type: key,
      name: val.label,
      count: val.count,
      fill: val.fill,
    }));

    const totalAssets = assetsByType.reduce((acc, curr) => acc + curr.count, 0);
    const totalTrees = typeMap.tree.count;
    const totalParksForestsBelts =
      typeMap.park.count + typeMap.urban_forest.count + typeMap.green_belt.count;

    const healthMap = {
      Healthy: { count: 0, color: '#10b981' },
      Diseased: { count: 0, color: '#f59e0b' },
      Dead: { count: 0, color: '#ef4444' },
    };

    rawHealthCounts.forEach((item) => {
      if (healthMap[item._id]) {
        healthMap[item._id].count = item.count;
      } else if (item._id === 'Excellent' || item._id === 'Good') {
        healthMap.Healthy.count += item.count;
      } else if (item._id === 'Fair') {
        healthMap.Diseased.count += item.count;
      } else if (item._id === 'Poor') {
        healthMap.Dead.count += item.count;
      }
    });

    const treeHealthDistribution = [
      { name: 'Healthy', value: healthMap.Healthy.count, color: healthMap.Healthy.color },
      { name: 'Diseased', value: healthMap.Diseased.count, color: healthMap.Diseased.color },
      { name: 'Dead', value: healthMap.Dead.count, color: healthMap.Dead.color },
    ];

    const totalGreenArea = areaAggregation.length > 0 ? areaAggregation[0].totalArea : 0;
    const totalGreenAreaHectares = parseFloat((totalGreenArea / 10000).toFixed(2));

    // Build timeline buckets
    const years = [2022, 2023, 2024, 2025, 2026];
    const treeSurvivalRateTrend = years.map((year) => {
      const yearEnd = new Date(`${year}-12-31T23:59:59Z`);
      const cohort = allTrees.filter((t) => {
        const pDate = t.plantingDate || t.createdAt;
        return pDate && new Date(pDate) <= yearEnd;
      });

      const totalCohort = cohort.length;
      if (totalCohort === 0) {
        return {
          period: `${year}`,
          totalTrees: 0,
          healthyTrees: 0,
          survivalRate: 100,
        };
      }

      const deadCohort = cohort.filter((t) => t.healthStatus === 'Dead').length;
      const aliveCohort = totalCohort - deadCohort;
      const rate = parseFloat(((aliveCohort / totalCohort) * 100).toFixed(1));

      return {
        period: `${year}`,
        totalTrees: totalCohort,
        healthyTrees: aliveCohort,
        survivalRate: rate,
      };
    });

    const resultPayload = {
      status: 'success',
      data: {
        summaryCards: {
          totalTrees,
          totalParksForestsBelts,
          totalGreenArea,
          totalGreenAreaHectares,
          pendingReportsCount,
          totalReportsCount,
          totalAssets,
        },
        assetsByType,
        treeHealthDistribution,
        treeSurvivalRateTrend,
        needsAttentionCount: needsAttention.length,
        needsAttention,
      },
    };

    dashboardCache.set(resultPayload);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=45');

    res.status(200).json(resultPayload);
  } catch (error) {
    next(error);
  }
};
