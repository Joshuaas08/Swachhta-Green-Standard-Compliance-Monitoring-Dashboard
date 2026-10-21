const Inspection = require('../models/Inspection');
const Building = require('../models/Building');
const Issue = require('../models/Issue');
const { classifyScore } = require('../utils/complianceEngine');

// @desc    Get executive overview metrics
// @route   GET /api/analytics/overview
// @access  Private
exports.getOverview = async (req, res, next) => {
  try {
    const totalBuildings = await Building.countDocuments();
    const totalInspections = await Inspection.countDocuments();
    const totalIssues = await Issue.countDocuments();
    const openIssues = await Issue.countDocuments({ status: { $in: ['OPEN', 'IN_PROGRESS'] } });
    const resolvedIssues = await Issue.countDocuments({ status: { $in: ['RESOLVED', 'CLOSED'] } });

    // Calculate institutional average score across all inspections
    const avgScoreAgg = await Inspection.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$totalScore' },
          minScore: { $min: '$totalScore' },
          maxScore: { $max: '$totalScore' },
        },
      },
    ]);

    const averageComplianceScore =
      avgScoreAgg.length > 0 ? Math.round(avgScoreAgg[0].avgScore * 10) / 10 : 0;
    const overallRating = classifyScore(averageComplianceScore);

    // Distribution by rating tier
    const ratingDistribution = await Inspection.aggregate([
      {
        $group: {
          _id: '$ratingKey',
          count: { $sum: 1 },
        },
      },
    ]);

    // Issues by priority
    const issuesByPriority = await Issue.aggregate([
      {
        $match: { status: { $in: ['OPEN', 'IN_PROGRESS'] } },
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    // Recent inspections
    const recentInspections = await Inspection.find()
      .populate('building', 'name code block')
      .populate('inspector', 'name')
      .sort({ inspectionDate: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalBuildings,
        totalInspections,
        totalIssues,
        openIssues,
        resolvedIssues,
        averageComplianceScore,
        overallRating,
        ratingDistribution: ratingDistribution.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        issuesByPriority: issuesByPriority.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        recentInspections,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category-wise comparison scores
// @route   GET /api/analytics/category-comparison
// @access  Private
exports.getCategoryComparison = async (req, res, next) => {
  try {
    const inspections = await Inspection.find().select('categoryBreakdown');

    const categoryStats = {
      'Cleanliness': { totalScore: 0, count: 0 },
      'Waste Segregation': { totalScore: 0, count: 0 },
      'Water Conservation': { totalScore: 0, count: 0 },
      'Energy Efficiency': { totalScore: 0, count: 0 },
      'Air Quality': { totalScore: 0, count: 0 },
    };

    inspections.forEach((insp) => {
      insp.categoryBreakdown.forEach((cat) => {
        if (categoryStats[cat.category]) {
          categoryStats[cat.category].totalScore += cat.score;
          categoryStats[cat.category].count += 1;
        } else {
          categoryStats[cat.category] = { totalScore: cat.score, count: 1 };
        }
      });
    });

    const data = Object.keys(categoryStats).map((categoryName) => {
      const stat = categoryStats[categoryName];
      const avg = stat.count > 0 ? Math.round((stat.totalScore / stat.count) * 10) / 10 : 0;
      return {
        category: categoryName,
        score: avg,
        rating: classifyScore(avg),
        evaluationsCount: stat.count,
      };
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get building compliance comparison and ranking
// @route   GET /api/analytics/building-comparison
// @access  Private
exports.getBuildingComparison = async (req, res, next) => {
  try {
    const buildings = await Building.find();

    const buildingStats = await Promise.all(
      buildings.map(async (b) => {
        const inspections = await Inspection.find({ building: b._id }).sort({ inspectionDate: -1 });
        const openIssuesCount = await Issue.countDocuments({
          building: b._id,
          status: { $in: ['OPEN', 'IN_PROGRESS'] },
        });

        let avgScore = 0;
        let latestScore = b.lastComplianceScore || 0;
        if (inspections.length > 0) {
          const sum = inspections.reduce((acc, curr) => acc + curr.totalScore, 0);
          avgScore = Math.round((sum / inspections.length) * 10) / 10;
          latestScore = inspections[0].totalScore;
        }

        return {
          id: b._id,
          name: b.name,
          code: b.code,
          block: b.block,
          squareFootage: b.squareFootage,
          inspectionsCount: inspections.length,
          latestScore,
          averageScore: avgScore,
          openIssuesCount,
          rating: classifyScore(latestScore || avgScore),
        };
      })
    );

    // Sort by latest score descending
    buildingStats.sort((a, b) => b.latestScore - a.latestScore);

    res.status(200).json({
      success: true,
      data: buildingStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get compliance score trend over time
// @route   GET /api/analytics/trends
// @access  Private
exports.getTrendOverTime = async (req, res, next) => {
  try {
    const inspections = await Inspection.find()
      .populate('building', 'name code')
      .sort({ inspectionDate: 1 });

    const timelineData = inspections.map((insp) => ({
      id: insp._id,
      date: insp.inspectionDate.toISOString().split('T')[0],
      score: insp.totalScore,
      building: insp.building ? insp.building.name : 'Unknown',
      code: insp.building ? insp.building.code : '',
      rating: insp.ratingLabel,
    }));

    res.status(200).json({
      success: true,
      data: timelineData,
    });
  } catch (error) {
    next(error);
  }
};
