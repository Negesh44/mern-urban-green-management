const mongoose = require('mongoose');
const MaintenanceLog = require('../models/MaintenanceLog');
const Asset = require('../models/Asset');

// @desc    Get all maintenance logs for a specific asset
// @route   GET /api/maintenance/:assetId
// @access  Private (Authenticated users)
const getMaintenanceByAsset = async (req, res) => {
  try {
    const { assetId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assetId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid asset ID format',
      });
    }

    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({
        status: 'error',
        message: `Asset with ID ${assetId} not found`,
      });
    }

    const logs = await MaintenanceLog.find({ assetId })
      .sort({ date: -1 })
      .populate('assetId', 'name type species location');

    res.status(200).json({
      status: 'success',
      asset: {
        _id: asset._id,
        name: asset.name,
        type: asset.type,
      },
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    console.error('[getMaintenanceByAsset Error]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to retrieve maintenance logs',
    });
  }
};

// @desc    Create a maintenance log for an asset
// @route   POST /api/maintenance
// @access  Private (Admin only)
const createMaintenanceLog = async (req, res) => {
  try {
    const { assetId, action, performedBy, date, notes } = req.body;

    if (!assetId || !action || !performedBy) {
      return res.status(400).json({
        status: 'error',
        message: 'Fields "assetId", "action", and "performedBy" are required.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(assetId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid asset ID format for maintenance log.',
      });
    }

    // Verify asset exists
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({
        status: 'error',
        message: `Asset with ID ${assetId} does not exist. Cannot attach maintenance log.`,
      });
    }

    const newLog = await MaintenanceLog.create({
      assetId,
      action: action.trim(),
      performedBy: performedBy.trim(),
      date: date ? new Date(date) : new Date(),
      notes: notes ? notes.trim() : '',
    });

    const populatedLog = await MaintenanceLog.findById(newLog._id).populate(
      'assetId',
      'name type species'
    );

    res.status(201).json({
      status: 'success',
      message: 'Maintenance activity logged successfully',
      data: populatedLog,
    });
  } catch (error) {
    console.error('[createMaintenanceLog Error]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create maintenance log',
    });
  }
};

module.exports = {
  getMaintenanceByAsset,
  createMaintenanceLog,
};
