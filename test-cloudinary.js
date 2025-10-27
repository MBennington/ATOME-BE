const { cloudinary, uploadToCloudinary } = require('./src/config/cloudinary');
require('dotenv').config();

/**
 * Test script for Cloudinary integration
 * Run with: node test-cloudinary.js
 */

async function testCloudinaryConnection() {
  console.log('🔍 Testing Cloudinary connection...');
  
  try {
    // Test basic connection
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful:', result);
    
    // Test configuration
    console.log('📋 Cloudinary configuration:');
    console.log('  - Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || 'Not set');
    console.log('  - API Key:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set');
    console.log('  - API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set');
    console.log('  - Folder:', process.env.CLOUDINARY_FOLDER || 'Not set');
    
    // Test upload (using a simple test image)
    console.log('\n🔄 Testing upload functionality...');
    
    // Create a simple test image (1x1 pixel PNG)
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const uploadResult = await uploadToCloudinary(testImageBase64, {
      folder: 'test-uploads',
      public_id: `test-${Date.now()}`,
      tags: ['test', 'atome']
    });
    
    if (uploadResult.success) {
      console.log('✅ Upload test successful');
      console.log('  - Public ID:', uploadResult.data.public_id);
      console.log('  - URL:', uploadResult.data.secure_url);
    } else {
      console.log('❌ Upload test failed:', uploadResult.error);
    }
    
  } catch (error) {
    console.error('❌ Cloudinary test failed:', error.message);
    
    if (error.message.includes('Invalid cloud name')) {
      console.log('💡 Tip: Check your CLOUDINARY_CLOUD_NAME environment variable');
    } else if (error.message.includes('Invalid API key')) {
      console.log('💡 Tip: Check your CLOUDINARY_API_KEY environment variable');
    } else if (error.message.includes('Invalid API secret')) {
      console.log('💡 Tip: Check your CLOUDINARY_API_SECRET environment variable');
    }
  }
}

// Check if required environment variables are set
function checkEnvironmentVariables() {
  const required = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.log('❌ Missing required environment variables:');
    missing.forEach(key => console.log(`  - ${key}`));
    console.log('\n💡 Please set these variables in your .env file');
    console.log('📖 See CLOUDINARY_SETUP.md for detailed instructions');
    process.exit(1);
  }
}

// Main execution
async function main() {
  console.log('🚀 ATOME Cloudinary Integration Test\n');
  
  checkEnvironmentVariables();
  await testCloudinaryConnection();
  
  console.log('\n✨ Test completed!');
}

// Run the test
main().catch(console.error);
