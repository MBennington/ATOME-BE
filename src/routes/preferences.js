const express = require('express');
const router = express.Router();
const {
  saveOnboardingPreferences,
  getUserPreferences,
  updateUserPreferences,
  getPersonalizedRecommendations
} = require('../controllers/preferencesController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Onboarding preferences
router.post('/onboarding', saveOnboardingPreferences);

// User preferences
router.get('/', getUserPreferences);
router.put('/', updateUserPreferences);

// Personalized recommendations
router.get('/recommendations', getPersonalizedRecommendations);

module.exports = router;
