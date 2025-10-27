const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  interests: {
    categories: [{
      type: String
    }],
    subcategories: [{
      type: String
    }],
    difficulties: [{
      type: String,
      enum: ['beginner', 'intermediate', 'advanced']
    }]
  },
  selectedCollections: [{
    habitId: {
      type: String
    },
    title: {
      type: String
    },
    category: {
      type: String
    },
    image: {
      type: String
    }
  }],
  goals: {
    primaryGoal: {
      type: String,
      enum: ['health', 'productivity', 'learning', 'wellness', 'fitness', 'mindfulness', 'other'],
      default: 'wellness'
    },
    timeCommitment: {
      type: String,
      enum: ['5-15min', '15-30min', '30-60min', '1hour+'],
      default: '15-30min'
    },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    }
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
userPreferencesSchema.index({ userId: 1 });
userPreferencesSchema.index({ 'interests.categories': 1 });
userPreferencesSchema.index({ 'interests.difficulties': 1 });

// Update the updatedAt field before saving
userPreferencesSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('UserPreferences', userPreferencesSchema);
