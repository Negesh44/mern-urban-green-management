const mongoose = require('mongoose');
const Asset = require('../models/Asset');
const MaintenanceLog = require('../models/MaintenanceLog');
const Report = require('../models/Report');
const User = require('../models/User');
const connectDB = require('../config/db');

async function verify() {
  await connectDB();

  console.log('\n--- 1. Assets Breakdown by Type ---');
  const typeCounts = await Asset.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 }, avgArea: { $avg: '$area' } } }
  ]);
  console.table(typeCounts);

  console.log('\n--- 2. Tree Health Status Distribution ---');
  const healthCounts = await Asset.aggregate([
    { $match: { type: 'tree' } },
    { $group: { _id: '$healthStatus', count: { $sum: 1 } } }
  ]);
  console.table(healthCounts);

  console.log('\n--- 3. Verified Maintenance Logs ---');
  const logs = await MaintenanceLog.find().populate('assetId', 'name type');
  logs.forEach((l) =>
    console.log(
      `• [${l.date.toISOString().split('T')[0]}] ${l.action} -> ${l.assetId?.name} (${l.performedBy})`
    )
  );

  console.log('\n--- 4. Verified Citizen Reports ---');
  const reports = await Report.find()
    .populate('citizenId', 'name email')
    .populate('assetId', 'name type');
  reports.forEach((r) =>
    console.log(
      `• [${r.status}] ${r.description.substring(0, 48)}... | Asset: ${
        r.assetId ? r.assetId.name : 'General Location'
      } | Citizen: ${r.citizenId?.name}`
    )
  );

  process.exit(0);
}

verify();
