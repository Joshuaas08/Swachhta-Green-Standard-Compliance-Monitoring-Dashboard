const mongoose = require('mongoose');

const InspectionItemSchema = new mongoose.Schema({
  criteria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Criteria',
    required: true,
  },
  criteriaTitle: { type: String, required: true },
  category: { type: String, required: true },
  weight: { type: Number, required: true, min: 1, max: 5 },
  status: {
    type: String,
    enum: ['PASS', 'PARTIAL', 'FAIL'],
    required: true,
    default: 'PASS',
  },
  remarks: {
    type: String,
    default: '',
    trim: true,
  },
  photoUrl: {
    type: String,
    default: '',
  },
});

const CategoryScoreSchema = new mongoose.Schema({
  category: { type: String, required: true },
  totalWeight: { type: Number, required: true },
  earnedPoints: { type: Number, required: true },
  score: { type: Number, required: true },
  ratingLabel: { type: String, required: true },
  ratingColor: { type: String, required: true },
  passCount: { type: Number, default: 0 },
  partialCount: { type: Number, default: 0 },
  failCount: { type: Number, default: 0 },
});

const InspectionSchema = new mongoose.Schema(
  {
    building: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Building',
      required: [true, 'Please select a building'],
    },
    inspector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please associate an inspector'],
    },
    inspectionDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    zoneName: {
      type: String,
      default: 'Full Facility',
    },
    generalNotes: {
      type: String,
      default: '',
    },
    items: [InspectionItemSchema],
    totalWeight: {
      type: Number,
      required: true,
    },
    earnedPoints: {
      type: Number,
      required: true,
    },
    totalScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    ratingKey: {
      type: String,
      enum: ['EXCELLENT', 'GOOD', 'NEEDS_IMPROVEMENT', 'POOR'],
      required: true,
    },
    ratingLabel: {
      type: String,
      required: true,
    },
    ratingColor: {
      type: String,
      required: true,
    },
    ratingIcon: {
      type: String,
      default: '🟢',
    },
    categoryBreakdown: [CategoryScoreSchema],
    itemCounts: {
      pass: { type: Number, default: 0 },
      partial: { type: Number, default: 0 },
      fail: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['DRAFT', 'COMPLETED', 'UNDER_REVIEW'],
      default: 'COMPLETED',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Inspection', InspectionSchema);
