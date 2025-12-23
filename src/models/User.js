const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  activeHabits: [{
    habitId: {
      type: String,
      required: true
    },
    habit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    currentDay: {
      type: Number,
      default: 1
    },
    isActive: {
      type: Boolean,
      default: true
    },
    completedDays: [{
      day: {
        type: Number,
        required: true
      },
      taskId: {
        type: String,
        required: false // Optional for backward compatibility
      },
      completedAt: {
        type: Date,
        default: Date.now
      },
      completionTime: {
        type: Number, // Time taken in minutes
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
      }
    }],
    streak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    totalCompletedTasks: {
      type: Number,
      default: 0
    },
    lastCompletedDate: {
      type: Date,
      default: null
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }],
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    }
  },
  savedCollections: [{
    habitId: {
      type: String,
      required: true
    },
    savedAt: {
      type: Date,
      default: Date.now
    }
  }],
  moonstonesCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ 'activeHabits.habitId': 1 });
userSchema.index({ 'savedCollections.habitId': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Instance method to add active habit
userSchema.methods.addActiveHabit = function(habitId, habitObjectId) {
  // Check if habit is already active
  const existingHabit = this.activeHabits.find(habit => 
    habit.habitId === habitId && habit.isActive
  );
  
  if (existingHabit) {
    throw new Error('Habit is already active');
  }
  
  this.activeHabits.push({
    habitId,
    habit: habitObjectId,
    startDate: new Date(),
    currentDay: 1,
    isActive: true,
    completedDays: [],
    streak: 0,
    longestStreak: 0,
    totalCompletedTasks: 0,
    lastCompletedDate: null,
    progressPercentage: 0
  });
  
  return this.save();
};

// Instance method to remove active habit
userSchema.methods.removeActiveHabit = function(habitId) {
  const habitIndex = this.activeHabits.findIndex(habit => 
    habit.habitId === habitId && habit.isActive
  );
  
  if (habitIndex === -1) {
    throw new Error('Active habit not found');
  }
  
  this.activeHabits[habitIndex].isActive = false;
  return this.save();
};

// Instance method to complete a task for a specific day
userSchema.methods.completeTask = async function(habitId, day, taskData = {}) {
  const activeHabit = this.activeHabits.find(habit => 
    habit.habitId === habitId && habit.isActive
  );
  
  if (!activeHabit) {
    throw new Error('Active habit not found');
  }
  
  // Check if this specific task is already completed
  const existingCompletion = activeHabit.completedDays.find(d => 
    d.day === day && d.taskId === taskData.taskId
  );
  
  if (existingCompletion) {
    // Update existing completion
    existingCompletion.completedAt = new Date();
    existingCompletion.completionTime = taskData.completionTime || existingCompletion.completionTime;
    existingCompletion.notes = taskData.notes || existingCompletion.notes;
    existingCompletion.rating = taskData.rating || existingCompletion.rating;
  } else {
    // Add new completion
    activeHabit.completedDays.push({
      day,
      taskId: taskData.taskId || null,
      completedAt: new Date(),
      completionTime: taskData.completionTime || null,
      notes: taskData.notes || '',
      rating: taskData.rating || null
    });
    
    activeHabit.totalCompletedTasks += 1;
    activeHabit.lastCompletedDate = new Date();
  }
  
  // Update streak
  this.updateStreak(activeHabit);
  
  // Update progress percentage
  this.updateProgressPercentage(activeHabit);
  
  // Check if this is the final task of the habit
  const isHabitCompleted = await this.checkHabitCompletion(habitId);
  console.log('🔍 User model completion check:', {
    habitId,
    day,
    isHabitCompleted,
    completedDays: activeHabit.completedDays.length,
    completedDaysList: activeHabit.completedDays.map(d => d.day)
  });
  
  if (isHabitCompleted) {
    console.log('🎉 Habit completed! Marking as completed');
    // Mark habit as completed and inactive
    activeHabit.isCompleted = true;
    activeHabit.isActive = false; // Mark as inactive so it doesn't appear in active habits
    activeHabit.completedAt = new Date();
    
    // Increment moonstones count for completed habit
    this.moonstonesCount = (this.moonstonesCount || 0) + 1;
    
    // Update engaged users progress to 100%
    await this.updateEngagedUsersProgress(habitId, 100);
  }
  
  const savedUser = await this.save();
  
  // Return the completion status along with the saved user
  return {
    user: savedUser,
    isHabitCompleted
  };
};

// Instance method to uncomplete a task for a specific day
userSchema.methods.uncompleteTask = function(habitId, day, taskId = null) {
  const activeHabit = this.activeHabits.find(habit => 
    habit.habitId === habitId && habit.isActive
  );
  
  if (!activeHabit) {
    throw new Error('Active habit not found');
  }
  
  // Find and remove the completed task
  const completionIndex = activeHabit.completedDays.findIndex(d => 
    d.day === day && (taskId ? d.taskId === taskId : true)
  );
  
  if (completionIndex !== -1) {
    activeHabit.completedDays.splice(completionIndex, 1);
    activeHabit.totalCompletedTasks = Math.max(0, activeHabit.totalCompletedTasks - 1);
    
    // Update streak
    this.updateStreak(activeHabit);
    
    // Update progress percentage
    this.updateProgressPercentage(activeHabit);
  }
  
  return this.save();
};

// Instance method to reset a habit to start from day 1
userSchema.methods.resetHabit = function(habitId) {
  const activeHabit = this.activeHabits.find(habit => 
    habit.habitId === habitId && habit.isActive
  );
  
  if (!activeHabit) {
    throw new Error('Active habit not found');
  }
  
  // Reset all progress data
  activeHabit.completedDays = [];
  activeHabit.streak = 0;
  activeHabit.longestStreak = 0;
  activeHabit.totalCompletedTasks = 0;
  activeHabit.progressPercentage = 0;
  activeHabit.lastCompletedDate = null;
  
  // Reset start date to today
  activeHabit.startDate = new Date();
  activeHabit.currentDay = 1;
  
  return this.save();
};

// Instance method to update streak for a habit
userSchema.methods.updateStreak = function(activeHabit) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Sort completed days by day number
  const sortedDays = activeHabit.completedDays.sort((a, b) => a.day - b.day);
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  for (let i = 0; i < sortedDays.length; i++) {
    const day = sortedDays[i];
    const dayDate = new Date(day.completedAt);
    
    if (i === 0 || day.day === sortedDays[i - 1].day + 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
    
    // Check if this is the most recent completion
    if (dayDate.toDateString() === today.toDateString() || 
        dayDate.toDateString() === yesterday.toDateString()) {
      currentStreak = tempStreak;
    }
  }
  
  activeHabit.streak = currentStreak;
  activeHabit.longestStreak = Math.max(activeHabit.longestStreak, longestStreak);
};

// Instance method to update progress percentage
userSchema.methods.updateProgressPercentage = async function(activeHabit) {
  try {
    const Task = mongoose.model('Task');
    const tasks = await Task.find({ habitId: activeHabit.habitId });
    
    if (tasks.length > 0) {
      // Count unique completed tasks (by taskId)
      const completedTaskIds = [...new Set(activeHabit.completedDays.map(d => d.taskId).filter(Boolean))];
      const totalTasks = tasks.length;
      const completedTasks = completedTaskIds.length;
      activeHabit.progressPercentage = Math.round((completedTasks / totalTasks) * 100);
      
      console.log('🔍 Progress calculation:', {
        habitId: activeHabit.habitId,
        totalTasks,
        completedTasks,
        completedTaskIds,
        progressPercentage: activeHabit.progressPercentage
      });
    }
  } catch (error) {
    console.error('Error updating progress percentage:', error);
  }
};

// Instance method to get today's task for a habit
userSchema.methods.getTodayTask = function(habitId) {
  const activeHabit = this.activeHabits.find(habit => 
    habit.habitId === habitId && habit.isActive
  );
  
  if (!activeHabit) {
    return null;
  }
  
  const today = new Date();
  const startDate = new Date(activeHabit.startDate);
  const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
  
  // For multiple tasks per day, we need to check if all tasks are completed
  // This will be handled by the frontend based on individual task completion status
  const completedTasksForDay = activeHabit.completedDays.filter(d => d.day === daysDiff);
  
  return {
    day: daysDiff,
    isCompleted: false, // Don't mark day as completed - let frontend handle individual task status
    completedTasks: completedTasksForDay,
    completedAt: null, // Don't set day-level completion
    completionTime: null, // Don't set day-level completion
    notes: '', // Don't set day-level completion
    rating: null // Don't set day-level completion
  };
};

// Instance method to get habit progress summary
userSchema.methods.getHabitProgress = function(habitId) {
  const activeHabit = this.activeHabits.find(habit => 
    habit.habitId === habitId && habit.isActive
  );
  
  if (!activeHabit) {
    return null;
  }
  
  return {
    habitId: activeHabit.habitId,
    startDate: activeHabit.startDate,
    currentDay: activeHabit.currentDay,
    streak: activeHabit.streak,
    longestStreak: activeHabit.longestStreak,
    totalCompletedTasks: activeHabit.totalCompletedTasks,
    progressPercentage: activeHabit.progressPercentage,
    lastCompletedDate: activeHabit.lastCompletedDate,
    completedDays: activeHabit.completedDays,
    todayTask: this.getTodayTask(habitId)
  };
};

// Instance method to check if a habit is completed
userSchema.methods.checkHabitCompletion = function(habitId) {
  const activeHabit = this.activeHabits.find(habit => 
    habit.habitId === habitId && habit.isActive
  );
  
  if (!activeHabit) {
    console.log('🔍 No active habit found for:', habitId);
    return false;
  }
  
  // Get all tasks for this habit from the database
  const Task = require('./Task');
  return Task.find({ habitId }).then(tasks => {
    if (tasks.length === 0) {
      console.log('🔍 No tasks found for habit:', habitId);
      return false;
    }
    
    // Get unique completed task IDs
    const completedTaskIds = [...new Set(activeHabit.completedDays.map(d => d.taskId).filter(Boolean))];
    const totalTasks = tasks.length;
    const completedTasks = completedTaskIds.length;
    
    // Check if all tasks are completed
    const allTasksCompleted = completedTasks === totalTasks;
    
    console.log('🔍 Habit completion check:', {
      habitId,
      totalTasks,
      completedTasks,
      completedTaskIds,
      allTasksCompleted,
      completedDaysDetails: activeHabit.completedDays.map(d => ({ day: d.day, taskId: d.taskId }))
    });
    
    return allTasksCompleted;
  }).catch((error) => {
    console.error('🔍 Error checking habit completion:', error);
    return false;
  });
};

// Instance method to update engaged users progress
userSchema.methods.updateEngagedUsersProgress = function(habitId, progress) {
  const Habit = require('./Habit');
  return Habit.findOne({ id: habitId }).then(habit => {
    if (!habit) {
      return;
    }
    
    // Find the user in engaged users and update their progress
    const userIndex = habit.engagedUsers.findIndex(user => user.userId === this._id.toString());
    if (userIndex !== -1) {
      habit.engagedUsers[userIndex].progress = progress;
      return habit.save();
    }
  }).catch(error => {
    console.error('Error updating engaged users progress:', error);
  });
};

// Static method to find user by email with password
userSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ email }).select('+password');
};

module.exports = mongoose.model('User', userSchema);
