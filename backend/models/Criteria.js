const mongoose = require('mongoose');

const CriteriaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide criteria title'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide category'],
      enum: [
        'Cleanliness',
        'Waste Segregation',
        'Water Conservation',
        'Energy Efficiency',
        'Air Quality',
      ],
      default: 'Cleanliness',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 3,
    },
    guidance: {
      type: String,
      default: '',
      trim: true,
    },
    standardReference: {
      type: String,
      default: 'Swachh Bharat / Green Building Code',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Criteria', CriteriaSchema);
