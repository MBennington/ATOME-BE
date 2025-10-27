const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  habit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: [true, 'Task must belong to a habit']
  },
  habitId: {
    type: String,
    required: [true, 'Habit ID is required'],
    trim: true
  },
  id: {
    type: String,
    required: [true, 'Task ID is required'],
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true
  },
  day: {
    type: [Number],
    required: [true, 'Task days are required'],
    validate: {
      validator: function(days) {
        return Array.isArray(days) && days.length > 0 && days.every(day => day >= 1 && day <= 365);
      },
      message: 'Days must be an array of numbers between 1 and 365'
    }
  },
  category: {
    type: String,
    required: [true, 'Task category is required'],
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  estimatedTime: {
    type: String,
    required: [true, 'Estimated time is required'],
    trim: true
  },
  executionTime: {
    type: String,
    required: [true, 'Execution time is required'],
    trim: true,
    maxlength: [50, 'Execution time cannot exceed 50 characters']
  },
  notifyTime: {
    type: String,
    required: false,
    trim: true,
    default: '09:00',
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Notify time must be in HH:MM format']
  },
  week: {
    type: Number,
    required: [true, 'Week number is required'],
    min: [1, 'Week must be at least 1'],
    max: [52, 'Week cannot exceed 52']
  },
  weekGoal: {
    type: String,
    required: [true, 'Week goal is required'],
    trim: true,
    maxlength: [200, 'Week goal cannot exceed 200 characters']
  },
  videoLink: {
    type: String,
    required: false,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty/null values
        try {
          const url = new URL(v);
          const validDomains = [
            'youtube.com', 'www.youtube.com', 'youtu.be',
            'vimeo.com', 'www.vimeo.com',
            'dailymotion.com', 'www.dailymotion.com',
            'twitch.tv', 'www.twitch.tv'
          ];
          return validDomains.some(domain => 
            url.hostname === domain || url.hostname.endsWith('.' + domain)
          );
        } catch (error) {
          return false;
        }
      },
      message: 'Video link must be a valid URL from supported platforms (YouTube, Vimeo, Dailymotion, Twitch)'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
taskSchema.index({ habitId: 1, week: 1 });
taskSchema.index({ habitId: 1, category: 1 });
taskSchema.index({ habit: 1, week: 1 });
taskSchema.index({ isActive: 1 });
// Index for days array queries
taskSchema.index({ habitId: 1, 'day': 1 });

// Ensure unique task ID within a habit
taskSchema.index({ habitId: 1, id: 1 }, { unique: true });

module.exports = mongoose.model('Task', taskSchema);
