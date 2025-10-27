const express = require('express');
const router = express.Router();
const {
  getAllHabits,
  getHabitById,
  getHabitWithTasks,
  getTasksByDay,
  getTasksByWeek,
  getHabitCategories,
  getHabitDifficulties,
  getHabitSubcategories,
  searchHabits,
  updateHabit,
  deleteHabit,
  hardDeleteHabit,
  getCategories,
  createBulkHabits,
  getHabitsByCountry,
  getOnboardingPreferences,
  getPersonalizedCategories,
  addEngagedUser,
  removeEngagedUser,
  updateUserProgress
} = require('../controllers/habitController');

// Public routes
router.get('/', getAllHabits);
router.post('/bulk', createBulkHabits); // Bulk create habits
router.get('/categories', getCategories); // New efficient categories endpoint
router.get('/categories-legacy', getHabitCategories); // Keep legacy for compatibility
router.get('/difficulties', getHabitDifficulties);
router.get('/subcategories', getHabitSubcategories);
router.get('/search', searchHabits); // Search habits with text search
router.get('/country/:countryCode', getHabitsByCountry); // Get habits by country
router.get('/onboarding-preferences', getOnboardingPreferences); // Get onboarding preferences data

// Protected routes (require authentication)
const { protect } = require('../middleware/auth');
router.get('/categories/personalized', protect, getPersonalizedCategories); // Personalized categories endpoint
// Note: /:id routes must come after specific routes to avoid conflicts
router.get('/:id', getHabitById);
router.get('/:id/tasks', getHabitWithTasks);
router.get('/:id/tasks/day/:day', getTasksByDay);
router.get('/:id/tasks/week/:week', getTasksByWeek);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.delete('/:id/hard', hardDeleteHabit);

// Engaged users routes
router.post('/:id/engage', addEngagedUser);
router.delete('/:id/engage/:userId', removeEngagedUser);
router.put('/:id/engage/:userId/progress', updateUserProgress);

module.exports = router;
