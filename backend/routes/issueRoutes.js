const express = require('express');
const {
  getIssues,
  getIssueById,
  updateIssueStatus,
  resolveIssue,
} = require('../controllers/issueController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getIssues);

router.route('/:id')
  .get(getIssueById);

router.patch('/:id/status', authorize('MAINTENANCE', 'ADMIN'), updateIssueStatus);
router.patch('/:id/resolve', authorize('MAINTENANCE', 'ADMIN'), resolveIssue);

module.exports = router;
