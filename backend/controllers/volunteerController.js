const db = require('../config/db');

// Volunteer registration
const createVolunteer = async (req, res, next) => {
  try {
    const {
      fullName,
      phone,
      email,
      city,
      preferredDate,
      numberOfPeople,
      activity,
      message
    } = req.body;

    if (!fullName || !phone || !email || !city || !preferredDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Name, Phone, Email, City, and Preferred Date.'
      });
    }

    const volunteer = await db.insert('volunteers', {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      city: city.trim(),
      preferredDate,
      numberOfPeople: parseInt(numberOfPeople, 10) || 1,
      activity: (activity || 'Feeding Dogs').trim(),
      message: message ? message.trim() : '',
      status: 'pending', // pending | confirmed | attended | cancelled
      adminNotes: ''
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for volunteering! Our coordinator will contact you shortly.',
      data: volunteer
    });
  } catch (err) {
    next(err);
  }
};

// Get all volunteers (admin only)
const getAllVolunteers = async (req, res, next) => {
  try {
    const { status, activity } = req.query;

    let items = await db.find('volunteers');

    if (status && status !== 'all') {
      items = items.filter(item => item.status === status);
    }

    if (activity) {
      items = items.filter(item => item.activity.toLowerCase() === activity.toLowerCase());
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

// Update volunteer status
const updateVolunteerStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const allowed = ['pending', 'confirmed', 'attended', 'cancelled'];

    if (status && !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowed.join(', ')}`
      });
    }

    const current = await db.findById('volunteers', req.params.id);
    if (!current) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer record not found.'
      });
    }

    const updates = {};
    if (status) updates.status = status;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;

    const updated = await db.updateById('volunteers', req.params.id, updates);

    // If confirmed and wasn't before, update volunteers count
    if (status === 'confirmed' && current.status !== 'confirmed') {
      const stats = await db.getStats();
      await db.updateStats({ volunteersCount: (stats.volunteersCount || 0) + (current.numberOfPeople || 1) });
    }

    res.json({
      success: true,
      message: 'Volunteer status updated successfully.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

// Delete volunteer
const deleteVolunteer = async (req, res, next) => {
  try {
    const deleted = await db.deleteById('volunteers', req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer record not found.'
      });
    }
    res.json({
      success: true,
      message: 'Volunteer record deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createVolunteer,
  getAllVolunteers,
  updateVolunteerStatus,
  deleteVolunteer
};
