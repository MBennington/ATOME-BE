const express = require('express');
const router = express.Router();
const {
  createBulkTasks,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

// Public routes
router.get('/', getAllTasks);
router.post('/bulk', createBulkTasks);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;