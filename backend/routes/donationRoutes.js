const express = require('express');
const router = express.Router();
const {
  createDonation,
  getAllDonations
} = require('../controllers/donationController');
const { requireAuth } = require('../middleware/authMiddleware');

// Public donation record / pledge
router.post('/', createDonation);

// Protected admin donation history
router.get('/', requireAuth, getAllDonations);

module.exports = router;
