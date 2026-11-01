const express = require('express');
const router = express.Router();
const {
  createReport,
  getAllReports,
  getReportById,
  updateReportStatus,
  deleteReport
} = require('../controllers/reportController');
const upload = require('../middleware/uploadMiddleware');
const { requireAuth } = require('../middleware/authMiddleware');

// Public route to submit distress report (with optional image)
router.post('/', upload.single('image'), createReport);

// Protected routes for admin management
router.get('/', requireAuth, getAllReports);
router.get('/:id', requireAuth, getReportById);
router.patch('/:id/status', requireAuth, updateReportStatus);
router.delete('/:id', requireAuth, deleteReport);

module.exports = router;
