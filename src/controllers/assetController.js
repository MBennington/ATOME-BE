const multer = require('multer');
const { uploadToCloudinary, deleteFromCloudinary, getOptimizedUrl } = require('../config/cloudinary');
const { validationResult } = require('express-validator');

// Configure multer for memory storage (since we're uploading directly to Cloudinary)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml').split(',');
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 5 // Maximum 5 files per request
  }
});

// Upload single file
const uploadSingle = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    // Convert buffer to base64 for Cloudinary
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    // Upload options
    const uploadOptions = {
      folder: req.body.folder || 'atome-assets',
      public_id: req.body.public_id,
      tags: req.body.tags ? req.body.tags.split(',') : ['atome-upload']
    };

    // Upload to Cloudinary
    const result = await uploadToCloudinary(fileBase64, uploadOptions);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Upload failed',
        error: result.error
      });
    }

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: result.data
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Upload multiple files
const uploadMultiple = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided'
      });
    }

    const uploadPromises = req.files.map(async (file, index) => {
      try {
        // Convert buffer to base64 for Cloudinary
        const fileBase64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        
        // Upload options
        const uploadOptions = {
          folder: req.body.folder || 'atome-assets',
          public_id: req.body.public_ids ? req.body.public_ids.split(',')[index] : undefined,
          tags: req.body.tags ? req.body.tags.split(',') : ['atome-upload']
        };

        return await uploadToCloudinary(fileBase64, uploadOptions);
      } catch (error) {
        return {
          success: false,
          error: error.message,
          filename: file.originalname
        };
      }
    });

    const results = await Promise.all(uploadPromises);
    
    const successful = results.filter(result => result.success);
    const failed = results.filter(result => !result.success);

    res.status(201).json({
      success: true,
      message: `Uploaded ${successful.length} files successfully${failed.length > 0 ? `, ${failed.length} failed` : ''}`,
      data: {
        successful: successful.map(result => result.data),
        failed: failed
      }
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    const result = await deleteFromCloudinary(publicId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Delete failed',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
      data: result.data
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get optimized URL
const getOptimizedImageUrl = async (req, res) => {
  try {
    const { publicId } = req.params;
    const { width, height, quality, format, crop, gravity } = req.query;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    const options = {};
    if (width) options.width = parseInt(width);
    if (height) options.height = parseInt(height);
    if (quality) options.quality = quality;
    if (format) options.fetch_format = format;
    if (crop) options.crop = crop;
    if (gravity) options.gravity = gravity;

    const optimizedUrl = getOptimizedUrl(publicId, options);

    res.status(200).json({
      success: true,
      data: {
        public_id: publicId,
        optimized_url: optimizedUrl,
        options: options
      }
    });

  } catch (error) {
    console.error('Get optimized URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get asset info
const getAssetInfo = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    // This would require additional Cloudinary API calls to get asset info
    // For now, we'll return a basic response
    res.status(200).json({
      success: true,
      message: 'Asset info retrieved successfully',
      data: {
        public_id: publicId,
        // Additional asset info would be fetched from Cloudinary API
      }
    });

  } catch (error) {
    console.error('Get asset info error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  deleteFile,
  getOptimizedImageUrl,
  getAssetInfo
};
