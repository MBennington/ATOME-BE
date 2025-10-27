const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, 'Habit ID is required'],
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Habit title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Habit description is required'],
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'Habit duration is required'],
    min: [1, 'Duration must be at least 1 day'],
    max: [365, 'Duration cannot exceed 365 days']
  },
  category: {
    type: String,
    required: [true, 'Habit category is required'],
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  subcategories: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.every(subcat => subcat.length > 0 && subcat.length <= 50);
      },
      message: 'Each subcategory must be between 1 and 50 characters'
    }
  },
  difficulty: {
    type: String,
    required: [true, 'Habit difficulty is required'],
    enum: ['beginner', 'intermediate', 'advanced'],
    lowercase: true
  },
  image: {
    type: String,
    required: [true, 'Habit image is required'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  prerequisites: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.every(prereq => prereq.length > 0 && prereq.length <= 200);
      },
      message: 'Each prerequisite must be between 1 and 200 characters'
    }
  },
  videoLink: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty values
        try {
          const urlObj = new URL(v);
          const validDomains = [
            'youtube.com', 'www.youtube.com', 'youtu.be',
            'vimeo.com', 'www.vimeo.com',
            'dailymotion.com', 'www.dailymotion.com',
            'twitch.tv', 'www.twitch.tv',
            'tiktok.com', 'www.tiktok.com',
            'instagram.com', 'www.instagram.com',
            'facebook.com', 'www.facebook.com', 'fb.watch'
          ];
          return validDomains.some(domain => 
            urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
          );
        } catch (error) {
          return false;
        }
      },
      message: 'Video link must be a valid URL from supported platforms (YouTube, Vimeo, Dailymotion, Twitch, TikTok, Instagram, Facebook)'
    }
  },
  countries: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        if (!v || v.length === 0) return true; // Allow empty arrays (global collections)
        // Validate country codes (2-letter ISO codes)
        const validCountryCodes = /^[A-Z]{2}$/;
        return v.every(country => validCountryCodes.test(country));
      },
      message: 'Countries must be valid 2-letter ISO country codes (e.g., "US", "CA", "GB")'
    }
  },
  engagedUsers: {
    type: [{
      userId: {
        type: String,
        required: true,
        trim: true
      },
      username: {
        type: String,
        required: true,
        trim: true
      },
      profileImage: {
        type: String,
        trim: true
      },
      joinedAt: {
        type: Date,
        default: Date.now
      },
      progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      }
    }],
    default: []
  }
}, {
  timestamps: true
});

// Index for better query performance
habitSchema.index({ id: 1 });
habitSchema.index({ category: 1 });
habitSchema.index({ subcategories: 1 });
habitSchema.index({ difficulty: 1 });
habitSchema.index({ isActive: 1 });
habitSchema.index({ isFeatured: 1 });
habitSchema.index({ countries: 1 });
habitSchema.index({ 'engagedUsers.userId': 1 });

// Virtual for getting tasks count
habitSchema.virtual('tasksCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'habit',
  count: true
});

// Ensure virtual fields are serialized
habitSchema.set('toJSON', { virtuals: true });
habitSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Habit', habitSchema);
