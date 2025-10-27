const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { upload, uploadSingle, uploadMultiple, deleteFile, getOptimizedImageUrl, getAssetInfo } = require('../controllers/assetController');
const { protect } = require('../middleware/auth');

// Validation middleware for upload
const validateUpload = [
  body('folder').optional().isString().trim().isLength({ min: 1, max: 100 }),
  body('public_id').optional().isString().trim().isLength({ min: 1, max: 100 }),
  body('tags').optional().isString().trim(),
  body('public_ids').optional().isString().trim() // For multiple uploads
];

// Apply authentication to all asset routes
router.use(protect);

// Upload single file
router.post('/upload', 
  upload.single('file'),
  validateUpload,
  uploadSingle
);

// Upload multiple files
router.post('/upload-multiple',
  upload.array('files', 5), // Maximum 5 files
  validateUpload,
  uploadMultiple
);

// Delete file
router.delete('/:publicId', deleteFile);

// Get optimized image URL
router.get('/optimize/:publicId', getOptimizedImageUrl);

// Get asset info
router.get('/info/:publicId', getAssetInfo);

// Health check for assets service
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Assets service is running',
    timestamp: new Date().toISOString(),
    cloudinary_configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  });
});

module.exports = router;
