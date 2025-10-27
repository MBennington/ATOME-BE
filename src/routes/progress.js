const express = require('express');
const router = express.Router();
const {
  getActiveHabits,
  startHabit,
  stopHabit,
  completeTask,
  uncompleteTask,
  resetHabit,
  getHabitProgress,
  getUserStats,
  getTodayTasks,
  getHabitUsers
} = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

// All routes are protected (require authentication)
router.use(protect);

// Progress routes
router.get('/active-habits', getActiveHabits);
router.get('/today-tasks', getTodayTasks);
router.get('/stats', getUserStats);
router.get('/habit/:habitId', getHabitProgress);
router.get('/habit/:habitId/users', getHabitUsers);

// Habit management routes
router.post('/start-habit', startHabit);
router.post('/stop-habit', stopHabit);
router.post('/reset-habit', resetHabit);

// Task completion routes
router.post('/complete-task', completeTask);
router.post('/uncomplete-task', uncompleteTask);

module.exports = router;
