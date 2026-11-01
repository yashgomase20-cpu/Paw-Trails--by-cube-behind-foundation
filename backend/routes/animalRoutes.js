const express = require('express');
const router = express.Router();
const {
  getAllAnimals,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal
} = require('../controllers/animalController');
const upload = require('../middleware/uploadMiddleware');
const { requireAuth } = require('../middleware/authMiddleware');

// Public animal catalog routes
router.get('/', getAllAnimals);
router.get('/:id', getAnimalById);

// Protected admin routes
router.post('/', requireAuth, upload.single('image'), createAnimal);
router.put('/:id', requireAuth, upload.single('image'), updateAnimal);
router.delete('/:id', requireAuth, deleteAnimal);

module.exports = router;
