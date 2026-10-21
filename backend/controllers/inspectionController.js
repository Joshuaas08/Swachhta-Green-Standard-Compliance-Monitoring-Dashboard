const Inspection = require('../models/Inspection');
const Building = require('../models/Building');
const Criteria = require('../models/Criteria');
const Issue = require('../models/Issue');
const { calculateComplianceScore } = require('../utils/complianceEngine');

// @desc    Get all inspections with filters
// @route   GET /api/inspections
// @access  Private
exports.getInspections = async (req, res, next) => {
  try {
    const { building, inspector, startDate, endDate, rating } = req.query;
    let query = {};

    if (building) query.building = building;
    if (inspector) query.inspector = inspector;
    if (rating) query.ratingKey = rating.toUpperCase();
    if (startDate || endDate) {
      query.inspectionDate = {};
      if (startDate) query.inspectionDate.$gte = new Date(startDate);
      if (endDate) query.inspectionDate.$lte = new Date(endDate);
    }

    const inspections = await Inspection.find(query)
      .populate('building', 'name code block campus')
      .populate('inspector', 'name email department')
      .sort({ inspectionDate: -1 });

    res.status(200).json({
      success: true,
      count: inspections.length,
      data: inspections,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single inspection by ID
// @route   GET /api/inspections/:id
// @access  Private
exports.getInspectionById = async (req, res, next) => {
  try {
    const inspection = await Inspection.findById(req.params.id)
      .populate('building', 'name code block campus totalFloors squareFootage contactPerson')
      .populate('inspector', 'name email department phone');

    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection record not found' });
    }

    // Find any issues that were generated from this inspection
    const generatedIssues = await Issue.find({ inspection: inspection._id });

    res.status(200).json({
      success: true,
      data: inspection,
      issues: generatedIssues,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create/Submit a new inspection & calculate dynamic compliance score
// @route   POST /api/inspections
// @access  Private (Inspector, Admin)
exports.createInspection = async (req, res, next) => {
  try {
    const { buildingId, zoneName, generalNotes, items, inspectionDate } = req.body;

    if (!buildingId) {
      return res.status(400).json({ success: false, message: 'Building ID is required' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Inspection items array is required' });
    }

    const building = await Building.findById(buildingId);
    if (!building) {
      return res.status(404).json({ success: false, message: 'Target building not found' });
    }

    // Fetch criteria records to guarantee correct title, category, and weights
    const criteriaIds = items.map((i) => i.criteriaId || i.criteria);
    const criteriaRecords = await Criteria.find({ _id: { $in: criteriaIds } });
    const criteriaMap = new Map(criteriaRecords.map((c) => [c._id.toString(), c]));

    const processedItems = items.map((item) => {
      const cId = (item.criteriaId || item.criteria || '').toString();
      const criteriaDoc = criteriaMap.get(cId);

      const title = item.criteriaTitle || (criteriaDoc ? criteriaDoc.title : 'Standard Item');
      const category = item.category || (criteriaDoc ? criteriaDoc.category : 'General');
      const weight = Number(item.weight) || (criteriaDoc ? criteriaDoc.weight : 3);
      const status = (item.status || 'PASS').toUpperCase();

      return {
        criteria: criteriaDoc ? criteriaDoc._id : cId,
        criteriaTitle: title,
        category,
        weight,
        status,
        remarks: item.remarks || '',
        photoUrl: item.photoUrl || '',
      };
    });

    // Run Compliance Engine Calculation
    const complianceResult = calculateComplianceScore(processedItems);

    const categoryBreakdownArray = Object.entries(complianceResult.categoryBreakdown).map(
      ([catName, stats]) => ({
        category: catName,
        totalWeight: stats.totalWeight,
        earnedPoints: stats.earnedPoints,
        score: stats.score,
        ratingLabel: stats.rating.label,
        ratingColor: stats.rating.color,
        passCount: stats.passCount,
        partialCount: stats.partialCount,
        failCount: stats.failCount,
      })
    );

    // Save Inspection
    const inspection = await Inspection.create({
      building: building._id,
      inspector: req.user._id,
      inspectionDate: inspectionDate ? new Date(inspectionDate) : new Date(),
      zoneName: zoneName || 'Full Facility',
      generalNotes: generalNotes || '',
      items: processedItems,
      totalWeight: complianceResult.totalWeight,
      earnedPoints: complianceResult.earnedPoints,
      totalScore: complianceResult.totalScore,
      ratingKey: complianceResult.rating.key,
      ratingLabel: complianceResult.rating.label,
      ratingColor: complianceResult.rating.color,
      ratingIcon: complianceResult.rating.icon,
      categoryBreakdown: categoryBreakdownArray,
      itemCounts: complianceResult.itemCounts,
      status: 'COMPLETED',
    });

    // Update Building compliance metrics
    building.lastComplianceScore = complianceResult.totalScore;
    building.lastInspectionDate = inspection.inspectionDate;
    await building.save();

    // Auto-create Issues for every FAIL item
    const failItems = processedItems.filter((item) => item.status === 'FAIL');
    const createdIssues = [];

    for (const failItem of failItems) {
      let priority = 'MEDIUM';
      if (failItem.weight >= 4) priority = 'CRITICAL';
      else if (failItem.weight === 3) priority = 'HIGH';
      else priority = 'LOW';

      const issue = await Issue.create({
        title: `Non-compliance: ${failItem.criteriaTitle}`,
        building: building._id,
        inspection: inspection._id,
        criteria: failItem.criteria,
        category: failItem.category,
        weight: failItem.weight,
        priority,
        status: 'OPEN',
        inspectorRemarks: failItem.remarks || 'Failed standard criteria check during audit.',
        evidencePhotoUrl: failItem.photoUrl || '',
        assignedToName: 'Maintenance Team',
        timeline: [
          {
            status: 'OPEN',
            updatedBy: `${req.user.name} (${req.user.role})`,
            timestamp: new Date(),
            note: 'Issue automatically generated from failed inspection check.',
          },
        ],
      });
      createdIssues.push(issue);
    }

    res.status(201).json({
      success: true,
      message: `Inspection recorded successfully with compliance score of ${complianceResult.totalScore}% (${complianceResult.rating.label}). ${createdIssues.length} issue(s) flagged for resolution.`,
      data: inspection,
      autoIssuesCreated: createdIssues.length,
      issues: createdIssues,
    });
  } catch (error) {
    next(error);
  }
};
