const Habit = require('../models/Habit');
const Task = require('../models/Task');

// @desc    Get all habits
// @route   GET /api/habits
// @access  Public
const getAllHabits = async (req, res, next) => {
  try {
    const { category, subcategory, difficulty, featured, includeInactive, country } = req.query;
    
    // Build filter object
    const filter = {};
    
    // Only filter by isActive if includeInactive is not true
    if (includeInactive !== 'true') {
      filter.isActive = true;
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (subcategory) {
      filter.subcategories = subcategory;
    }
    
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    // Country-based filtering
    if (country) {
      // Find habits that are either global (no countries specified) or specific to the user's country
      filter.$or = [
        { countries: { $size: 0 } }, // Global habits (empty countries array)
        { countries: country } // Country-specific habits
      ];
    }

    const habits = await Habit.find(filter)
      .sort({ sortOrder: 1, createdAt: 1 })
      .populate('tasksCount');

    res.status(200).json({
      success: true,
      count: habits.length,
      data: habits
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single habit
// @route   GET /api/habits/:id
// @access  Public
const getHabitById = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ 
      id: req.params.id, 
      isActive: true 
    });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    res.status(200).json({
      success: true,
      data: habit
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get habit with tasks
// @route   GET /api/habits/:id/tasks
// @access  Public
const getHabitWithTasks = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ 
      id: req.params.id, 
      isActive: true 
    });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    const tasks = await Task.find({ 
      habitId: req.params.id, 
      isActive: true 
    }).sort({ day: 1, sortOrder: 1 });

    console.log('🔍 Habit data being returned:', JSON.stringify(habit, null, 2));
    console.log('🔍 Prerequisites in habit:', habit.prerequisites);

    res.status(200).json({
      success: true,
      data: {
        habit,
        tasks
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks for a specific day
// @route   GET /api/habits/:id/tasks/day/:day
// @access  Public
const getTasksByDay = async (req, res, next) => {
  try {
    const { id, day } = req.params;
    
    const habit = await Habit.findOne({ 
      id: id, 
      isActive: true 
    });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    const tasks = await Task.find({ 
      habitId: id, 
      day: { $in: [parseInt(day)] },
      isActive: true 
    }).sort({ sortOrder: 1 });

    res.status(200).json({
      success: true,
      data: {
        habit,
        tasks
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks for a specific week
// @route   GET /api/habits/:id/tasks/week/:week
// @access  Public
const getTasksByWeek = async (req, res, next) => {
  try {
    const { id, week } = req.params;
    
    const habit = await Habit.findOne({ 
      id: id, 
      isActive: true 
    });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    const tasks = await Task.find({ 
      habitId: id, 
      week: parseInt(week),
      isActive: true 
    }).sort({ day: 1, sortOrder: 1 });

    // Get unique week goals
    const weekGoals = [...new Set(tasks.map(task => task.weekGoal))];

    res.status(200).json({
      success: true,
      data: {
        habit,
        tasks,
        weekGoals
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Public
const getAllTasks = async (req, res, next) => {
  try {
    const { habitId, day, week, category } = req.query;
    
    // Build filter object
    const filter = { isActive: true };
    
    if (habitId) {
      filter.habitId = habitId;
    }
    
    if (day) {
      filter.day = parseInt(day);
    }
    
    if (week) {
      filter.week = parseInt(week);
    }
    
    if (category) {
      filter.category = category;
    }

    const tasks = await Task.find(filter)
      .populate('habit', 'id title category difficulty')
      .sort({ habitId: 1, day: 1, sortOrder: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Public
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({ 
      id: req.params.id, 
      isActive: true 
    }).populate('habit', 'id title category difficulty');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get habit categories (legacy)
// @route   GET /api/habits/categories-legacy
// @access  Public
const getHabitCategories = async (req, res, next) => {
  try {
    const categories = await Habit.distinct('category', { isActive: true });
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get habit difficulties
// @route   GET /api/habits/difficulties
// @access  Public
const getHabitDifficulties = async (req, res, next) => {
  try {
    const difficulties = await Habit.distinct('difficulty', { isActive: true });
    
    res.status(200).json({
      success: true,
      data: difficulties
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get habit subcategories
// @route   GET /api/habits/subcategories
// @access  Public
const getHabitSubcategories = async (req, res, next) => {
  try {
    const { category } = req.query;
    
    // Build filter for active habits
    const filter = { isActive: true };
    if (category) {
      filter.category = category;
    }
    
    // Get all subcategories from active habits
    const subcategories = await Habit.distinct('subcategories', filter);
    
    // Flatten the array and remove duplicates
    const flattenedSubcategories = [...new Set(subcategories.flat())];
    
    res.status(200).json({
      success: true,
      data: flattenedSubcategories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search habits with text search
// @route   GET /api/habits/search
// @access  Public
const searchHabits = async (req, res, next) => {
  try {
    const { q, category, subcategory, difficulty, country } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Build base filter
    const filter = { isActive: true };
    
    // Add category filter
    if (category) {
      filter.category = category;
    }
    
    // Add subcategory filter
    if (subcategory) {
      filter.subcategories = subcategory;
    }
    
    // Add difficulty filter
    if (difficulty) {
      filter.difficulty = difficulty;
    }

    // Add country filter
    if (country) {
      filter.$or = [
        { countries: { $size: 0 } }, // Global habits
        { countries: country } // Country-specific habits
      ];
    }

    // Create text search query
    const searchQuery = {
      $and: [
        filter,
        {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { category: { $regex: q, $options: 'i' } },
            { subcategories: { $regex: q, $options: 'i' } },
            { prerequisites: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    };

    const habits = await Habit.find(searchQuery)
      .sort({ 
        // Prioritize title matches, then category matches, then creation date
        title: 1,
        category: 1,
        createdAt: -1 
      })
      .populate('tasksCount')
      .limit(50); // Limit results for performance

    // Calculate relevance scores
    const scoredHabits = habits.map(habit => {
      let score = 0;
      const query = q.toLowerCase();
      
      // Title match (highest priority)
      if (habit.title.toLowerCase().includes(query)) {
        score += 100;
      }
      
      // Exact title match (even higher priority)
      if (habit.title.toLowerCase() === query) {
        score += 200;
      }
      
      // Description match
      if (habit.description.toLowerCase().includes(query)) {
        score += 50;
      }
      
      // Category match
      if (habit.category.toLowerCase().includes(query)) {
        score += 30;
      }
      
      // Subcategory match
      if (habit.subcategories && habit.subcategories.some(sub => 
        sub.toLowerCase().includes(query))) {
        score += 40;
      }
      
      // Prerequisites match
      if (habit.prerequisites && habit.prerequisites.some(prereq => 
        prereq.toLowerCase().includes(query))) {
        score += 20;
      }

      return {
        ...habit.toObject(),
        searchScore: score
      };
    });

    // Sort by relevance score
    scoredHabits.sort((a, b) => b.searchScore - a.searchScore);

    res.status(200).json({
      success: true,
      count: scoredHabits.length,
      data: scoredHabits,
      query: q
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a habit
// @route   PUT /api/habits/:id
// @access  Public (for now, can be made private later)
const updateHabit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const habit = await Habit.findOneAndUpdate(
      { id: id },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: habit
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a habit (soft delete)
// @route   DELETE /api/habits/:id
// @access  Public (for now, can be made private later)
const deleteHabit = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find the habit first
    const habit = await Habit.findOne({ id: id });
    
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }
    
    // Soft delete by setting isActive to false
    // This preserves the data but makes it inactive
    const deletedHabit = await Habit.findOneAndUpdate(
      { id: id },
      { isActive: false },
      { new: true }
    );
    
    // Also deactivate all related tasks
    await Task.updateMany(
      { habitId: id },
      { isActive: false }
    );
    
    res.status(200).json({
      success: true,
      message: 'Habit deleted successfully',
      data: deletedHabit
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Hard delete a habit (permanent deletion with Cloudinary cleanup)
// @route   DELETE /api/habits/:id/hard
// @access  Public (for now, can be made private later)
const hardDeleteHabit = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find the habit first
    const habit = await Habit.findOne({ id: id });
    
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }
    
    // Delete Cloudinary images if they exist
    const { deleteFromCloudinary } = require('../config/cloudinary');
    const deletedImages = [];
    
    if (habit.image) {
      try {
        // Extract public_id from Cloudinary URL or use the image field directly
        let publicId = habit.image;
        
        // If it's a full Cloudinary URL, extract the public_id
        if (habit.image.includes('cloudinary.com')) {
          const urlParts = habit.image.split('/');
          const filename = urlParts[urlParts.length - 1];
          publicId = filename.split('.')[0]; // Remove file extension
        }
        
        const deleteResult = await deleteFromCloudinary(publicId);
        if (deleteResult.success) {
          deletedImages.push(publicId);
          console.log(`✅ Deleted Cloudinary image: ${publicId}`);
        } else {
          console.log(`⚠️ Failed to delete Cloudinary image: ${publicId}`, deleteResult.error);
        }
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion error:', cloudinaryError);
        // Continue with habit deletion even if image deletion fails
      }
    }
    
    // Permanently delete the habit from database
    const deletedHabit = await Habit.findOneAndDelete({ id: id });
    
    // Also permanently delete all related tasks
    const deletedTasks = await Task.deleteMany({ habitId: id });
    
    res.status(200).json({
      success: true,
      message: 'Habit permanently deleted successfully',
      data: {
        habit: deletedHabit,
        deletedTasksCount: deletedTasks.deletedCount,
        deletedImages: deletedImages
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unique categories from habits
// @route   GET /api/habits/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    // Use MongoDB aggregation for maximum efficiency
    const categories = await Habit.aggregate([
      { $match: { isActive: true } }, // Only active habits
      { $group: { _id: '$category' } }, // Group by category
      { $sort: { _id: 1 } }, // Sort alphabetically
      { $project: { _id: 0, name: '$_id' } } // Rename _id to name
    ]);

    // Map categories to include display info and icons
    const categoryMap = {
      'Mind & Wellbeing': { icon: 'brain', color: '#8B5CF6' },
      'Minds & Wellbeing': { icon: 'brain', color: '#8B5CF6' }, // Handle typo in DB
      'Learning & Growth': { icon: 'school', color: '#06B6D4' },
      'Health & Fitness': { icon: 'fitness', color: '#10B981' },
      'productivity': { icon: 'flash', color: '#F59E0B' },
      'wellness': { icon: 'leaf', color: '#8B5CF6' },
      'learning': { icon: 'book', color: '#06B6D4' },
      'nutrition': { icon: 'restaurant', color: '#10B981' },
      'health': { icon: 'medical', color: '#10B981' },
      'fitness': { icon: 'barbell', color: '#10B981' },
      'mindfulness': { icon: 'flower', color: '#8B5CF6' },
      'morning-routine': { icon: 'sunny', color: '#F59E0B' }
    };

    const enrichedCategories = categories.map(cat => ({
      name: cat.name,
      icon: categoryMap[cat.name]?.icon || 'folder',
      color: categoryMap[cat.name]?.color || '#6B7280'
    }));

    res.status(200).json({
      success: true,
      data: enrichedCategories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create multiple habits (bulk)
// @route   POST /api/habits/bulk
// @access  Public
const createBulkHabits = async (req, res, next) => {
  try {
    const { habits } = req.body;
    
    console.log('🔍 Received habits data:', JSON.stringify(habits, null, 2));
    
    if (!habits || !Array.isArray(habits)) {
      return res.status(400).json({
        success: false,
        message: 'Habits array is required'
      });
    }

    // Validate each habit
    for (const habit of habits) {
      if (!habit.id || !habit.title || !habit.description) {
        return res.status(400).json({
          success: false,
          message: 'Each habit must have id, title, and description'
        });
      }
      
      // Validate prerequisites if provided
      if (habit.prerequisites && !Array.isArray(habit.prerequisites)) {
        return res.status(400).json({
          success: false,
          message: 'Prerequisites must be an array of strings'
        });
      }
    }

    // Create habits with individual error handling
    const createdHabits = [];
    const errors = [];
    
    for (const habitData of habits) {
      try {
        console.log('🔍 Creating habit:', habitData.id, 'with category:', habitData.category);
        console.log('🔍 Video link in habit data:', habitData.videoLink);
        console.log('🔍 Full habit data being saved:', JSON.stringify(habitData, null, 2));
        const habit = new Habit(habitData);
        const savedHabit = await habit.save();
        console.log('🔍 Saved habit videoLink:', savedHabit.videoLink);
        console.log('🔍 Full saved habit object:', JSON.stringify(savedHabit.toObject(), null, 2));
        createdHabits.push(savedHabit);
        console.log('✅ Successfully created habit:', savedHabit.id);
        console.log('📊 Created habits array length:', createdHabits.length);
      } catch (error) {
        console.error('❌ Error creating habit:', habitData.id, error.message);
        if (error.name === 'ValidationError') {
          console.error('Validation errors:', error.errors);
        }
        errors.push({
          habitId: habitData.id,
          error: error.message
        });
      }
    }
    
    console.log('📊 Final createdHabits array:', createdHabits.length, 'habits');
    console.log('📊 Final errors array:', errors.length, 'errors');

    if (createdHabits.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create any habits',
        errors: errors
      });
    }

    console.log('📊 Sending response with', createdHabits.length, 'created habits');
    console.log('📊 Created habits data:', createdHabits.map(h => ({ id: h.id, category: h.category })));
    
    res.status(201).json({
      success: true,
      message: `Successfully created ${createdHabits.length} habits`,
      data: createdHabits,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('❌ Bulk habit creation error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Some habits already exist (duplicate id)'
      });
    }
    next(error);
  }
};

// @desc    Get habits by country
// @route   GET /api/habits/country/:countryCode
// @access  Public
const getHabitsByCountry = async (req, res, next) => {
  try {
    const { countryCode } = req.params;
    const { category, difficulty, featured } = req.query;
    
    // Validate country code format (2-letter ISO code)
    if (!/^[A-Z]{2}$/.test(countryCode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid country code. Must be a 2-letter ISO code (e.g., US, CA, GB)'
      });
    }
    
    // Build filter object
    const filter = {
      isActive: true,
      $or: [
        { countries: { $size: 0 } }, // Global habits (empty countries array)
        { countries: countryCode } // Country-specific habits
      ]
    };
    
    if (category) {
      filter.category = category;
    }
    
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    const habits = await Habit.find(filter)
      .sort({ sortOrder: 1, createdAt: 1 })
      .populate('tasksCount');

    // Separate global and country-specific habits
    const globalHabits = habits.filter(habit => habit.countries.length === 0);
    const countrySpecificHabits = habits.filter(habit => habit.countries.includes(countryCode));

    res.status(200).json({
      success: true,
      count: habits.length,
      data: {
        global: globalHabits,
        countrySpecific: countrySpecificHabits,
        all: habits
      },
      countryCode: countryCode
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get habits for onboarding preferences
// @route   GET /api/habits/onboarding-preferences
// @access  Public
const getOnboardingPreferences = async (req, res, next) => {
  try {
    // Get random featured habits for collection selection
    const featuredHabits = await Habit.find({ 
      isActive: true, 
      isFeatured: true 
    })
    .select('title description category subcategories difficulty image')
    .limit(12)
    .sort({ createdAt: -1 });

    // Get all available categories
    const categories = await Habit.distinct('category', { isActive: true });
    
    // Get all available difficulties
    const difficulties = await Habit.distinct('difficulty', { isActive: true });
    
    // Get all available subcategories (flattened)
    const subcategories = await Habit.distinct('subcategories', { isActive: true });
    const flattenedSubcategories = [...new Set(subcategories.flat())];

    res.status(200).json({
      success: true,
      data: {
        categories: categories.sort(),
        difficulties: difficulties.sort(),
        subcategories: flattenedSubcategories.sort(),
        featuredCollections: featuredHabits
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get personalized categories based on user preferences
// @route   GET /api/habits/categories/personalized
// @access  Private
const getPersonalizedCategories = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const userId = req.user.id;
    
    // Get user preferences
    const UserPreferences = require('../models/UserPreferences');
    const userPreferences = await UserPreferences.findOne({ userId });
    
    console.log('🔍 User ID:', userId);
    console.log('🔍 User preferences found:', userPreferences);
    
    // Get all categories with habit counts
    const categoriesWithCounts = await Habit.aggregate([
      { $match: { isActive: true } },
      { $group: { 
        _id: '$category', 
        habitCount: { $sum: 1 },
        featuredCount: { $sum: { $cond: ['$isFeatured', 1, 0] } }
      }},
      { $project: { 
        _id: 0, 
        name: '$_id', 
        habitCount: 1,
        featuredCount: 1
      }}
    ]);

    // Map categories to include display info and icons
    const categoryMap = {
      'Mind & Wellbeing': { icon: 'brain', color: '#8B5CF6' },
      'Minds & Wellbeing': { icon: 'brain', color: '#8B5CF6' },
      'Learning & Growth': { icon: 'school', color: '#06B6D4' },
      'Health & Fitness': { icon: 'fitness', color: '#10B981' },
      'Productivity': { icon: 'flash', color: '#F59E0B' },
      'Wellness': { icon: 'leaf', color: '#8B5CF6' },
      'Learning': { icon: 'book', color: '#06B6D4' },
      'Nutrition': { icon: 'restaurant', color: '#10B981' },
      'Health': { icon: 'medical', color: '#10B981' },
      'Fitness': { icon: 'barbell', color: '#10B981' },
      'Mindfulness': { icon: 'flower', color: '#8B5CF6' },
      'Morning Routine': { icon: 'sunny', color: '#F59E0B' },
      'Custom Category': { icon: 'folder', color: '#6B7280' },
      'Organization': { icon: 'clipboard', color: '#8B5CF6' },
      'Personal Growth': { icon: 'trending-up', color: '#10B981' }
    };

    // Enrich categories with display info
    const enrichedCategories = categoriesWithCounts.map(cat => ({
      name: cat.name,
      icon: categoryMap[cat.name]?.icon || 'folder',
      color: categoryMap[cat.name]?.color || '#6B7280',
      habitCount: cat.habitCount,
      featuredCount: cat.featuredCount
    }));

    // Apply personalized sorting if user has preferences
    if (userPreferences && userPreferences.interests && userPreferences.interests.categories.length > 0) {
      const userCategories = userPreferences.interests.categories;
      console.log('🎯 User preferred categories:', userCategories);
      
      // Create personalized order
      const personalizedCategories = [];
      const remainingCategories = [...enrichedCategories];
      
      // Add user's preferred categories first (in order of preference)
      userCategories.forEach(userCategory => {
        const categoryIndex = remainingCategories.findIndex(cat => 
          cat.name.toLowerCase() === userCategory.toLowerCase()
        );
        if (categoryIndex !== -1) {
          personalizedCategories.push(remainingCategories[categoryIndex]);
          remainingCategories.splice(categoryIndex, 1);
          console.log('✅ Added preferred category:', userCategory);
        } else {
          console.log('❌ Preferred category not found:', userCategory);
        }
      });
      
      // Add remaining categories sorted by habit count (most popular first)
      remainingCategories.sort((a, b) => b.habitCount - a.habitCount);
      personalizedCategories.push(...remainingCategories);
      
      console.log('📊 Final personalized categories order:', personalizedCategories.map(c => c.name));
      
      res.status(200).json({
        success: true,
        data: personalizedCategories,
        personalized: true
      });
    } else {
      console.log('📊 No user preferences found, using popularity sorting');
      // No preferences - sort by habit count (most popular first)
      enrichedCategories.sort((a, b) => b.habitCount - a.habitCount);
      
      res.status(200).json({
        success: true,
        data: enrichedCategories,
        personalized: false
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllHabits,
  getHabitById,
  getHabitWithTasks,
  getTasksByDay,
  getTasksByWeek,
  getAllTasks,
  getTaskById,
  getHabitCategories,
  getHabitDifficulties,
  getHabitSubcategories,
  searchHabits,
  updateHabit,
  deleteHabit,
  hardDeleteHabit,
  getCategories,
  createBulkHabits,
  getHabitsByCountry,
  getOnboardingPreferences,
  getPersonalizedCategories
};

// @desc    Add user to engaged users
// @route   POST /api/habits/:id/engage
// @access  Private
const addEngagedUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, username, profileImage } = req.body;

    if (!userId || !username) {
      return res.status(400).json({
        success: false,
        message: 'User ID and username are required'
      });
    }

    const habit = await Habit.findOne({ id });
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    // Check if user is already engaged
    const existingUser = habit.engagedUsers.find(user => user.userId === userId);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User is already engaged with this habit'
      });
    }

    // Add user to engaged users
    habit.engagedUsers.push({
      userId,
      username,
      profileImage: profileImage || null,
      joinedAt: new Date(),
      progress: 0
    });

    await habit.save();

    res.status(200).json({
      success: true,
      message: 'User added to engaged users',
      data: habit.engagedUsers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove user from engaged users
// @route   DELETE /api/habits/:id/engage/:userId
// @access  Private
const removeEngagedUser = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    const habit = await Habit.findOne({ id });
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    // Remove user from engaged users
    habit.engagedUsers = habit.engagedUsers.filter(user => user.userId !== userId);
    await habit.save();

    res.status(200).json({
      success: true,
      message: 'User removed from engaged users',
      data: habit.engagedUsers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user progress
// @route   PUT /api/habits/:id/engage/:userId/progress
// @access  Private
const updateUserProgress = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const { progress } = req.body;

    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: 'Progress must be between 0 and 100'
      });
    }

    const habit = await Habit.findOne({ id });
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    const userIndex = habit.engagedUsers.findIndex(user => user.userId === userId);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found in engaged users'
      });
    }

    habit.engagedUsers[userIndex].progress = progress;
    await habit.save();

    res.status(200).json({
      success: true,
      message: 'User progress updated',
      data: habit.engagedUsers[userIndex]
    });
  } catch (error) {
    next(error);
  }
};

// Add the new functions to exports
module.exports.addEngagedUser = addEngagedUser;
module.exports.removeEngagedUser = removeEngagedUser;
module.exports.updateUserProgress = updateUserProgress;
