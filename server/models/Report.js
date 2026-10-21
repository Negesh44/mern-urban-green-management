const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Citizen reference is required for reporting'],
    },
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      default: null,
    },
    description: {
      type: String,
      required: [true, 'Report description is required'],
      trim: true,
    },
    photo: {
      type: String,
      trim: true,
      default: null,
    },
    location: {
      lat: {
        type: Number,
        required: [true, 'Report latitude is required'],
      },
      lng: {
        type: Number,
        required: [true, 'Report longitude is required'],
      },
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'In Progress', 'Resolved'],
        message: '{VALUE} is not a valid report status',
      },
      default: 'Pending',
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

// Indexes
reportSchema.index({ citizenId: 1 });
reportSchema.index({ assetId: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
