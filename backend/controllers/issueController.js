const Issue = require('../models/Issue');

// @desc    Get all issues with filters
// @route   GET /api/issues
// @access  Private
exports.getIssues = async (req, res, next) => {
  try {
    const { status, priority, building, category } = req.query;
    let query = {};

    if (status) query.status = status.toUpperCase();
    if (priority) query.priority = priority.toUpperCase();
    if (building) query.building = building;
    if (category) query.category = category;

    const issues = await Issue.find(query)
      .populate('building', 'name code block campus')
      .populate('inspection', 'inspectionDate totalScore')
      .populate('criteria', 'title category weight')
      .populate('assignedTo', 'name email department phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single issue by ID
// @route   GET /api/issues/:id
// @access  Private
exports.getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('building', 'name code block campus totalFloors contactPerson')
      .populate('inspection', 'inspectionDate totalScore inspector')
      .populate('criteria', 'title category weight guidance standardReference')
      .populate('assignedTo', 'name email department phone');

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    res.status(200).json({ success: true, data: issue });
  } catch (error) {
    next(error);
  }
};

// @desc    Update issue workflow status (OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED)
// @route   PATCH /api/issues/:id/status
// @access  Private (Maintenance, Admin)
exports.updateIssueStatus = async (req, res, next) => {
  try {
    const { status, note, assignedTo, assignedToName, resolutionRemarks, resolutionPhotoUrl } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const previousStatus = issue.status;
    if (status) issue.status = status;
    if (assignedTo !== undefined) issue.assignedTo = assignedTo;
    if (assignedToName) issue.assignedToName = assignedToName;
    if (resolutionRemarks) issue.resolutionRemarks = resolutionRemarks;
    if (resolutionPhotoUrl) issue.resolutionPhotoUrl = resolutionPhotoUrl;

    if (status === 'RESOLVED' && !issue.resolvedAt) {
      issue.resolvedAt = new Date();
    }
    if (status === 'CLOSED' && !issue.closedAt) {
      issue.closedAt = new Date();
    }

    issue.timeline.push({
      status: status || previousStatus,
      updatedBy: `${req.user.name} (${req.user.role})`,
      timestamp: new Date(),
      note: note || `Status transitioned from ${previousStatus} to ${status || previousStatus}`,
    });

    await issue.save();

    res.status(200).json({
      success: true,
      message: `Issue updated successfully to ${issue.status}`,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve issue with remarks and proof
// @route   PATCH /api/issues/:id/resolve
// @access  Private (Maintenance, Admin)
exports.resolveIssue = async (req, res, next) => {
  try {
    const { resolutionRemarks, resolutionPhotoUrl, note } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    issue.status = 'RESOLVED';
    issue.resolutionRemarks = resolutionRemarks || 'Corrective action taken and verified.';
    if (resolutionPhotoUrl) issue.resolutionPhotoUrl = resolutionPhotoUrl;
    issue.resolvedAt = new Date();

    issue.timeline.push({
      status: 'RESOLVED',
      updatedBy: `${req.user.name} (${req.user.role})`,
      timestamp: new Date(),
      note: note || resolutionRemarks || 'Corrective action completed.',
    });

    await issue.save();

    res.status(200).json({
      success: true,
      message: 'Issue marked as RESOLVED',
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};
