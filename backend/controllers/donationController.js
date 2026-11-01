const db = require('../config/db');

// Record a donation intent / payment confirmation
const createDonation = async (req, res, next) => {
  try {
    const { donorName, email, phone, amount, purpose, upiRef, notes } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid donation amount greater than 0.'
      });
    }

    const donation = await db.insert('donations', {
      donorName: donorName ? donorName.trim() : 'Kind Supporter',
      email: email ? email.trim().toLowerCase() : '',
      phone: phone ? phone.trim() : '',
      amount: Number(amount),
      purpose: purpose ? purpose.trim() : 'Food & Rescue Fund',
      upiRef: upiRef ? upiRef.trim() : `UPI-${Date.now()}`,
      notes: notes ? notes.trim() : '',
      paymentMethod: 'UPI',
      status: 'completed'
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your generous contribution to Paw Trails!',
      data: donation
    });
  } catch (err) {
    next(err);
  }
};

// Get all donations (admin only)
const getAllDonations = async (req, res, next) => {
  try {
    const donations = await db.find('donations');
    const totalAmount = donations.reduce(
      (sum, d) => sum + (Number(d.amount) || 0),
      0
    );

    res.json({
      success: true,
      count: donations.length,
      totalAmount,
      data: donations
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createDonation,
  getAllDonations
};
