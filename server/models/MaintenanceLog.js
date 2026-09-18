const mongoose = require('mongoose');

const maintenanceLogSchema = new mongoose.Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset reference is required for maintenance log'],
    },
    date: {
      type: Date,
      default: Date.now,
      required: [true, 'Maintenance date is required'],
    },
    action: {
      type: String,
      required: [true, 'Maintenance action is required'],
      trim: true,
    },
    performedBy: {
      type: String,
      required: [true, 'Personnel/Team name is required'],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
maintenanceLogSchema.index({ assetId: 1, date: -1 });

module.exports = mongoose.model('MaintenanceLog', maintenanceLogSchema);
