# Quick Start Script for Hexalabs Marketplace with Redis
# Run this to start all services with Docker Compose

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Hexalabs Marketplace - Quick Start" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "✗ .env.local not found!" -ForegroundColor Red
    Write-Host "Please create .env.local file with required environment variables." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ .env.local found" -ForegroundColor Green
Write-Host ""

# Stop any existing containers
Write-Host "Stopping existing containers..." -ForegroundColor Cyan
docker-compose down

Write-Host ""
Write-Host "Starting services..." -ForegroundColor Cyan
Write-Host "- MongoDB (Database)" -ForegroundColor Yellow
Write-Host "- Redis (Cache & Rate Limiting)" -ForegroundColor Yellow
Write-Host "- Next.js App" -ForegroundColor Yellow
Write-Host "- Mongo Express (Database UI)" -ForegroundColor Yellow
Write-Host ""

# Start services
docker-compose up -d

Write-Host ""
Write-Host "Waiting for services to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Check service health
Write-Host ""
Write-Host "Service Status:" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Check MongoDB
try {
    docker exec hexalabs-mongo mongosh --eval "db.adminCommand('ping')" --quiet | Out-Null
    Write-Host "✓ MongoDB: Running" -ForegroundColor Green
} catch {
    Write-Host "✗ MongoDB: Not ready" -ForegroundColor Red
}

# Check Redis
try {
    $redisPing = docker exec hexalabs-redis redis-cli ping
    if ($redisPing -eq "PONG") {
        Write-Host "✓ Redis: Running" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Redis: Not ready" -ForegroundColor Red
}

# Check App
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "✓ Next.js App: Running" -ForegroundColor Green
} catch {
    Write-Host "⚠ Next.js App: Starting (may take a minute)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Services Available:" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "🌐 Application:    http://localhost:3000" -ForegroundColor White
Write-Host "📊 Mongo Express:  http://localhost:8081" -ForegroundColor White
Write-Host "   Username: admin" -ForegroundColor Gray
Write-Host "   Password: admin" -ForegroundColor Gray
Write-Host ""
Write-Host "📦 MongoDB:        localhost:27017" -ForegroundColor White
Write-Host "🔴 Redis:          localhost:6379" -ForegroundColor White
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "View logs:         docker-compose logs -f" -ForegroundColor White
Write-Host "Stop services:     docker-compose down" -ForegroundColor White
Write-Host "Restart services:  docker-compose restart" -ForegroundColor White
Write-Host "View containers:   docker-compose ps" -ForegroundColor White
Write-Host ""
Write-Host "Test Redis cache:  curl http://localhost:3000/api/v1/cache" -ForegroundColor White
Write-Host ""
Write-Host "All services started! 🚀" -ForegroundColor Green
