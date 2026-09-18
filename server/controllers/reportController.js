const mongoose = require('mongoose');
const Report = require('../models/Report');
const Asset = require('../models/Asset');
const MaintenanceLog = require('../models/MaintenanceLog');

// Helper to parse location coordinates
const parseCoordinates = (body) => {
  if (body.location) {
    if (typeof body.location === 'object' && body.location.lat !== undefined && body.location.lng !== undefined) {
      return { lat: Number(body.location.lat), lng: Number(body.location.lng) };
    }
    if (typeof body.location === 'string') {
      try {
        const parsed = JSON.parse(body.location);
        if (parsed.lat !== undefined && parsed.lng !== undefined) {
          return { lat: Number(parsed.lat), lng: Number(parsed.lng) };
        }
      } catch (e) {}
    }
  }

  if (body.lat !== undefined && body.lng !== undefined) {
    return { lat: Number(body.lat), lng: Number(body.lng) };
  }

  return null;
};

// @desc    Submit a new citizen hazard report
// @route   POST /api/reports
// @access  Private (Authenticated users / Citizen)
const createReport = async (req, res) => {
  try {
    const { description, assetId } = req.body;
    const citizenId = req.user._id;

    if (!description || !description.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Report description is required.',
      });
    }

    const location = parseCoordinates(req.body);
    if (!location || isNaN(location.lat) || isNaN(location.lng)) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid location coordinates (lat, lng) are required.',
      });
    }

    // Photo from Multer or fallback URL
    let photo = null;
    if (req.file) {
      photo = `/uploads/reports/${req.file.filename}`;
    } else if (req.body.photo) {
      photo = req.body.photo;
    }

    // Verify optional asset reference if provided
    let validAssetId = null;
    if (assetId && assetId !== 'null' && assetId !== '') {
      if (mongoose.Types.ObjectId.isValid(assetId)) {
        const assetExists = await Asset.findById(assetId);
        if (assetExists) {
          validAssetId = assetId;
        }
      }
    }

    const newReport = await Report.create({
      citizenId,
      assetId: validAssetId,
      description: description.trim(),
      photo,
      location,
      status: 'Pending',
    });

    const populatedReport = await Report.findById(newReport._id)
      .populate('citizenId', 'name email')
      .populate('assetId', 'name type species location');

    res.status(201).json({
      status: 'success',
      message: 'Hazard report registered successfully. Municipal crew alerted.',
      data: populatedReport,
    });
  } catch (error) {
    console.error('[createReport Error]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to submit report.',
    });
  }
};

// @desc    Get reports (Admin: all reports; Citizen: only their own)
// @route   GET /api/reports
// @access  Private
const getReports = async (req, res) => {
  try {
    const filter = {};

    // Citizen can only view their own submitted reports
    if (req.user.role === 'citizen') {
      filter.citizenId = req.user._id;
    }

    // Optional status query filter
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .populate('citizenId', 'name email')
      .populate('assetId', 'name type species location healthStatus');

    res.status(200).json({
      status: 'success',
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error('[getReports Error]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to retrieve reports.',
    });
  }
};

// @desc    Update report status
// @route   PUT /api/reports/:id
// @access  Private (Admin only)
const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid report ID format.',
      });
    }

    const allowedStatuses = ['Pending', 'In Progress', 'Resolved'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid status. Allowed values: [${allowedStatuses.join(', ')}]`,
      });
    }

    const updatedReport = await Report.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('citizenId', 'name email')
      .populate('assetId', 'name type species location');

    if (!updatedReport) {
      return res.status(404).json({
        status: 'error',
        message: `Report with ID ${id} not found.`,
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Report status updated to '${status}'`,
      data: updatedReport,
    });
  } catch (error) {
    console.error('[updateReportStatus Error]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update report status.',
    });
  }
};

// @desc    Convert citizen report into a MaintenanceLog entry
// @route   POST /api/reports/:id/convert
// @access  Private (Admin only)
const convertReportToMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { assetId, action, performedBy, date, notes, reportStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid report ID format.',
      });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        status: 'error',
        message: `Report with ID ${id} not found.`,
      });
    }

    // Determine target asset
    const targetAssetId = assetId || report.assetId;
    if (!targetAssetId || !mongoose.Types.ObjectId.isValid(targetAssetId)) {
      return res.status(400).json({
        status: 'error',
        message: 'A valid green asset must be selected to link the maintenance task.',
      });
    }

    const targetAsset = await Asset.findById(targetAssetId);
    if (!targetAsset) {
      return res.status(404).json({
        status: 'error',
        message: `Target asset with ID ${targetAssetId} not found.`,
      });
    }

    // Create Maintenance Log
    const newLog = await MaintenanceLog.create({
      assetId: targetAssetId,
      action: action || `Hazard Remediation: ${report.description.substring(0, 80)}`,
      performedBy: performedBy || 'Emergency Arborist Response Crew',
      date: date ? new Date(date) : new Date(),
      notes: notes || `Converted from Citizen Report #${id}. Details: ${report.description}`,
    });

    // Update Report status and link asset if missing
    const newStatus = reportStatus || 'In Progress';
    report.status = newStatus;
    if (!report.assetId) {
      report.assetId = targetAssetId;
    }
    await report.save();

    const populatedReport = await Report.findById(id)
      .populate('citizenId', 'name email')
      .populate('assetId', 'name type species location');

    const populatedLog = await MaintenanceLog.findById(newLog._id).populate(
      'assetId',
      'name type species'
    );

    res.status(201).json({
      status: 'success',
      message: `Report converted to maintenance task and status updated to '${newStatus}'`,
      maintenanceLog: populatedLog,
      report: populatedReport,
    });
  } catch (error) {
    console.error('[convertReportToMaintenance Error]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to convert report to maintenance task.',
    });
  }
};

module.exports = {
  createReport,
  getReports,
  updateReportStatus,
  convertReportToMaintenance,
};
