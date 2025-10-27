const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAvatar,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile
} = require('../middleware/validation');

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, validateUpdateProfile, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/upload-avatar', protect, uploadSingle('avatar'), uploadAvatar);
router.delete('/delete-avatar', protect, deleteAvatar);
router.post('/logout', protect, logout);

module.exports = router;
