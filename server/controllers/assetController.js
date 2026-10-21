const mongoose = require('mongoose');
const Asset = require('../models/Asset');
const MaintenanceLog = require('../models/MaintenanceLog');

// High-speed In-Memory Cache (TTL: 30 seconds) for ultra-fast query responses
const assetCache = {
  data: null,
  timestamp: 0,
  ttl: 30 * 1000,
  clear() {
    this.data = null;
    this.timestamp = 0;
  },
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
};

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

// @desc    Get all assets with optional filtering (Ultra-optimized)
// @route   GET /api/assets
// @access  Public / Authenticated
const getAllAssets = async (req, res) => {
  try {
    const { type, healthStatus, search, sort = '-createdAt' } = req.query;

    const hasFilters = Boolean(type || healthStatus || search || sort !== '-createdAt');

    // Return instant memory cache if no custom search filter is applied
    if (!hasFilters) {
      const cached = assetCache.get();
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=45');
        return res.status(200).json(cached);
      }
    }

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

    // High performance query using .lean() to bypass Mongoose document hydration
    const assets = await Asset.find(filter).sort(sort).lean();

    const responsePayload = {
      status: 'success',
      count: assets.length,
      data: assets,
    };

    if (!hasFilters) {
      assetCache.set(responsePayload);
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=45');
    }

    res.status(200).json(responsePayload);
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
// @access  Public / Authenticated
const getAssetById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid asset ID format',
      });
    }

    const [asset, maintenanceLogs] = await Promise.all([
      Asset.findById(id).lean(),
      MaintenanceLog.find({ assetId: id }).sort({ date: -1 }).lean(),
    ]);

    if (!asset) {
      return res.status(404).json({
        status: 'error',
        message: `Asset with ID ${id} not found`,
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        ...asset,
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

// @desc    Create a new asset (tree, park, urban forest, green belt)
// @route   POST /api/assets
// @access  Private (Admin only)
const createAsset = async (req, res) => {
  try {
    const { type, name, species, age, healthStatus, area, description, plantingDate } = req.body;

    if (!type || !name) {
      return res.status(400).json({
        status: 'error',
        message: 'Asset type and name are required.',
      });
    }

    const location = parseLocation(req.body);
    if (!location || isNaN(location.lat) || isNaN(location.lng)) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid coordinates (lat, lng) are required for green assets.',
      });
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/uploads/assets/${file.filename}`);
    } else if (req.body.images) {
      if (Array.isArray(req.body.images)) {
        images = req.body.images;
      } else if (typeof req.body.images === 'string') {
        try {
          const parsed = JSON.parse(req.body.images);
          images = Array.isArray(parsed) ? parsed : [req.body.images];
        } catch (e) {
          images = [req.body.images];
        }
      }
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

    // Invalidate cache immediately on new asset creation
    assetCache.clear();

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

    const { type, name, species, age, healthStatus, area, description, plantingDate } = req.body;

    if (type) asset.type = type.toLowerCase();
    if (name) asset.name = name.trim();
    if (description !== undefined) asset.description = description.trim();
    if (healthStatus) asset.healthStatus = healthStatus;

    if (asset.type === 'tree') {
      if (species !== undefined) asset.species = species.trim();
      if (age !== undefined) asset.age = age === '' ? undefined : Number(age);
      if (plantingDate) asset.plantingDate = new Date(plantingDate);
    } else {
      if (area !== undefined) asset.area = area === '' ? undefined : Number(area);
    }

    const newLocation = parseLocation(req.body);
    if (newLocation && !isNaN(newLocation.lat) && !isNaN(newLocation.lng)) {
      asset.location = newLocation;
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/assets/${file.filename}`);
      asset.images = [...(asset.images || []), ...newImages];
    }

    const updatedAsset = await asset.save();

    // Invalidate cache immediately
    assetCache.clear();

    res.status(200).json({
      status: 'success',
      message: 'Green asset updated successfully',
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

    // Invalidate cache immediately
    assetCache.clear();

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
