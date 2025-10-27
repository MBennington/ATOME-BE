const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const habitRoutes = require('./habits');
const taskRoutes = require('./tasks');
const progressRoutes = require('./progress');
const assetRoutes = require('./assets');
const noteRoutes = require('./notes');
const imageRoutes = require('./images');
const tunnelRoutes = require('./tunnel');
const savedCollectionsRoutes = require('./savedCollectionsRoutes');
const preferencesRoutes = require('./preferences');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ATOME Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/habits', habitRoutes);
router.use('/tasks', taskRoutes);
router.use('/progress', progressRoutes);
router.use('/assets', assetRoutes);
router.use('/images', imageRoutes);
router.use('/tunnel', tunnelRoutes);
router.use('/saved-collections', savedCollectionsRoutes);
router.use('/preferences', preferencesRoutes);
router.use('/notes', (req, res, next) => {
  console.log('Notes routes mounted, request to:', req.path, req.method);
  next();
}, noteRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to ATOME Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        profile: 'PUT /api/auth/profile',
        changePassword: 'PUT /api/auth/change-password',
        logout: 'POST /api/auth/logout'
      },
      habits: {
        getAll: 'GET /api/habits',
        createBulk: 'POST /api/habits/bulk',
        getById: 'GET /api/habits/:id',
        getWithTasks: 'GET /api/habits/:id/tasks',
        getTasksByDay: 'GET /api/habits/:id/tasks/day/:day',
        getTasksByWeek: 'GET /api/habits/:id/tasks/week/:week',
        getCategories: 'GET /api/habits/categories',
        getDifficulties: 'GET /api/habits/difficulties'
      },
      tasks: {
        getAll: 'GET /api/tasks',
        createBulk: 'POST /api/tasks/bulk',
        getById: 'GET /api/tasks/:id',
        update: 'PUT /api/tasks/:id',
        delete: 'DELETE /api/tasks/:id'
      },
      notes: {
        getByTask: 'GET /api/notes/habit/:habitId/task/:taskId (Private)',
        getByHabit: 'GET /api/notes/habit/:habitId (Private)',
        getById: 'GET /api/notes/:id (Private)',
        create: 'POST /api/notes (Private)',
        update: 'PUT /api/notes/:id (Private)',
        delete: 'DELETE /api/notes/:id (Private)'
      },
             progress: {
               getActiveHabits: 'GET /api/progress/active-habits',
               getTodayTasks: 'GET /api/progress/today-tasks',
               getStats: 'GET /api/progress/stats',
               getHabitProgress: 'GET /api/progress/habit/:habitId',
               startHabit: 'POST /api/progress/start-habit',
               stopHabit: 'POST /api/progress/stop-habit',
               resetHabit: 'POST /api/progress/reset-habit',
               completeTask: 'POST /api/progress/complete-task',
               uncompleteTask: 'POST /api/progress/uncomplete-task'
             },
             assets: {
               upload: 'POST /api/assets/upload',
               uploadMultiple: 'POST /api/assets/upload-multiple',
               delete: 'DELETE /api/assets/:publicId',
               optimize: 'GET /api/assets/optimize/:publicId',
               info: 'GET /api/assets/info/:publicId',
               health: 'GET /api/assets/health'
             },
             images: {
               generateAchievement: 'POST /api/images/achievement',
               generateCustomAchievement: 'POST /api/images/achievement/custom',
               getImageInfo: 'GET /api/images/info'
             },
             tunnel: {
               create: 'POST /api/tunnel',
               status: 'GET /api/tunnel/status',
               close: 'DELETE /api/tunnel/:port'
             },
             savedCollections: {
               save: 'POST /api/saved-collections (Private)',
               unsave: 'DELETE /api/saved-collections/:habitId (Private)',
               getAll: 'GET /api/saved-collections (Private)',
               check: 'GET /api/saved-collections/check/:habitId (Private)'
             }
    }
  });
});

module.exports = router;
