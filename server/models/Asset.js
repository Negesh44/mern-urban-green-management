const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Asset type is required'],
      enum: {
        values: ['tree', 'park', 'urban_forest', 'green_belt'],
        message: '{VALUE} is not a supported asset type',
      },
    },
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
    },
    species: {
      type: String,
      trim: true,
      // Only relevant for trees
    },
    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
      // Only relevant for trees
    },
    healthStatus: {
      type: String,
      enum: {
        values: ['Healthy', 'Diseased', 'Dead', 'Excellent', 'Good', 'Fair', 'Poor'],
        message: '{VALUE} is not a valid health status or condition',
      },
      default: 'Healthy',
    },
    location: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required'],
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required'],
      },
    },
    area: {
      type: Number,
      min: [0, 'Area cannot be negative'],
      // In square meters for parks, urban forests, and green belts
    },
    images: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      trim: true,
    },
    plantingDate: {
      type: Date,
      // Only relevant for trees
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high performance spatial & category filtering
assetSchema.index({ type: 1 });
assetSchema.index({ healthStatus: 1 });
assetSchema.index({ 'location.lat': 1, 'location.lng': 1 });

module.exports = mongoose.model('Asset', assetSchema);
