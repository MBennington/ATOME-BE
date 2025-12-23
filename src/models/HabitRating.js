const mongoose = require('mongoose');

const habitRatingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Made optional to support anonymized reviews
  },
  habitId: {
    type: String,
    required: true,
    trim: true
  },
  habit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: ''
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  // Store user info at time of review for display when user is deleted
  userName: {
    type: String,
    trim: true,
    default: null
  },
  userAvatar: {
    type: String,
    trim: true,
    default: null
  },
  isAnonymized: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure one rating per user per habit (only for non-anonymized reviews)
// Use sparse index so it only applies when user is not null
// This allows multiple anonymized reviews (user: null) but prevents duplicate active user ratings
habitRatingSchema.index({ user: 1, habitId: 1 }, { unique: true, sparse: true });

// Index for efficient queries
habitRatingSchema.index({ habitId: 1 });
habitRatingSchema.index({ habit: 1 });
habitRatingSchema.index({ rating: 1 });

module.exports = mongoose.model('HabitRating', habitRatingSchema);

