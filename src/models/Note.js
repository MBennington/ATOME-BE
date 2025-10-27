const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Note must belong to a user']
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: [true, 'Note must belong to a task']
  },
  taskId: {
    type: String,
    required: [true, 'Task ID is required'],
    trim: true
  },
  habitId: {
    type: String,
    required: [true, 'Habit ID is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Note content is required'],
    trim: true,
    maxlength: [1000, 'Note content cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
noteSchema.index({ user: 1, habitId: 1, taskId: 1 }); // Compound index for user-specific task notes
noteSchema.index({ user: 1, taskId: 1 });
noteSchema.index({ user: 1, habitId: 1 });
noteSchema.index({ user: 1, task: 1 });
noteSchema.index({ user: 1, createdAt: -1 });

// Ensure unique note per user per task within a habit
noteSchema.index({ user: 1, habitId: 1, taskId: 1, _id: 1 });

module.exports = mongoose.model('Note', noteSchema);
