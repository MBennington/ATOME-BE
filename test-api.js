const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'TestPass123'
};

async function testAPI() {
  console.log('🧪 Testing ATOME Backend API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data.message);
    console.log('');

    // Test 2: API Info
    console.log('2. Testing API Info...');
    const infoResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ API Info:', infoResponse.data.message);
    console.log('');

    // Test 3: Register User
    console.log('3. Testing User Registration...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
      console.log('✅ User Registration:', registerResponse.data.message);
      console.log('   User ID:', registerResponse.data.data.user.id);
      console.log('   Token:', registerResponse.data.data.token.substring(0, 20) + '...');
      console.log('');

      const token = registerResponse.data.data.token;

      // Test 4: Get Current User
      console.log('4. Testing Get Current User...');
      const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Get Current User:', meResponse.data.data.user.name);
      console.log('');

      // Test 5: Update Profile
      console.log('5. Testing Update Profile...');
      const updateResponse = await axios.put(`${BASE_URL}/auth/profile`, {
        name: 'Updated Test User',
        preferences: { theme: 'dark' }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Update Profile:', updateResponse.data.message);
      console.log('   Updated Name:', updateResponse.data.data.user.name);
      console.log('   Theme:', updateResponse.data.data.user.preferences.theme);
      console.log('');

      // Test 6: Login User
      console.log('6. Testing User Login...');
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      console.log('✅ User Login:', loginResponse.data.message);
      console.log('   User ID:', loginResponse.data.data.user.id);
      console.log('');

      // Test 7: Logout
      console.log('7. Testing User Logout...');
      const logoutResponse = await axios.post(`${BASE_URL}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ User Logout:', logoutResponse.data.message);
      console.log('');

      console.log('🎉 All tests passed successfully!');
      console.log('\n📋 API Endpoints Summary:');
      console.log('   ✅ Health Check: GET /api/health');
      console.log('   ✅ API Info: GET /api/');
      console.log('   ✅ Register: POST /api/auth/register');
      console.log('   ✅ Login: POST /api/auth/login');
      console.log('   ✅ Get Me: GET /api/auth/me');
      console.log('   ✅ Update Profile: PUT /api/auth/profile');
      console.log('   ✅ Logout: POST /api/auth/logout');

    } catch (registerError) {
      if (registerError.response?.status === 400 && registerError.response?.data?.message?.includes('already exists')) {
        console.log('⚠️  User already exists, testing login instead...');
        
        // Test Login with existing user
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        console.log('✅ User Login:', loginResponse.data.message);
        console.log('   User ID:', loginResponse.data.data.user.id);
        console.log('');
        console.log('🎉 Login test passed!');
      } else {
        throw registerError;
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('\n💡 Make sure the server is running: npm run dev');
  }
}

// Run tests
testAPI();
