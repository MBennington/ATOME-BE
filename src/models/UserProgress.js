const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  habit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true
  },
  habitId: {
    type: String,
    required: true,
    trim: true
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  taskId: {
    type: String,
    required: true,
    trim: true
  },
  day: {
    type: Number,
    required: true,
    min: 1,
    max: 365
  },
  week: {
    type: Number,
    required: true,
    min: 1,
    max: 52
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  completionTime: {
    type: Number, // Time taken to complete in minutes
    default: null
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  streak: {
    type: Number,
    default: 0
  },
  lastCompletedDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Compound indexes for efficient queries
userProgressSchema.index({ user: 1, habit: 1, day: 1 }, { unique: true });
userProgressSchema.index({ user: 1, habitId: 1, taskId: 1 }, { unique: true });
userProgressSchema.index({ user: 1, isCompleted: 1 });
userProgressSchema.index({ user: 1, completedAt: 1 });

// Virtual for calculating completion percentage
userProgressSchema.virtual('completionPercentage').get(function() {
  // This will be calculated in the controller based on total tasks
  return null;
});

// Method to mark task as completed
userProgressSchema.methods.markCompleted = function(notes = '', rating = null, completionTime = null) {
  this.isCompleted = true;
  this.completedAt = new Date();
  this.lastCompletedDate = new Date();
  this.notes = notes;
  this.rating = rating;
  this.completionTime = completionTime;
  this.streak += 1;
  return this.save();
};

// Method to mark task as incomplete
userProgressSchema.methods.markIncomplete = function() {
  this.isCompleted = false;
  this.completedAt = null;
  this.notes = '';
  this.rating = null;
  this.completionTime = null;
  return this.save();
};

// Static method to get user's progress for a habit
userProgressSchema.statics.getUserHabitProgress = async function(userId, habitId) {
  return await this.find({ user: userId, habitId: habitId })
    .populate('task', 'title description day week category estimatedTime executionTime')
    .sort({ day: 1 });
};

// Static method to get user's progress for a specific day
userProgressSchema.statics.getUserDayProgress = async function(userId, habitId, day) {
  return await this.findOne({ user: userId, habitId: habitId, day: day })
    .populate('task', 'title description day week category estimatedTime executionTime');
};

// Static method to get user's progress for a specific week
userProgressSchema.statics.getUserWeekProgress = async function(userId, habitId, week) {
  return await this.find({ user: userId, habitId: habitId, week: week })
    .populate('task', 'title description day week category estimatedTime executionTime')
    .sort({ day: 1 });
};

// Static method to get user's overall statistics
userProgressSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        completedTasks: { $sum: { $cond: ['$isCompleted', 1, 0] } },
        totalStreak: { $sum: '$streak' },
        averageRating: { $avg: '$rating' },
        totalCompletionTime: { $sum: { $ifNull: ['$completionTime', 0] } }
      }
    }
  ]);
  
  return stats[0] || {
    totalTasks: 0,
    completedTasks: 0,
    totalStreak: 0,
    averageRating: 0,
    totalCompletionTime: 0
  };
};

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

module.exports = UserProgress;
