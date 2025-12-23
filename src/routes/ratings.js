const express = require('express');
const router = express.Router();
const {
  submitRating,
  getHabitRating,
  getHabitRatings
} = require('../controllers/ratingController');
const { protect } = require('../middleware/auth');

// Public route - get all ratings for a habit (no auth required)
router.get('/habit/:habitId/all', getHabitRatings);

// Protected routes - require authentication
router.use(protect);

// Submit rating (requires auth)
router.post('/submit', submitRating);

// Get user's rating for a habit (requires auth)
router.get('/habit/:habitId', getHabitRating);

module.exports = router;