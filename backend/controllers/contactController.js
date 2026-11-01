const db = require('../config/db');

// Submit contact message
const createContact = async (req, res, next) => {
  try {
    const { fullName, email, subject, message } = req.body;

    if (!fullName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Name, Email, and Message.'
      });
    }

    if (message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Message should be at least 10 characters long.'
      });
    }

    const contact = db.insert('contacts', {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      subject: (subject || 'General Inquiry').trim(),
      message: message.trim(),
      status: 'unread', // unread | read | replied
      adminNotes: ''
    });

    res.status(201).json({
      success: true,
      message: '✓ Your message has been received! We will get back to you soon.',
      data: contact
    });
  } catch (err) {
    next(err);
  }
};

// Get all contacts (admin only)
const getAllContacts = async (req, res, next) => {
  try {
    const { status } = req.query;

    let items = db.find('contacts');

    if (status && status !== 'all') {
      items = items.filter(item => item.status === status);
    }

    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err) {
    next(err);
  }
};

// Mark contact as read / replied
const updateContactStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const allowed = ['unread', 'read', 'replied'];

    if (status && !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowed.join(', ')}`
      });
    }

    const updates = {};
    if (status) updates.status = status;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;

    const updated = db.updateById('contacts', req.params.id, updates);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found.'
      });
    }

    res.json({
      success: true,
      message: 'Message status updated.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

// Delete contact
const deleteContact = async (req, res, next) => {
  try {
    const deleted = db.deleteById('contacts', req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found.'
      });
    }
    res.json({
      success: true,
      message: 'Contact message deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createContact,
  getAllContacts,
  updateContactStatus,
  deleteContact
};
