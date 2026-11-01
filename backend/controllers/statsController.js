const db = require('../config/db');

// Get public impact stats
const getStats = async (req, res, next) => {
  try {
    const stats = db.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    next(err);
  }
};

// Get aggregated admin dashboard metrics (admin only)
const getAdminDashboardSummary = async (req, res, next) => {
  try {
    const stats = db.getStats();
    const adoptions = db.find('adoptions');
    const reports = db.find('reports');
    const volunteers = db.find('volunteers');
    const contacts = db.find('contacts');
    const animals = db.find('animals');
    const donations = db.find('donations');

    const totalDonationAmount = donations.reduce(
      (sum, d) => sum + (Number(d.amount) || 0),
      0
    );

    const summary = {
      stats,
      counts: {
        animals: {
          total: animals.length,
          available: animals.filter(a => a.status === 'available').length,
          inProgress: animals.filter(a => a.status === 'in-progress').length,
          adopted: animals.filter(a => a.status === 'adopted').length
        },
        adoptions: {
          total: adoptions.length,
          pending: adoptions.filter(a => a.status === 'pending' || a.status === 'under_review').length,
          approved: adoptions.filter(a => a.status === 'approved').length
        },
        reports: {
          total: reports.length,
          active: reports.filter(r => r.status === 'reported' || r.status === 'investigating').length,
          rescued: reports.filter(r => r.status === 'rescued').length
        },
        volunteers: {
          total: volunteers.length,
          pending: volunteers.filter(v => v.status === 'pending').length,
          confirmed: volunteers.filter(v => v.status === 'confirmed').length
        },
        contacts: {
          total: contacts.length,
          unread: contacts.filter(c => c.status === 'unread').length
        },
        donations: {
          totalCount: donations.length,
          totalAmount: totalDonationAmount
        }
      }
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (err) {
    next(err);
  }
};

// Update public impact stats (admin only)
const updateStats = async (req, res, next) => {
  try {
    const { animalsFed, animalsRescued, successfulAdoptions, volunteersCount } = req.body;

    const updates = {};
    if (animalsFed !== undefined) updates.animalsFed = Number(animalsFed);
    if (animalsRescued !== undefined) updates.animalsRescued = Number(animalsRescued);
    if (successfulAdoptions !== undefined) updates.successfulAdoptions = Number(successfulAdoptions);
    if (volunteersCount !== undefined) updates.volunteersCount = Number(volunteersCount);

    const updated = db.updateStats(updates);

    res.json({
      success: true,
      message: 'Impact statistics updated successfully.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStats,
  getAdminDashboardSummary,
  updateStats
};
