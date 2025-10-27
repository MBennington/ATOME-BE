Write-Host "Starting ATOME Backend Development Server..." -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host ""
    Write-Host "⚠️  Please edit .env file with your configuration before running the server" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host "Starting server in development mode..." -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Server will be available at: http://localhost:5000" -ForegroundColor Green
Write-Host "📊 Health check: http://localhost:5000/api/health" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev
