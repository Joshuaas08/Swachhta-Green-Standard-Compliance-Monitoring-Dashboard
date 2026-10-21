const mongoose = require('mongoose');

const ZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['RESTROOM', 'CAFETERIA', 'CORRIDOR', 'OFFICE', 'LABORATORY', 'WASTE_YARD', 'SOLAR_ROOFTOP', 'GARDEN', 'COMMON_AREA', 'OTHER'],
    default: 'COMMON_AREA',
  },
  floor: {
    type: String,
    default: 'Ground',
  },
  description: {
    type: String,
    default: '',
  },
});

const BuildingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide building name'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Please provide a unique building code'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    block: {
      type: String,
      required: [true, 'Please specify block or wing'],
      trim: true,
    },
    campus: {
      type: String,
      default: 'Main Campus',
      trim: true,
    },
    totalFloors: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    squareFootage: {
      type: Number,
      required: [true, 'Please provide total square footage'],
      min: 100,
    },
    zones: [ZoneSchema],
    contactPerson: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'UNDER_MAINTENANCE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    lastComplianceScore: {
      type: Number,
      default: null,
    },
    lastInspectionDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Building', BuildingSchema);
