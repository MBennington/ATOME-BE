const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Upload configuration
const uploadConfig = {
  folder: process.env.CLOUDINARY_FOLDER || 'atome-assets',
  resource_type: 'auto',
  quality: 'auto',
  fetch_format: 'auto',
  transformation: [
    { quality: 'auto' },
    { fetch_format: 'auto' }
  ]
};

// Helper function to upload file to Cloudinary
const uploadToCloudinary = async (file, options = {}) => {
  try {
    const uploadOptions = {
      ...uploadConfig,
      ...options,
      public_id: options.public_id || `${Date.now()}_${Math.random().toString(36).substring(7)}`
    };

    const result = await cloudinary.uploader.upload(file, uploadOptions);
    return {
      success: true,
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        created_at: result.created_at
      }
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function to delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      data: result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function to get optimized URL
const getOptimizedUrl = (publicId, options = {}) => {
  const defaultOptions = {
    quality: 'auto',
    fetch_format: 'auto',
    ...options
  };
  
  return cloudinary.url(publicId, defaultOptions);
};

// Helper function to generate transformation URL
const generateTransformationUrl = (publicId, transformations = []) => {
  return cloudinary.url(publicId, {
    transformation: transformations
  });
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  getOptimizedUrl,
  generateTransformationUrl,
  uploadConfig
};
