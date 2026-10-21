const express = require('express');
const {
  getInspections,
  getInspectionById,
  createInspection,
} = require('../controllers/inspectionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getInspections)
  .post(authorize('INSPECTOR', 'ADMIN'), createInspection);

router.route('/:id')
  .get(getInspectionById);

module.exports = router;
