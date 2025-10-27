const imageGenerator = require('../services/imageGenerator');
const htmlImageGenerator = require('../services/htmlImageGenerator');
const modernImageGenerator = require('../services/modernImageGenerator');
const minimalKudosGenerator = require('../services/minimalKudosGenerator');

// Generate achievement image
const generateAchievementImage = async (req, res) => {
  try {
    const { habitTitle, completionTime, username, habitImage } = req.body;
    
    console.log('🎨 CONTROLLER: Image generation request:', { habitTitle, completionTime, username, habitImage });
    console.log('🎨 CONTROLLER: Habit image type:', typeof habitImage);
    console.log('🎨 CONTROLLER: Habit image value:', habitImage);
    console.log('🎨 CONTROLLER: Using MODERN HTML/CSS generator');
    
    if (!habitTitle) {
      return res.status(400).json({
        success: false,
        message: 'Habit title is required'
      });
    }
    
    // Generate the image using minimal kudos generator
    const imageBuffer = await minimalKudosGenerator.generateKudosImage(
      habitTitle,
      completionTime || 'today',
      username || 'User',
      habitImage
    );
    
    // Set response headers
    res.set({
      'Content-Type': 'image/png',
      'Content-Length': imageBuffer.length,
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Content-Disposition': `inline; filename="achievement-${Date.now()}.png"`
    });
    
    // Send the image
    res.send(imageBuffer);
    
  } catch (error) {
    console.error('🎨 Error generating modern achievement image:', error);
    
    // Fallback to canvas-based generator
    try {
      console.log('🎨 CONTROLLER: Falling back to canvas-based generator...');
      const { habitTitle: fallbackHabitTitle, completionTime: fallbackCompletionTime, username: fallbackUsername } = req.body;
      const imageBuffer = await imageGenerator.generateAchievementImage(
        fallbackHabitTitle,
        fallbackCompletionTime || 'today',
        fallbackUsername || 'User'
      );
      
      res.set({
        'Content-Type': 'image/png',
        'Content-Length': imageBuffer.length,
        'Cache-Control': 'public, max-age=3600',
        'Content-Disposition': `inline; filename="achievement-${Date.now()}.png"`
      });
      
      res.send(imageBuffer);
      
    } catch (fallbackError) {
      console.error('🎨 Fallback generator also failed:', fallbackError);
      res.status(500).json({
        success: false,
        message: 'Failed to generate achievement image',
        error: fallbackError.message
      });
    }
  }
};

// Generate custom achievement image
const generateCustomAchievementImage = async (req, res) => {
  try {
    const { 
      habitTitle, 
      completionTime, 
      username,
      width = 500,
      height = 500,
      backgroundColor = '#10B981',
      textColor = '#ffffff',
      accentColor = '#FFD700'
    } = req.body;
    
    console.log('🎨 Custom image generation request:', { 
      habitTitle, 
      completionTime, 
      username,
      width,
      height,
      backgroundColor,
      textColor,
      accentColor
    });
    
    if (!habitTitle) {
      return res.status(400).json({
        success: false,
        message: 'Habit title is required'
      });
    }
    
    // Generate the custom image using HTML/CSS
    const imageBuffer = await htmlImageGenerator.generateCustomImage(
      habitTitle,
      completionTime || 'today',
      username || 'User',
      {
        width: parseInt(width),
        height: parseInt(height),
        backgroundColor,
        textColor,
        accentColor
      }
    );
    
    // Set response headers
    res.set({
      'Content-Type': 'image/png',
      'Content-Length': imageBuffer.length,
      'Cache-Control': 'public, max-age=3600',
      'Content-Disposition': `inline; filename="custom-achievement-${Date.now()}.png"`
    });
    
    // Send the image
    res.send(imageBuffer);
    
  } catch (error) {
    console.error('🎨 Error generating custom achievement image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate custom achievement image',
      error: error.message
    });
  }
};

// Get image generation info
const getImageInfo = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        supportedFormats: ['PNG'],
        defaultSize: {
          width: 500,
          height: 500
        },
        customSizes: {
          minWidth: 200,
          maxWidth: 800,
          minHeight: 300,
          maxHeight: 1200
        },
        availableColors: {
          backgrounds: ['#10B981', '#059669', '#047857', '#1F2937', '#7C3AED', '#DC2626'],
          textColors: ['#ffffff', '#000000', '#F3F4F6'],
          accentColors: ['#FFD700', '#F59E0B', '#EF4444', '#10B981', '#3B82F6']
        },
        endpoints: {
          standard: 'POST /api/images/achievement',
          custom: 'POST /api/images/achievement/custom'
        }
      }
    });
  } catch (error) {
    console.error('🎨 Error getting image info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get image info',
      error: error.message
    });
  }
};

module.exports = {
  generateAchievementImage,
  generateCustomAchievementImage,
  getImageInfo
};
