const express = require('express');
const router = express.Router();
const {
  getNotesByTask,
  getNotesByHabit,
  createNote,
  updateNote,
  deleteNote,
  getNoteById
} = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

// Test route to verify notes routes are working (public)
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Notes routes are working!' });
});

// Protected routes - all note operations require authentication
router.use(protect); // Apply authentication middleware to all routes below

// Most specific routes must come first
router.get('/habit/:habitId/task/:taskId', (req, res, next) => {
  console.log('Notes route hit: GET /habit/:habitId/task/:taskId', req.params);
  next();
}, getNotesByTask);

router.get('/habit/:habitId', (req, res, next) => {
  console.log('Notes route hit: GET /habit/:habitId', req.params);
  next();
}, getNotesByHabit);

router.post('/', (req, res, next) => {
  console.log('Notes route hit: POST /', req.body);
  next();
}, createNote);

router.get('/:id', (req, res, next) => {
  console.log('Notes route hit: GET /:id', req.params);
  next();
}, getNoteById);

router.put('/:id', (req, res, next) => {
  console.log('Notes route hit: PUT /:id', req.params);
  next();
}, updateNote);

router.delete('/:id', (req, res, next) => {
  console.log('Notes route hit: DELETE /:id', req.params);
  next();
}, deleteNote);

module.exports = router;
