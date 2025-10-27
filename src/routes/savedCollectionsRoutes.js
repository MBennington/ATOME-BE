const express = require('express');
const router = express.Router();
const {
  saveCollection,
  unsaveCollection,
  getSavedCollections,
  checkIfSaved
} = require('../controllers/savedCollectionsController');
const { protect } = require('../middleware/auth');

// All routes are protected (require authentication)
router.use(protect);

// @route   POST /api/saved-collections
// @desc    Save a collection to user's favorites
// @access  Private
router.post('/', saveCollection);

// @route   DELETE /api/saved-collections/:habitId
// @desc    Remove a collection from user's favorites
// @access  Private
router.delete('/:habitId', unsaveCollection);

// @route   GET /api/saved-collections
// @desc    Get user's saved collections
// @access  Private
router.get('/', getSavedCollections);

// @route   GET /api/saved-collections/check/:habitId
// @desc    Check if a collection is saved by user
// @access  Private
router.get('/check/:habitId', checkIfSaved);

module.exports = router;
