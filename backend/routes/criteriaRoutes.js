const express = require('express');
const {
  getCriteria,
  getCriteriaById,
  createCriteria,
  updateCriteria,
  deleteCriteria,
} = require('../controllers/criteriaController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCriteria)
  .post(authorize('ADMIN'), createCriteria);

router.route('/:id')
  .get(getCriteriaById)
  .put(authorize('ADMIN'), updateCriteria)
  .delete(authorize('ADMIN'), deleteCriteria);

module.exports = router;
