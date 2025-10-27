const { getOptimizedUrl, generateTransformationUrl } = require('../config/cloudinary');

/**
 * Generate different image sizes for responsive design
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Additional options
 * @returns {Object} Object containing different size URLs
 */
const generateResponsiveImages = (publicId, options = {}) => {
  const sizes = {
    thumbnail: { width: 150, height: 150, crop: 'fill' },
    small: { width: 300, height: 300, crop: 'fill' },
    medium: { width: 600, height: 600, crop: 'fill' },
    large: { width: 1200, height: 1200, crop: 'fill' },
    original: {}
  };

  const responsiveImages = {};

  Object.keys(sizes).forEach(size => {
    const sizeOptions = { ...sizes[size], ...options };
    responsiveImages[size] = getOptimizedUrl(publicId, sizeOptions);
  });

  return responsiveImages;
};

/**
 * Generate avatar image with different sizes
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Additional options
 * @returns {Object} Object containing avatar URLs
 */
const generateAvatarImages = (publicId, options = {}) => {
  const avatarSizes = {
    xs: { width: 32, height: 32, crop: 'fill', gravity: 'face' },
    sm: { width: 48, height: 48, crop: 'fill', gravity: 'face' },
    md: { width: 64, height: 64, crop: 'fill', gravity: 'face' },
    lg: { width: 96, height: 96, crop: 'fill', gravity: 'face' },
    xl: { width: 128, height: 128, crop: 'fill', gravity: 'face' }
  };

  const avatarImages = {};

  Object.keys(avatarSizes).forEach(size => {
    const sizeOptions = { ...avatarSizes[size], ...options };
    avatarImages[size] = getOptimizedUrl(publicId, sizeOptions);
  });

  return avatarImages;
};

/**
 * Generate habit/task image with different formats
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Additional options
 * @returns {Object} Object containing formatted URLs
 */
const generateHabitImages = (publicId, options = {}) => {
  const habitSizes = {
    card: { width: 300, height: 200, crop: 'fill' },
    preview: { width: 600, height: 400, crop: 'fill' },
    detail: { width: 800, height: 600, crop: 'fill' },
    hero: { width: 1200, height: 600, crop: 'fill' }
  };

  const habitImages = {};

  Object.keys(habitSizes).forEach(size => {
    const sizeOptions = { ...habitSizes[size], ...options };
    habitImages[size] = getOptimizedUrl(publicId, sizeOptions);
  });

  return habitImages;
};

/**
 * Generate image with watermark
 * @param {string} publicId - Cloudinary public ID
 * @param {string} watermarkText - Text to use as watermark
 * @param {Object} options - Additional options
 * @returns {string} URL with watermark
 */
const generateWatermarkedImage = (publicId, watermarkText, options = {}) => {
  const transformations = [
    { quality: 'auto', fetch_format: 'auto' },
    {
      overlay: {
        font_family: 'Arial',
        font_size: 20,
        font_weight: 'bold',
        text: watermarkText,
        color: 'white'
      },
      gravity: 'south_east',
      x: 10,
      y: 10
    }
  ];

  return generateTransformationUrl(publicId, transformations);
};

/**
 * Generate image with rounded corners
 * @param {string} publicId - Cloudinary public ID
 * @param {number} radius - Corner radius
 * @param {Object} options - Additional options
 * @returns {string} URL with rounded corners
 */
const generateRoundedImage = (publicId, radius = 20, options = {}) => {
  const transformations = [
    { quality: 'auto', fetch_format: 'auto' },
    { radius: radius }
  ];

  return generateTransformationUrl(publicId, transformations);
};

/**
 * Generate image with blur effect
 * @param {string} publicId - Cloudinary public ID
 * @param {number} blur - Blur intensity
 * @param {Object} options - Additional options
 * @returns {string} URL with blur effect
 */
const generateBlurredImage = (publicId, blur = 1000, options = {}) => {
  const transformations = [
    { quality: 'auto', fetch_format: 'auto' },
    { effect: `blur:${blur}` }
  ];

  return generateTransformationUrl(publicId, transformations);
};

/**
 * Generate image with sepia effect
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Additional options
 * @returns {string} URL with sepia effect
 */
const generateSepiaImage = (publicId, options = {}) => {
  const transformations = [
    { quality: 'auto', fetch_format: 'auto' },
    { effect: 'sepia' }
  ];

  return generateTransformationUrl(publicId, transformations);
};

/**
 * Generate image with grayscale effect
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Additional options
 * @returns {string} URL with grayscale effect
 */
