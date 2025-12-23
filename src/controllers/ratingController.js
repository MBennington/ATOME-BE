const HabitRating = require('../models/HabitRating');
const Habit = require('../models/Habit');
const User = require('../models/User');

// @desc    Submit a rating for a completed habit
// @route   POST /api/ratings/submit
// @access  Private
const submitRating = async (req, res, next) => {
  try {
    const { habitId, rating, review } = req.body;

    if (!habitId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Habit ID and rating are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify habit exists
    const habit = await Habit.findOne({ id: habitId });
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    // Check if user has already rated this habit
    const existingRating = await HabitRating.findOne({
      user: req.user.id,
      habitId: habitId
    });

    let habitRating;
    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.review = review || '';
      existingRating.completedAt = new Date();
      // Update user info in case it changed
      existingRating.userName = user.name || null;
      existingRating.userAvatar = user.avatar || null;
      habitRating = await existingRating.save();
    } else {
      // Create new rating
      habitRating = await HabitRating.create({
        user: req.user.id,
        habitId: habitId,
        habit: habit._id,
        rating: rating,
        review: review || '',
        userName: user.name || null,
        userAvatar: user.avatar || null,
        isAnonymized: false
      });
    }

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        rating: habitRating.rating,
        review: habitRating.review,
        createdAt: habitRating.createdAt
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this habit'
      });
    }
    next(error);
  }
};

// @desc    Get rating for a specific habit by current user
// @route   GET /api/ratings/habit/:habitId
// @access  Private
const getHabitRating = async (req, res, next) => {
  try {
    const { habitId } = req.params;

    const rating = await HabitRating.findOne({
      user: req.user.id,
      habitId: habitId
    });

    res.status(200).json({
      success: true,
      data: {
        rating: rating ? rating.rating : null,
        review: rating ? rating.review : null,
        hasRated: !!rating
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all ratings for a specific habit (for displaying average rating)
// @route   GET /api/ratings/habit/:habitId/all
// @access  Public
const getHabitRatings = async (req, res, next) => {
  try {
    const { habitId } = req.params;

    const ratings = await HabitRating.find({ habitId: habitId })
      .select('rating review createdAt userName userAvatar isAnonymized')
      .populate('user', 'name email profileImage avatar')
      .sort({ createdAt: -1 }); // Newest first

    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;

    // Format ratings with user info
    // For anonymized reviews (user deleted), use stored userName and userAvatar
    // For active users, use populated user data
    const formattedRatings = ratings.map(rating => {
      // If user is populated (active user), use that data
      if (rating.user && !rating.isAnonymized) {
        return {
          rating: rating.rating,
          review: rating.review,
          createdAt: rating.createdAt,
          user: {
            name: rating.user.name || 'Anonymous',
            email: rating.user.email,
            profileImage: rating.user.profileImage || rating.user.avatar || null,
            avatar: rating.user.avatar || rating.user.profileImage || null
          }
        };
      } else {
        // For anonymized reviews (deleted users), use stored data
        return {
          rating: rating.rating,
          review: rating.review,
          createdAt: rating.createdAt,
          user: {
            name: rating.userName || 'Anonymous',
            email: null,
            profileImage: rating.userAvatar || null,
            avatar: rating.userAvatar || null
          }
        };
      }
    });

    res.status(200).json({
      success: true,
      data: {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalRatings: totalRatings,
        ratings: formattedRatings
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitRating,
  getHabitRating,
  getHabitRatings
};

