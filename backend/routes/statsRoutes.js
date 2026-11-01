const express = require('express');
const router = express.Router();
const {
  getStats,
  getAdminDashboardSummary,
  updateStats
} = require('../controllers/statsController');
const { requireAuth } = require('../middleware/authMiddleware');

// Public impact stats
router.get('/', getStats);

// Protected admin dashboard KPIs & stats updates
router.get('/dashboard', requireAuth, getAdminDashboardSummary);
router.put('/', requireAuth, updateStats);

module.exports = router;
