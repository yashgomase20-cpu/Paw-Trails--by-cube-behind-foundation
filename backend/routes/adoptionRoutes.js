const express = require('express');
const router = express.Router();
const {
  createAdoption,
  getAllAdoptions,
  getAdoptionById,
  updateAdoptionStatus,
  deleteAdoption
} = require('../controllers/adoptionController');
const { requireAuth } = require('../middleware/authMiddleware');

// Public route to submit adoption form
router.post('/', createAdoption);

// Protected routes for admin management
router.get('/', requireAuth, getAllAdoptions);
router.get('/:id', requireAuth, getAdoptionById);
router.patch('/:id/status', requireAuth, updateAdoptionStatus);
router.delete('/:id', requireAuth, deleteAdoption);

module.exports = router;
