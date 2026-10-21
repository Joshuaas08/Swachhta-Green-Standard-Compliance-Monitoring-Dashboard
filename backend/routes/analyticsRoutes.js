const express = require('express');
const {
  getOverview,
  getCategoryComparison,
  getBuildingComparison,
  getTrendOverTime,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/overview', getOverview);
router.get('/category-comparison', getCategoryComparison);
router.get('/building-comparison', getBuildingComparison);
router.get('/trends', getTrendOverTime);

module.exports = router;
