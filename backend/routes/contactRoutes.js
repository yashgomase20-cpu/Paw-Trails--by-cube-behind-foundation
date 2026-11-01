const express = require('express');
const router = express.Router();
const {
  createContact,
  getAllContacts,
  updateContactStatus,
  deleteContact
} = require('../controllers/contactController');
const { requireAuth } = require('../middleware/authMiddleware');

// Public route to submit contact inquiry
router.post('/', createContact);

// Protected routes for admin management
router.get('/', requireAuth, getAllContacts);
router.patch('/:id/status', requireAuth, updateContactStatus);
router.delete('/:id', requireAuth, deleteContact);

module.exports = router;
