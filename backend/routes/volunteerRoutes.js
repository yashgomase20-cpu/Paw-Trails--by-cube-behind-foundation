const express = require('express');
const router = express.Router();
const {
  createVolunteer,
  getAllVolunteers,
  updateVolunteerStatus,
  deleteVolunteer
} = require('../controllers/volunteerController');
const { requireAuth } = require('../middleware/authMiddleware');

// Public route to register as volunteer
router.post('/', createVolunteer);

// Protected routes for admin management
router.get('/', requireAuth, getAllVolunteers);
router.patch('/:id/status', requireAuth, updateVolunteerStatus);
router.delete('/:id', requireAuth, deleteVolunteer);

module.exports = router;
