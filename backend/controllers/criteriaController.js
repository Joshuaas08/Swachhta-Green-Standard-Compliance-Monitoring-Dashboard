const Criteria = require('../models/Criteria');

// @desc    Get all criteria, optionally filtered by category
// @route   GET /api/criteria
// @access  Private
exports.getCriteria = async (req, res, next) => {
  try {
    const { category, activeOnly } = req.query;
    let query = {};

    if (category) query.category = category;
    if (activeOnly === 'true') query.isActive = true;

    const criteria = await Criteria.find(query).sort({ category: 1, weight: -1, title: 1 });

    res.status(200).json({
      success: true,
      count: criteria.length,
      data: criteria,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single criteria
// @route   GET /api/criteria/:id
// @access  Private
exports.getCriteriaById = async (req, res, next) => {
  try {
    const criteria = await Criteria.findById(req.params.id);
    if (!criteria) {
      return res.status(404).json({ success: false, message: 'Criteria not found' });
    }
    res.status(200).json({ success: true, data: criteria });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new criteria
// @route   POST /api/criteria
// @access  Private (Admin)
exports.createCriteria = async (req, res, next) => {
  try {
    const { title, category, description, weight, guidance, standardReference, isActive } = req.body;

    const criteria = await Criteria.create({
      title,
      category,
      description,
      weight: Number(weight) || 3,
      guidance,
      standardReference,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({ success: true, data: criteria });
  } catch (error) {
    next(error);
  }
};

// @desc    Update criteria
// @route   PUT /api/criteria/:id
// @access  Private (Admin)
exports.updateCriteria = async (req, res, next) => {
  try {
    const criteria = await Criteria.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!criteria) {
      return res.status(404).json({ success: false, message: 'Criteria not found' });
    }

    res.status(200).json({ success: true, data: criteria });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete criteria
// @route   DELETE /api/criteria/:id
// @access  Private (Admin)
exports.deleteCriteria = async (req, res, next) => {
  try {
    const criteria = await Criteria.findByIdAndDelete(req.params.id);
    if (!criteria) {
      return res.status(404).json({ success: false, message: 'Criteria not found' });
    }
    res.status(200).json({ success: true, message: 'Criteria deleted successfully' });
  } catch (error) {
    next(error);
  }
};
