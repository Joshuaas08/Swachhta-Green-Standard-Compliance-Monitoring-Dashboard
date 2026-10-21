const Building = require('../models/Building');

// @desc    Get all buildings with optional search and campus filtering
// @route   GET /api/buildings
// @access  Private
exports.getBuildings = async (req, res, next) => {
  try {
    const { search, block, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { block: { $regex: search, $options: 'i' } },
      ];
    }
    if (block) query.block = block;
    if (status) query.status = status;

    const buildings = await Building.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: buildings.length,
      data: buildings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single building by ID
// @route   GET /api/buildings/:id
// @access  Private
exports.getBuilding = async (req, res, next) => {
  try {
    const building = await Building.findById(req.params.id);
    if (!building) {
      return res.status(404).json({ success: false, message: 'Building not found' });
    }
    res.status(200).json({ success: true, data: building });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new building
// @route   POST /api/buildings
// @access  Private (Admin)
exports.createBuilding = async (req, res, next) => {
  try {
    const { name, code, block, campus, totalFloors, squareFootage, zones, contactPerson, status } = req.body;

    const building = await Building.create({
      name,
      code: code ? code.toUpperCase() : undefined,
      block,
      campus,
      totalFloors,
      squareFootage,
      zones: zones || [],
      contactPerson,
      status,
    });

    res.status(201).json({ success: true, data: building });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a building
// @route   PUT /api/buildings/:id
// @access  Private (Admin)
exports.updateBuilding = async (req, res, next) => {
  try {
    const building = await Building.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!building) {
      return res.status(404).json({ success: false, message: 'Building not found' });
    }

    res.status(200).json({ success: true, data: building });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a building
// @route   DELETE /api/buildings/:id
// @access  Private (Admin)
exports.deleteBuilding = async (req, res, next) => {
  try {
    const building = await Building.findByIdAndDelete(req.params.id);
    if (!building) {
      return res.status(404).json({ success: false, message: 'Building not found' });
    }
    res.status(200).json({ success: true, message: 'Building deleted successfully' });
  } catch (error) {
    next(error);
  }
};
