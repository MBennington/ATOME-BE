const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    await user.updateLastLogin();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          preferences: user.preferences,
          activeHabits: user.activeHabits,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user with password
    const user = await User.findByEmailWithPassword(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    await user.updateLastLogin();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          preferences: user.preferences,
          activeHabits: user.activeHabits,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          preferences: user.preferences,
          activeHabits: user.activeHabits,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, preferences, avatar } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };
    if (avatar !== undefined) updateData.avatar = avatar; // Allow null to delete avatar

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          preferences: user.preferences,
          activeHabits: user.activeHabits,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile picture
// @route   POST /api/auth/upload-avatar
// @access  Private
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get current user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old avatar if exists
    if (user.avatar) {
      try {
        // Extract public_id from the URL
        const urlParts = user.avatar.split('/');
        const publicId = urlParts[urlParts.length - 1].split('.')[0];
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.error('Error deleting old avatar:', error);
        // Continue with upload even if deletion fails
      }
    }

    // Upload new avatar to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer, {
      folder: 'atome-avatars',
      resource_type: 'image',
      transformation: [
        { width: 300, height: 300, crop: 'fill', gravity: 'face' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image',
        error: uploadResult.error
      });
    }

    // Update user avatar
    user.avatar = uploadResult.data.secure_url;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        avatar: user.avatar,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          preferences: user.preferences,
          activeHabits: user.activeHabits,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete profile picture
// @route   DELETE /api/auth/delete-avatar
// @access  Private
const deleteAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.avatar) {
      return res.status(400).json({
        success: false,
        message: 'No profile picture to delete'
      });
    }

    // Delete from Cloudinary
    try {
      const urlParts = user.avatar.split('/');
      const publicId = urlParts[urlParts.length - 1].split('.')[0];
      await deleteFromCloudinary(publicId);
    } catch (error) {
      console.error('Error deleting avatar from Cloudinary:', error);
      // Continue with database update even if Cloudinary deletion fails
    }

    // Remove avatar from user
    user.avatar = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture deleted successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          preferences: user.preferences,
          activeHabits: user.activeHabits,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account and all related data
// @route   DELETE /api/auth/delete-account
// @access  Private
const deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userId = user._id;
    const userName = user.name;

    // Delete user's avatar from Cloudinary if exists
    if (user.avatar) {
      try {
        const urlParts = user.avatar.split('/');
        const publicId = urlParts[urlParts.length - 1].split('.')[0];
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.error('Error deleting avatar from Cloudinary:', error);
        // Continue with account deletion even if avatar deletion fails
      }
    }

    // Delete all user's notes
    const Note = require('../models/Note');
    await Note.deleteMany({ user: userId });

    // Anonymize user's ratings instead of deleting them
    // This preserves reviews for collections even after account deletion
    const HabitRating = require('../models/HabitRating');
    await HabitRating.updateMany(
      { user: userId },
      {
        $set: {
          user: null,
          isAnonymized: true
          // userName and userAvatar are already stored, so they remain
        }
      }
    );

    // Delete user preferences
    const UserPreferences = require('../models/UserPreferences');
    await UserPreferences.deleteOne({ userId: userId });

    // Remove user from engagedUsers in all habits
    const Habit = require('../models/Habit');
    await Habit.updateMany(
      { 'engagedUsers.userId': userId.toString() },
      { $pull: { engagedUsers: { userId: userId.toString() } } }
    );

    // Delete the user account
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'Account and all related data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAvatar,
  logout,
  deleteAccount
};
