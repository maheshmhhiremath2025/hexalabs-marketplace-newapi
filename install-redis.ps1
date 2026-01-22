# Redis Installation Script for Windows
# Run this in PowerShell as Administrator

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Redis Installation for Windows" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

Write-Host "Choose installation method:" -ForegroundColor Yellow
Write-Host "1. Docker (Recommended - Easiest)" -ForegroundColor Green
Write-Host "2. Chocolatey (Native Windows)" -ForegroundColor Green
Write-Host "3. Manual Download" -ForegroundColor Green
Write-Host ""

$choice = Read-Host "Enter choice (1, 2, or 3)"

switch ($choice) {
    "1" {
        Write-Host "`nInstalling Redis via Docker..." -ForegroundColor Cyan
        
        # Check if Docker is installed
        try {
            $dockerVersion = docker --version
            Write-Host "Docker found: $dockerVersion" -ForegroundColor Green
            
            Write-Host "`nStarting Redis container..." -ForegroundColor Cyan
            docker run -d `
                --name hexalabs-redis `
                -p 6379:6379 `
                -v redis-data:/data `
                redis:7-alpine redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
            
            Write-Host "`nRedis container started successfully!" -ForegroundColor Green
            Write-Host "Container name: hexalabs-redis" -ForegroundColor Yellow
            Write-Host "Port: 6379" -ForegroundColor Yellow
            
            # Test connection
            Start-Sleep -Seconds 2
            Write-Host "`nTesting Redis connection..." -ForegroundColor Cyan
            docker exec hexalabs-redis redis-cli ping
            
            Write-Host "`nRedis is ready to use!" -ForegroundColor Green
            Write-Host "Connection string: redis://localhost:6379" -ForegroundColor Yellow
            
        } catch {
            Write-Host "ERROR: Docker is not installed or not running!" -ForegroundColor Red
            Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
            exit 1
        }
    }
    
    "2" {
        Write-Host "`nInstalling Redis via Chocolatey..." -ForegroundColor Cyan
        
        # Check if Chocolatey is installed
        try {
            $chocoVersion = choco --version
            Write-Host "Chocolatey found: $chocoVersion" -ForegroundColor Green
        } catch {
            Write-Host "Chocolatey not found. Installing Chocolatey..." -ForegroundColor Yellow
            Set-ExecutionPolicy Bypass -Scope Process -Force
            [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
            Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        }
        
        Write-Host "`nInstalling Redis..." -ForegroundColor Cyan
        choco install redis-64 -y
        
        Write-Host "`nStarting Redis service..." -ForegroundColor Cyan
        redis-server --service-install
        redis-server --service-start
        
        Write-Host "`nRedis installed and started successfully!" -ForegroundColor Green
        Write-Host "Connection string: redis://localhost:6379" -ForegroundColor Yellow
        
        # Test connection
        Start-Sleep -Seconds 2
        Write-Host "`nTesting Redis connection..." -ForegroundColor Cyan
        redis-cli ping
    }
    
    "3" {
        Write-Host "`nManual Installation:" -ForegroundColor Cyan
        Write-Host "1. Download Redis from: https://github.com/microsoftarchive/redis/releases" -ForegroundColor Yellow
        Write-Host "2. Extract to C:\Redis" -ForegroundColor Yellow
        Write-Host "3. Run: C:\Redis\redis-server.exe" -ForegroundColor Yellow
        Write-Host "`nOr use WSL2 (Windows Subsystem for Linux):" -ForegroundColor Cyan
        Write-Host "1. Install WSL2: wsl --install" -ForegroundColor Yellow
        Write-Host "2. In WSL: sudo apt-get install redis-server" -ForegroundColor Yellow
        Write-Host "3. Start: sudo service redis-server start" -ForegroundColor Yellow
    }
    
    default {
        Write-Host "Invalid choice. Exiting..." -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "1. Update .env.local with:" -ForegroundColor Yellow
Write-Host "   REDIS_ENABLED=true" -ForegroundColor White
Write-Host "   REDIS_URL=redis://localhost:6379" -ForegroundColor White
Write-Host ""
Write-Host "2. Restart your Next.js application" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Test cache with:" -ForegroundColor Yellow
Write-Host "   curl http://localhost:3000/api/v1/cache" -ForegroundColor White
Write-Host ""
Write-Host "Redis installation complete! 🚀" -ForegroundColor Green
