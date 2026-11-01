const db = require('../config/db');

// Submit adoption application
const createAdoption = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      city,
      animalOfInterest,
      address,
      whyAdopt,
      petExperience,
      message
    } = req.body;

    // Validation
    if (!fullName || !email || !phone || !city || !address || !whyAdopt) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (Name, Email, Phone, City, Address, Reason to adopt).'
      });
    }

    if (whyAdopt.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide more detail in why you want to adopt (at least 10 characters).'
      });
    }

    const application = db.insert('adoptions', {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      city: city.trim(),
      animalOfInterest: (animalOfInterest || 'Any needy dog').trim(),
      address: address.trim(),
      whyAdopt: whyAdopt.trim(),
      petExperience: petExperience ? petExperience.trim() : '',
      message: message ? message.trim() : '',
      status: 'pending', // pending | under_review | approved | rejected
      adminNotes: ''
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your adoption application has been submitted successfully.',
      data: application
    });
  } catch (err) {
    next(err);
  }
};

// Get all adoption applications (admin only)
const getAllAdoptions = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    let items = db.find('adoptions');

    if (status && status !== 'all') {
      items = items.filter(item => item.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        item =>
          item.fullName.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          item.phone.toLowerCase().includes(q) ||
          item.city.toLowerCase().includes(q) ||
          (item.animalOfInterest && item.animalOfInterest.toLowerCase().includes(q))
      );
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

// Get single application
const getAdoptionById = async (req, res, next) => {
  try {
    const item = db.findById('adoptions', req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Adoption application not found.'
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

// Update application status
const updateAdoptionStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const allowed = ['pending', 'under_review', 'approved', 'rejected'];

    if (status && !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowed.join(', ')}`
      });
    }

    const updates = {};
    if (status) updates.status = status;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;

    const updated = db.updateById('adoptions', req.params.id, updates);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Adoption application not found.'
      });
    }

    // If marked approved, increment impact stats
    if (status === 'approved') {
      const stats = db.getStats();
      db.updateStats({ successfulAdoptions: (stats.successfulAdoptions || 0) + 1 });
    }

    res.json({
      success: true,
      message: 'Adoption application updated successfully.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

// Delete application
const deleteAdoption = async (req, res, next) => {
  try {
    const deleted = db.deleteById('adoptions', req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Adoption application not found.'
      });
    }
    res.json({
      success: true,
      message: 'Adoption application deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createAdoption,
  getAllAdoptions,
  getAdoptionById,
  updateAdoptionStatus,
  deleteAdoption
};
