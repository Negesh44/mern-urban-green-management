const Asset = require('../models/Asset');
const MaintenanceLog = require('../models/MaintenanceLog');
const Report = require('../models/Report');

/**
 * @desc    Get aggregated dashboard KPIs, metrics, chart data & attention alerts
 * @route   GET /api/dashboard/summary
 * @access  Private (Admin only)
 */
exports.getDashboardSummary = async (req, res, next) => {
  try {
    // 1. Total assets by type
    const rawTypeCounts = await Asset.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
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

    // 2. Tree health distribution (Healthy, Diseased, Dead)
    const rawHealthCounts = await Asset.aggregate([
      { $match: { type: 'tree' } },
      {
        $group: {
          _id: '$healthStatus',
          count: { $sum: 1 },
        },
      },
    ]);

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

    // 3. Total Green Area (sum of area field across parks, urban forests, green belts)
    const areaAggregation = await Asset.aggregate([
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
    ]);

    const totalGreenArea = areaAggregation.length > 0 ? areaAggregation[0].totalArea : 0;
    const totalGreenAreaHectares = parseFloat((totalGreenArea / 10000).toFixed(2));

    // 4. Pending citizen reports count
    const pendingReportsCount = await Report.countDocuments({ status: 'Pending' });
    const totalReportsCount = await Report.countDocuments();

    // 5. Assets with no maintenance log in the last 6 months (Needs Attention)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const needsAttention = await Asset.aggregate([
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
    ]);

    // 6. Tree survival rate trend over time (cohorts derived from planting dates and health status)
    const allTrees = await Asset.find({ type: 'tree' }).select('plantingDate healthStatus createdAt');

    // Build timeline buckets
    const years = [2022, 2023, 2024, 2025, 2026];
    const treeSurvivalRateTrend = years.map((year) => {
      const yearEnd = new Date(`${year}-12-31T23:59:59Z`);
      
      // Trees planted on or before this year end
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

    res.status(200).json({
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
    });
  } catch (error) {
    next(error);
  }
};
