const db = require('../config/db');

// Get all animals (public)
const getAllAnimals = async (req, res, next) => {
  try {
    const { status } = req.query;

    let items = await db.find('animals');

    if (status && status !== 'all') {
      items = items.filter(animal => animal.status === status);
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

// Get animal by ID (public)
const getAnimalById = async (req, res, next) => {
  try {
    const animal = await db.findById('animals', req.params.id);
    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal not found.'
      });
    }

    res.json({
      success: true,
      data: animal
    });
  } catch (err) {
    next(err);
  }
};

// Create new animal profile (admin only)
const createAnimal = async (req, res, next) => {
  try {
    const {
      name,
      status,
      age,
      gender,
      breed,
      location,
      story,
      health,
      personality
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Animal name is required.'
      });
    }

    // Generate unique slug id from name
    const baseSlug = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
    let animalId = baseSlug;
    const existing = await db.findById('animals', animalId);
    if (existing) {
      animalId = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    let imageUrl = 'images/dog-care.jpg';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    const statusMap = {
      available: 'Available for Adoption',
      'in-progress': 'Adoption in Progress',
      adopted: 'Adopted'
    };

    const validStatus = statusMap[status] ? status : 'available';

    const newAnimal = await db.insert('animals', {
      id: animalId,
      name: name.trim(),
      status: validStatus,
      statusDisplay: statusMap[validStatus],
      age: age ? age.trim() : 'Unknown',
      gender: gender ? gender.trim() : 'Not specified',
      breed: breed ? breed.trim() : 'Indie',
      location: location ? location.trim() : 'Pune',
      image: imageUrl,
      story: story ? story.trim() : 'Rescued dog looking for a compassionate forever home.',
      health: health ? health.trim() : 'Vaccinated, Regular checkups',
      personality: personality ? personality.trim() : 'Friendly, Loyal',
      rescuedDate: req.body.rescuedDate || new Date().toISOString().split('T')[0]
    });

    res.status(201).json({
      success: true,
      message: 'Animal profile created successfully.',
      data: newAnimal
    });
  } catch (err) {
    next(err);
  }
};

// Update animal profile (admin only)
const updateAnimal = async (req, res, next) => {
  try {
    const animal = await db.findById('animals', req.params.id);
    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal not found.'
      });
    }

    const updates = { ...req.body };

    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    if (updates.status) {
      const statusMap = {
        available: 'Available for Adoption',
        'in-progress': 'Adoption in Progress',
        adopted: 'Adopted'
      };
      if (statusMap[updates.status]) {
        updates.statusDisplay = statusMap[updates.status];
      }
    }

    const updated = await db.updateById('animals', req.params.id, updates);

    res.json({
      success: true,
      message: 'Animal profile updated successfully.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

// Delete animal (admin only)
const deleteAnimal = async (req, res, next) => {
  try {
    const deleted = await db.deleteById('animals', req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Animal not found.'
      });
    }

    res.json({
      success: true,
      message: 'Animal profile removed successfully.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllAnimals,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal
};
