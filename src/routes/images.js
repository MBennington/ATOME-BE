const express = require('express');
const router = express.Router();
const {
  generateAchievementImage,
  generateCustomAchievementImage,
  getImageInfo
} = require('../controllers/imageController');

// Generate standard achievement image
router.post('/achievement', generateAchievementImage);

// Generate custom achievement image
router.post('/achievement/custom', generateCustomAchievementImage);

// Get image generation info
router.get('/info', getImageInfo);

module.exports = router;
