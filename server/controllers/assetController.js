const mongoose = require('mongoose');
const Asset = require('../models/Asset');
const MaintenanceLog = require('../models/MaintenanceLog');

// Helper to parse location from various input formats (JSON, multipart, lat/lng fields)
const parseLocation = (body) => {
  if (body.location) {
    if (typeof body.location === 'object' && body.location.lat !== undefined && body.location.lng !== undefined) {
      return {
        lat: Number(body.location.lat),
        lng: Number(body.location.lng),
      };
    }
    if (typeof body.location === 'string') {
      try {
        const parsed = JSON.parse(body.location);
        if (parsed.lat !== undefined && parsed.lng !== undefined) {
          return { lat: Number(parsed.lat), lng: Number(parsed.lng) };
        }
      } catch (e) {
        // Continue to fallback
      }
    }
  }

  if (body.lat !== undefined && body.lng !== undefined) {
    return {
      lat: Number(body.lat),
      lng: Number(body.lng),
    };
  }

  return null;
};

// @desc    Get all assets with optional filtering
// @route   GET /api/assets
// @access  Private (Authenticated users)
const getAllAssets = async (req, res) => {
  try {
    const { type, healthStatus, search, sort = '-createdAt' } = req.query;

    const filter = {};

    if (type) {
      const allowedTypes = ['tree', 'park', 'urban_forest', 'green_belt'];
      if (!allowedTypes.includes(type.toLowerCase())) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid asset type '${type}'. Allowed values: ${allowedTypes.join(', ')}`,
        });
      }
      filter.type = type.toLowerCase();
    }

    if (healthStatus) {
      filter.healthStatus = { $regex: new RegExp(`^${healthStatus.trim()}$`, 'i') };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { species: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const assets = await Asset.find(filter).sort(sort);

    res.status(200).json({
      status: 'success',
      count: assets.length,
      data: assets,
    });
  } catch (error) {
    console.error('[getAllAssets Error]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to retrieve assets',
    });
  }
};

// @desc    Get single asset by ID with maintenance history
// @route   GET /api/assets/:id
// @access  Private (Authenticated users)
const getAssetById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid asset ID format',
      });
    }

    const asset = await Asset.findById(id);
    if (!asset) {
      return res.status(404).json({
        status: 'error',
        message: `Asset with ID ${id} not found`,
      });
    }

    // Retrieve maintenance logs for this asset
    const maintenanceLogs = await MaintenanceLog.find({ assetId: id }).sort({ date: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        ...asset.toObject(),
        maintenanceHistory: maintenanceLogs,
        maintenanceCount: maintenanceLogs.length,
      },
    });
  } catch (error) {
    console.error('[getAssetById Error]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to retrieve asset details',
    });
  }
};

// @desc    Create a new green asset
// @route   POST /api/assets
// @access  Private (Admin only)
const createAsset = async (req, res) => {
  try {
    const { type, name, species, age, healthStatus, area, description, plantingDate } = req.body;

    // Validation
    if (!type || !name) {
      return res.status(400).json({
        status: 'error',
        message: 'Asset "type" and "name" are mandatory fields.',
      });
    }

    const validTypes = ['tree', 'park', 'urban_forest', 'green_belt'];
    if (!validTypes.includes(type.toLowerCase())) {
      return res.status(400).json({
        status: 'error',
        message: `Unsupported asset type '${type}'. Must be one of [${validTypes.join(', ')}].`,
      });
    }

    const location = parseLocation(req.body);
    if (!location || isNaN(location.lat) || isNaN(location.lng)) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid geographical coordinates (location.lat, location.lng) are required.',
      });
    }

    // Handle images uploaded via Multer
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/uploads/assets/${file.filename}`);
    } else if (req.body.images) {
      images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    const assetData = {
      type: type.toLowerCase(),
      name: name.trim(),
      location,
      images,
      description: description ? description.trim() : '',
      healthStatus: healthStatus || 'Healthy',
    };

    if (assetData.type === 'tree') {
      if (species) assetData.species = species.trim();
      if (age !== undefined && age !== '') assetData.age = Number(age);
      if (plantingDate) assetData.plantingDate = new Date(plantingDate);
    } else {
      if (area !== undefined && area !== '') assetData.area = Number(area);
    }

    const newAsset = await Asset.create(assetData);

    res.status(201).json({
      status: 'success',
      message: 'Green asset created successfully',
      data: newAsset,
    });
  } catch (error) {
    console.error('[createAsset Error]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create asset',
    });
  }
};

// @desc    Update an existing asset
// @route   PUT /api/assets/:id
// @access  Private (Admin only)
const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid asset ID format',
      });
    }

    const asset = await Asset.findById(id);
    if (!asset) {
      return res.status(404).json({
        status: 'error',
        message: `Asset with ID ${id} not found`,
      });
    }

    // Process field updates
    const updates = { ...req.body };

    if (updates.type) updates.type = updates.type.toLowerCase();

    // Check location if updated
    const location = parseLocation(req.body);
    if (location && !isNaN(location.lat) && !isNaN(location.lng)) {
      updates.location = location;
    }

    // Process new images if uploaded via Multer
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/assets/${file.filename}`);
      updates.images = [...(asset.images || []), ...newImages];
    }

    // Convert numbers
    if (updates.age !== undefined && updates.age !== '') updates.age = Number(updates.age);
    if (updates.area !== undefined && updates.area !== '') updates.area = Number(updates.area);

    const updatedAsset = await Asset.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      message: 'Asset updated successfully',
      data: updatedAsset,
    });
  } catch (error) {
    console.error('[updateAsset Error]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update asset',
    });
  }
};

// @desc    Delete an asset and its maintenance records
// @route   DELETE /api/assets/:id
// @access  Private (Admin only)
const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid asset ID format',
      });
    }

    const asset = await Asset.findById(id);
    if (!asset) {
      return res.status(404).json({
        status: 'error',
        message: `Asset with ID ${id} not found`,
      });
    }

    // Delete asset and cascade delete maintenance logs
    await Asset.findByIdAndDelete(id);
    const deleteLogsResult = await MaintenanceLog.deleteMany({ assetId: id });

    res.status(200).json({
      status: 'success',
      message: `Asset '${asset.name}' and ${deleteLogsResult.deletedCount} associated maintenance logs deleted successfully.`,
      deletedAssetId: id,
    });
  } catch (error) {
    console.error('[deleteAsset Error]', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to delete asset',
    });
  }
};

module.exports = {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
};
