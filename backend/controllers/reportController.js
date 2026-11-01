const db = require('../config/db');

// Submit rescue report
const createReport = async (req, res, next) => {
  try {
    const {
      fullName,
      phone,
      email,
      location,
      animalType,
      condition,
      description
    } = req.body;

    if (!fullName || !phone || !location || !animalType || !condition || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Name, Phone, Location, Animal Type, Condition, and Description.'
      });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide more details about the animal situation (at least 10 characters).'
      });
    }

    // Check if an image was uploaded
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const report = await db.insert('reports', {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : '',
      location: location.trim(),
      animalType: animalType.trim(),
      condition: condition.trim(),
      description: description.trim(),
      image: imageUrl,
      status: 'reported', // reported | investigating | rescued | closed
      adminNotes: ''
    });

    res.status(201).json({
      success: true,
      message: 'Rescue report logged successfully. Our volunteers will be notified!',
      data: report
    });
  } catch (err) {
    next(err);
  }
};

// Get all reports (admin only)
const getAllReports = async (req, res, next) => {
  try {
    const { status, condition } = req.query;

    let items = await db.find('reports');

    if (status && status !== 'all') {
      items = items.filter(item => item.status === status);
    }

    if (condition) {
      items = items.filter(item => item.condition.toLowerCase() === condition.toLowerCase());
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

// Get report by ID
const getReportById = async (req, res, next) => {
  try {
    const item = await db.findById('reports', req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.'
      });
    }
    res.json({
      success: true,
      data: item
    });
  } catch (err) {
    next(err);
  }
};

// Update report status & notes
const updateReportStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const allowed = ['reported', 'investigating', 'rescued', 'closed'];

    if (status && !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowed.join(', ')}`
      });
    }

    const current = await db.findById('reports', req.params.id);
    if (!current) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.'
      });
    }

    const updates = {};
    if (status) updates.status = status;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;

    const updated = await db.updateById('reports', req.params.id, updates);

    // If newly marked as rescued, update impact stats
    if (status === 'rescued' && current.status !== 'rescued') {
      const stats = await db.getStats();
      await db.updateStats({ animalsRescued: (stats.animalsRescued || 0) + 1 });
    }

    res.json({
      success: true,
      message: 'Rescue report updated successfully.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

// Delete report
const deleteReport = async (req, res, next) => {
  try {
    const deleted = await db.deleteById('reports', req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.'
      });
    }
    res.json({
      success: true,
      message: 'Rescue report deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReport,
  getAllReports,
  getReportById,
  updateReportStatus,
  deleteReport
};
