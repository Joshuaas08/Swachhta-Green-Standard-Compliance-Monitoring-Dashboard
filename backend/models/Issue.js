const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    building: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Building',
      required: true,
    },
    inspection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inspection',
      required: true,
    },
    criteria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Criteria',
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    weight: {
      type: Number,
      default: 3,
    },
    priority: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'HIGH',
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
    },
    inspectorRemarks: {
      type: String,
      default: '',
    },
    evidencePhotoUrl: {
      type: String,
      default: '',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedToName: {
      type: String,
      default: 'Maintenance Team',
    },
    resolutionRemarks: {
      type: String,
      default: '',
    },
    resolutionPhotoUrl: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    timeline: [
      {
        status: { type: String, required: true },
        updatedBy: { type: String, default: 'System' },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Issue', IssueSchema);
