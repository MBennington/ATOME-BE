# ATOME Backend API

A modern, secure backend API for the ATOME habit tracking application built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication**: Secure JWT-based authentication with registration and login
- **Password Security**: Bcrypt hashing with salt rounds
- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: Protection against abuse and DDoS attacks
- **Security Headers**: Helmet.js for security best practices
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Database**: MongoDB with Mongoose ODM
- **CORS**: Configurable cross-origin resource sharing
- **Logging**: Morgan HTTP request logger
- **Compression**: Gzip compression for better performance

## 📋 Prerequisites

- Node.js (v18.0.0 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Configure Environment Variables**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/atome
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   
   # CORS
   CORS_ORIGIN=http://localhost:3000
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/profile` | Update user profile | Private |
| PUT | `/api/auth/change-password` | Change password | Private |
| POST | `/api/auth/logout` | Logout user | Private |

### General

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/` | API information |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📝 Request/Response Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer <jwt-token>
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database connection
│   ├── controllers/
│   │   └── authController.js    # Authentication logic
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── errorHandler.js      # Error handling
│   │   └── validation.js        # Input validation
│   ├── models/
│   │   └── User.js              # User schema
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   └── index.js             # Main routes
│   └── server.js                # Main server file
├── package.json
├── env.example
└── README.md
```

## 🔒 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **Input Validation**: Comprehensive validation and sanitization
- **Security Headers**: Helmet.js for security best practices
- **CORS**: Configurable cross-origin resource sharing
- **Environment Variables**: Sensitive data in environment variables

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 🚀 Deployment

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use a strong `JWT_SECRET`
- Configure proper `MONGODB_URI` (MongoDB Atlas recommended)
- Set appropriate `CORS_ORIGIN` for your frontend domain
- Configure rate limiting based on your needs

### Recommended Hosting Platforms
- **Heroku**: Easy deployment with MongoDB Atlas
- **DigitalOcean**: App Platform or Droplets
- **AWS**: EC2 with RDS or DocumentDB
- **Vercel**: Serverless functions
- **Railway**: Simple deployment with built-in MongoDB

## 📊 Monitoring

The API includes:
- Health check endpoint for monitoring
- Request logging with Morgan
- Error logging and handling
- Rate limiting metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.
