const UserPreferences = require('../models/UserPreferences');

// @desc    Save user onboarding preferences
// @route   POST /api/preferences/onboarding
// @access  Private
const saveOnboardingPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { interests, selectedCollections, goals } = req.body;

    // Validate required fields
    if (!interests || !goals) {
      return res.status(400).json({
        success: false,
        message: 'Interests and goals are required'
      });
    }

    // Create or update user preferences
    const preferences = await UserPreferences.findOneAndUpdate(
      { userId },
      {
        userId,
        interests,
        selectedCollections: selectedCollections || [], // Default to empty array if not provided
        goals,
        onboardingCompleted: true
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Preferences saved successfully',
      data: preferences
    });
  } catch (error) {
    console.error('Error saving onboarding preferences:', error);
    next(error);
  }
};

// @desc    Get user preferences
// @route   GET /api/preferences
// @access  Private
const getUserPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const preferences = await UserPreferences.findOne({ userId });

    if (!preferences) {
      return res.status(404).json({
        success: false,
        message: 'User preferences not found'
      });
    }

    res.status(200).json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    next(error);
  }
};

// @desc    Update user preferences
// @route   PUT /api/preferences
// @access  Private
const updateUserPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const preferences = await UserPreferences.findOneAndUpdate(
      { userId },
      updateData,
      { 
        new: true,
        runValidators: true
      }
    );

    if (!preferences) {
      return res.status(404).json({
        success: false,
        message: 'User preferences not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: preferences
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    next(error);
  }
};

// @desc    Get personalized recommendations based on preferences
// @route   GET /api/preferences/recommendations
// @access  Private
const getPersonalizedRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const preferences = await UserPreferences.findOne({ userId });

    if (!preferences) {
      return res.status(404).json({
        success: false,
        message: 'User preferences not found. Please complete onboarding first.'
      });
    }

    // Build recommendation query based on user preferences
    const Habit = require('../models/Habit');
    const filter = { isActive: true };

    // Add category filter if user has interests
    if (preferences.interests.categories.length > 0) {
      filter.category = { $in: preferences.interests.categories };
    }

    // Add difficulty filter if user has preferences
    if (preferences.interests.difficulties.length > 0) {
      filter.difficulty = { $in: preferences.interests.difficulties };
    }

    // Add subcategory filter if user has interests
    if (preferences.interests.subcategories.length > 0) {
      filter.subcategories = { $in: preferences.interests.subcategories };
    }

    const recommendations = await Habit.find(filter)
      .select('title description category subcategories difficulty image duration')
      .limit(20)
      .sort({ isFeatured: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        recommendations,
        preferences: {
          interests: preferences.interests,
          goals: preferences.goals,
          selectedCollections: preferences.selectedCollections
        }
      }
    });
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error);
    next(error);
  }
};

module.exports = {
  saveOnboardingPreferences,
  getUserPreferences,
  updateUserPreferences,
  getPersonalizedRecommendations
};
