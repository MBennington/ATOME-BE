@echo off
echo Starting ATOME Backend Development Server...
echo.

REM Check if .env file exists
if not exist .env (
    echo Creating .env file from template...
    copy env.example .env
    echo.
    echo ⚠️  Please edit .env file with your configuration before running the server
    echo.
    pause
    exit /b 1
)

echo Starting server in development mode...
echo.
echo 🚀 Server will be available at: http://localhost:5000
echo 📊 Health check: http://localhost:5000/api/health
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev
