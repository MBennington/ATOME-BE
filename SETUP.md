# ATOME Backend Setup Guide

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18.0.0 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 2. Installation
```bash
cd backend
npm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp env.example .env

# Edit .env with your settings
# At minimum, set:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (a secure random string)
```

### 4. Start Development Server
```bash
# Option 1: Using npm script
npm run dev

# Option 2: Using PowerShell script (Windows)
.\start-dev.ps1

# Option 3: Using batch script (Windows)
start-dev.bat
```

### 5. Test the API
```bash
# Run the test script (make sure server is running)
node test-api.js
```

## 📋 Environment Variables

### Required Variables
```env
MONGODB_URI=mongodb://localhost:27017/atome
JWT_SECRET=your-super-secret-jwt-key
```

### Optional Variables
```env
PORT=5000
NODE_ENV=development
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🗄️ Database Setup

### Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use: `MONGODB_URI=mongodb://localhost:27017/atome`

### MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Use: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/atome`

## 🔧 Development Commands

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests (when implemented)
npm test

# Test API endpoints
node test-api.js
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout user

### General
- `GET /api/health` - Health check
- `GET /api/` - API information

## 🔐 Authentication Flow

1. **Register**: `POST /api/auth/register` with name, email, password
2. **Login**: `POST /api/auth/login` with email, password
3. **Use Token**: Include `Authorization: Bearer <token>` in requests
4. **Protected Routes**: All routes except register/login require authentication

## 🧪 Testing

The `test-api.js` script will test all endpoints:
```bash
node test-api.js
```

Expected output:
```
🧪 Testing ATOME Backend API...

1. Testing Health Check...
✅ Health Check: ATOME Backend API is running

2. Testing API Info...
✅ API Info: Welcome to ATOME Backend API

3. Testing User Registration...
✅ User Registration: User registered successfully

4. Testing Get Current User...
✅ Get Current User: Test User

5. Testing Update Profile...
✅ Update Profile: Profile updated successfully

6. Testing User Login...
✅ User Login: Login successful

7. Testing User Logout...
✅ User Logout: Logged out successfully

🎉 All tests passed successfully!
```

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify MONGODB_URI in .env
   - Check network connectivity for Atlas

2. **Port Already in Use**
   - Change PORT in .env
   - Kill process using the port

3. **JWT Secret Error**
   - Set JWT_SECRET in .env
   - Use a secure random string

4. **CORS Issues**
   - Update CORS_ORIGIN in .env
   - Match your frontend URL

### Logs
- Development: Detailed logs with Morgan
- Production: Error logs only
- Check console output for errors

## 🔄 Next Steps

1. **Connect Frontend**: Update your React Native app to use these APIs
2. **Add Habit Routes**: Extend API for habit management
3. **Add Tests**: Implement comprehensive test suite
4. **Deploy**: Deploy to your preferred platform
5. **Monitor**: Set up monitoring and logging

## 📚 Documentation

- Full API documentation: `README.md`
- Environment variables: `env.example`
- Project structure: See `README.md` for details

## 🆘 Support

If you encounter issues:
1. Check the console logs
2. Verify environment variables
3. Test with the provided test script
4. Check MongoDB connection
5. Review the troubleshooting section
