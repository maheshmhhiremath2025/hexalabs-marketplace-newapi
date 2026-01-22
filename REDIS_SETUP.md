# Redis Setup Guide for Hexalabs Marketplace

## Quick Start (Recommended)

### Option 1: Docker Compose (Easiest)

Redis is already configured in `docker-compose.yml`. Just run:

```powershell
# Start all services (MongoDB + Redis + App)
.\start-services.ps1
```

Or manually:

```powershell
docker-compose up -d
```

**That's it!** Redis will be available at `redis://localhost:6379`

---

### Option 2: Standalone Redis (Docker)

If you only want Redis without the full stack:

```powershell
# Run the installation script
.\install-redis.ps1
```

Or manually:

```powershell
docker run -d `
  --name hexalabs-redis `
  -p 6379:6379 `
  -v redis-data:/data `
  redis:7-alpine redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
```

---

### Option 3: Native Windows Installation

```powershell
# Run as Administrator
.\install-redis.ps1
# Choose option 2 (Chocolatey)
```

Or manually:

```powershell
# Install Chocolatey first (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Redis
choco install redis-64 -y

# Start Redis service
redis-server --service-install
redis-server --service-start
```

---

## Verify Installation

### 1. Check Redis is Running

```powershell
# If using Docker
docker exec hexalabs-redis redis-cli ping
# Should return: PONG

# If using native Windows
redis-cli ping
# Should return: PONG
```

### 2. Test API Cache

```powershell
# Start your Next.js app
npm run dev

# Test cache endpoint (requires admin token)
curl http://localhost:3000/api/v1/cache
```

### 3. Check Cache Stats

```powershell
# Get cache statistics
curl http://localhost:3000/api/v1/cache `
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Configuration

### Environment Variables

Your `.env.local` should have:

```env
# Redis Configuration
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379
```

**Already configured!** ✅

### Docker Compose Configuration

Redis is configured in `docker-compose.yml`:

```yaml
redis:
  image: redis:7-alpine
  container_name: hexalabs-redis
  ports:
    - "6379:6379"
  command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
  volumes:
    - redis-data:/data
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 10s
    timeout: 3s
    retries: 3
```

**Already configured!** ✅

---

## Usage

### Start All Services

```powershell
# Quick start script
.\start-services.ps1

# Or manually
docker-compose up -d
```

### View Logs

```powershell
# All services
docker-compose logs -f

# Redis only
docker-compose logs -f redis

# App only
docker-compose logs -f app
```

### Stop Services

```powershell
docker-compose down
```

### Restart Services

```powershell
docker-compose restart
```

---

## Monitoring

### Redis CLI Commands

```powershell
# Connect to Redis
docker exec -it hexalabs-redis redis-cli

# Or if native Windows
redis-cli
```

**Useful Redis commands:**

```redis
# Check connection
PING

# Get all keys
KEYS *

# Get specific key
GET lab:ws011wv-2025

# Get cache info
INFO stats
INFO memory

# Get key count
DBSIZE

# Clear all cache
FLUSHDB

# Exit
EXIT
```

### API Endpoints

```bash
# Get cache statistics (admin only)
GET /api/v1/cache

# Clear all cache (admin only)
DELETE /api/v1/cache
```

---

## Performance Monitoring

### Check Cache Hit Rate

```powershell
# Make same request twice
curl http://localhost:3000/api/v1/labs?page=1

# Check logs for:
# [Cache] MISS: labs:list:1:20:all:all:all:none:0:999999:createdAt:-1
# [Cache] HIT: labs:list:1:20:all:all:all:none:0:999999:createdAt:-1
```

### Monitor Memory Usage

```powershell
docker exec hexalabs-redis redis-cli INFO memory
```

---

## Troubleshooting

### Redis Not Starting

**Docker:**
```powershell
# Check Docker is running
docker info

# Check Redis container
docker ps -a | Select-String redis

# View Redis logs
docker logs hexalabs-redis

# Restart Redis
docker restart hexalabs-redis
```

**Native Windows:**
```powershell
# Check service status
Get-Service redis

# Start service
Start-Service redis

# Restart service
Restart-Service redis
```

### Connection Refused

1. **Check Redis is running:**
   ```powershell
   docker ps | Select-String redis
   ```

2. **Check port 6379 is available:**
   ```powershell
   netstat -an | Select-String 6379
   ```

3. **Verify environment variables:**
   ```powershell
   cat .env.local | Select-String REDIS
   ```

### Cache Not Working

1. **Check Redis connection:**
   ```powershell
   docker exec hexalabs-redis redis-cli ping
   ```

2. **Check app logs:**
   ```powershell
   # Look for cache HIT/MISS messages
   docker-compose logs app | Select-String Cache
   ```

3. **Clear cache and retry:**
   ```powershell
   curl -X DELETE http://localhost:3000/api/v1/cache `
     -H "Authorization: Bearer $ADMIN_TOKEN"
   ```

### High Memory Usage

```powershell
# Check memory
docker exec hexalabs-redis redis-cli INFO memory

# Clear cache
docker exec hexalabs-redis redis-cli FLUSHDB

# Restart with lower memory limit
docker-compose down
# Edit docker-compose.yml: --maxmemory 128mb
docker-compose up -d
```

---

## Production Deployment

### Vercel + Upstash Redis

For production on Vercel, use Upstash Redis:

1. **Create Upstash account:** https://upstash.com
2. **Create Redis database**
3. **Get connection string**
4. **Add to Vercel environment variables:**
   ```
   REDIS_ENABLED=true
   REDIS_URL=redis://your-upstash-url
   ```

### Self-Hosted Production

For self-hosted production:

```yaml
# docker-compose.prod.yml
redis:
  image: redis:7-alpine
  command: redis-server --requirepass YOUR_STRONG_PASSWORD --appendonly yes
  environment:
    - REDIS_PASSWORD=YOUR_STRONG_PASSWORD
```

Update `.env`:
```env
REDIS_URL=redis://:YOUR_STRONG_PASSWORD@redis:6379
```

---

## Summary

### ✅ What's Configured

- Docker Compose with Redis
- Environment variables
- Installation scripts
- Health checks
- Memory limits
- Persistence (AOF)

### 🚀 Quick Commands

```powershell
# Start everything
.\start-services.ps1

# Or just Redis
.\install-redis.ps1

# Check status
docker ps

# View logs
docker-compose logs -f redis

# Test connection
docker exec hexalabs-redis redis-cli ping
```

### 📊 Monitoring

- Cache stats: `GET /api/v1/cache`
- Redis CLI: `docker exec -it hexalabs-redis redis-cli`
- Logs: `docker-compose logs -f`

---

**Redis is ready to use!** 🚀

Just run `.\start-services.ps1` to start everything!
