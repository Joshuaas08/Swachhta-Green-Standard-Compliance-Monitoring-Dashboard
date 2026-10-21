const express = require('express');
const {
  getBuildings,
  getBuilding,
  createBuilding,
  updateBuilding,
  deleteBuilding,
} = require('../controllers/buildingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All building routes require authentication

router.route('/')
  .get(getBuildings)
  .post(authorize('ADMIN'), createBuilding);

router.route('/:id')
  .get(getBuilding)
  .put(authorize('ADMIN'), updateBuilding)
  .delete(authorize('ADMIN'), deleteBuilding);

module.exports = router;