const generateGrayscaleImage = (publicId, options = {}) => {
  const transformations = [
    { quality: 'auto', fetch_format: 'auto' },
    { effect: 'grayscale' }
  ];

  return generateTransformationUrl(publicId, transformations);
};

/**
 * Generate image with brightness adjustment
 * @param {string} publicId - Cloudinary public ID
 * @param {number} brightness - Brightness level (-100 to 100)
 * @param {Object} options - Additional options
 * @returns {string} URL with brightness adjustment
 */
const generateBrightnessImage = (publicId, brightness = 0, options = {}) => {
  const transformations = [
    { quality: 'auto', fetch_format: 'auto' },
    { effect: `brightness:${brightness}` }
  ];

  return generateTransformationUrl(publicId, transformations);
};

/**
 * Generate image with contrast adjustment
 * @param {string} publicId - Cloudinary public ID
 * @param {number} contrast - Contrast level (-100 to 100)
 * @param {Object} options - Additional options
 * @returns {string} URL with contrast adjustment
 */
const generateContrastImage = (publicId, contrast = 0, options = {}) => {
  const transformations = [
    { quality: 'auto', fetch_format: 'auto' },
    { effect: `contrast:${contrast}` }
  ];

  return generateTransformationUrl(publicId, transformations);
};

/**
 * Generate image with saturation adjustment
 * @param {string} publicId - Cloudinary public ID
 * @param {number} saturation - Saturation level (-100 to 100)
 * @param {Object} options - Additional options
 * @returns {string} URL with saturation adjustment
 */
const generateSaturationImage = (publicId, saturation = 0, options = {}) => {
  const transformations = [
    { quality: 'auto', fetch_format: 'auto' },
    { effect: `saturation:${saturation}` }
  ];

  return generateTransformationUrl(publicId, transformations);
};

/**
 * Generate image with hue adjustment
 * @param {string} publicId - Cloudinary public ID
 * @param {number} hue - Hue level (-100 to 100)
 * @param {Object} options - Additional options
 * @returns {string} URL with hue adjustment
 */
const generateHueImage = (publicId, hue = 0, options = {}) => {
  const transformations = [
    { quality: 'auto', fetch_format: 'auto' },
    { effect: `hue:${hue}` }
  ];

  return generateTransformationUrl(publicId, transformations);
};

/**
 * Generate image with gamma adjustment
 * @param {string} publicId - Cloudinary public ID
 * @param {number} gamma - Gamma level (0.1 to 10)
 * @param {Object} options - Additional options
 * @returns {string} URL with gamma adjustment
 */
const generateGammaImage = (publicId, gamma = 1, options = {}) => {
  const transformations = [
    { quality: 'auto', fetch_format: 'auto' },
    { effect: `gamma:${gamma}` }
  ];

  return generateTransformationUrl(publicId, transformations);
};

/**
 * Generate image with vignette effect
 * @param {string} publicId - Cloudinary public ID
 * @param {number} strength - Vignette strength (0 to 100)
 * @param {Object} options - Additional options
 * @returns {string} URL with vignette effect
 */
const generateVignetteImage = (publicId, strength = 50, options = {}) => {
  const transformations = [
    { quality: 'auto', fetch_format: 'auto' },
    { effect: `vignette:${strength}` }
  ];

  return generateTransformationUrl(publicId, transformations);
};

/**
 * Generate image with shadow effect
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Shadow options
 * @returns {string} URL with shadow effect
 */
const generateShadowImage = (publicId, options = {}) => {
  const shadowOptions = {
    x: options.x || 5,
    y: options.y || 5,
    blur: options.blur || 10,
    color: options.color || 'black',
    opacity: options.opacity || 0.5
  };

  const transformations = [
    { quality: 'auto', fetch_format: 'auto' },
    { effect: `shadow:${shadowOptions.x}:${shadowOptions.y}:${shadowOptions.blur}:${shadowOptions.color}:${shadowOptions.opacity}` }
  ];

  return generateTransformationUrl(publicId, transformations);
};

module.exports = {
  generateResponsiveImages,
  generateAvatarImages,
  generateHabitImages,
  generateWatermarkedImage,
  generateRoundedImage,
  generateBlurredImage,
  generateSepiaImage,
  generateGrayscaleImage,
  generateBrightnessImage,
  generateContrastImage,
  generateSaturationImage,
  generateHueImage,
  generateGammaImage,
  generateVignetteImage,
  generateShadowImage
};
