const User = require('../models/User');
const Habit = require('../models/Habit');

// @desc    Save a collection to user's favorites
// @route   POST /api/saved-collections
// @access  Private
const saveCollection = async (req, res, next) => {
  try {
    const { habitId } = req.body;
    const userId = req.user.id;

    if (!habitId) {
      return res.status(400).json({
        success: false,
        message: 'Habit ID is required'
      });
    }

    // Check if habit exists
    const habit = await Habit.findOne({ id: habitId });
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit collection not found'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if collection is already saved
    const isAlreadySaved = user.savedCollections.some(
      saved => saved.habitId === habitId
    );

    if (isAlreadySaved) {
      return res.status(400).json({
        success: false,
        message: 'Collection is already saved'
      });
    }

    // Add to saved collections
    user.savedCollections.push({
      habitId,
      savedAt: new Date()
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Collection saved successfully',
      data: {
        habitId,
        savedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a collection from user's favorites
// @route   DELETE /api/saved-collections/:habitId
// @access  Private
const unsaveCollection = async (req, res, next) => {
  try {
    const { habitId } = req.params;
    const userId = req.user.id;

    if (!habitId) {
      return res.status(400).json({
        success: false,
        message: 'Habit ID is required'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if collection is saved
    const savedIndex = user.savedCollections.findIndex(
      saved => saved.habitId === habitId
    );

    if (savedIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Collection is not saved'
      });
    }

    // Remove from saved collections
    user.savedCollections.splice(savedIndex, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Collection removed from favorites',
      data: {
        habitId
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's saved collections
// @route   GET /api/saved-collections
// @access  Private
const getSavedCollections = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user with saved collections
    const user = await User.findById(userId).select('savedCollections');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get habit details for each saved collection
    const savedCollections = await Promise.all(
      user.savedCollections.map(async (saved) => {
        const habit = await Habit.findOne({ id: saved.habitId });
        return {
          habitId: saved.habitId,
          savedAt: saved.savedAt,
          habit: habit
        };
      })
    );

    // Filter out any habits that might have been deleted
    const validCollections = savedCollections.filter(
      collection => collection.habit !== null
    );

    // Sort by savedAt date (latest first)
    validCollections.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

    res.status(200).json({
      success: true,
      count: validCollections.length,
      data: validCollections
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if a collection is saved by user
// @route   GET /api/saved-collections/check/:habitId
// @access  Private
const checkIfSaved = async (req, res, next) => {
  try {
    const { habitId } = req.params;
    const userId = req.user.id;

    if (!habitId) {
      return res.status(400).json({
        success: false,
        message: 'Habit ID is required'
      });
    }

    // Check if user exists
    const user = await User.findById(userId).select('savedCollections');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if collection is saved
    const isSaved = user.savedCollections.some(
      saved => saved.habitId === habitId
    );

    res.status(200).json({
      success: true,
      data: {
        habitId,
        isSaved
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveCollection,
  unsaveCollection,
  getSavedCollections,
  checkIfSaved
};
