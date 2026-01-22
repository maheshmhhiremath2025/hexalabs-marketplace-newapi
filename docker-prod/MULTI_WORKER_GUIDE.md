# 🚀 Multi-Worker Setup Guide

This guide explains how to run Hexalabs Marketplace with 4-5 workers for handling concurrent requests without hanging.

---

## 🎯 Why Multiple Workers?

- **Handle concurrent requests** - Multiple users can access simultaneously
- **No hanging** - Requests are distributed across workers
- **Better performance** - Utilize all CPU cores
- **High availability** - If one worker crashes, others continue
- **Load balancing** - Automatic distribution of traffic

---

## 📦 Setup Options

### Option 1: PM2 Cluster Mode (Recommended for VPS/Server)

**What is PM2?**
PM2 is a production process manager that runs your app in cluster mode with multiple workers.

#### Installation

```bash
# Install PM2 globally
npm install -g pm2

# Install dependencies
npm install

# Build the application
npm run build
```

#### Running with PM2

```bash
# Start with 4 workers (cluster mode)
pm2 start ecosystem.config.js

# View status
pm2 status

# View logs
pm2 logs

# Monitor in real-time
pm2 monit

# Restart all workers
pm2 restart hexalabs-marketplace

# Stop all workers
pm2 stop hexalabs-marketplace

# Delete from PM2
pm2 delete hexalabs-marketplace
```

#### PM2 Configuration

The `ecosystem.config.js` file is already configured with:
- **4 worker instances** (can be changed to 5)
- **Cluster mode** for load balancing
- **Auto-restart** on crashes
- **Memory limit** (1GB per worker)
- **Graceful shutdown**
- **Logging** to ./logs directory

To change number of workers, edit `ecosystem.config.js`:
```javascript
instances: 5, // Change from 4 to 5
```

---

### Option 2: Docker with PM2 (Recommended for Containers)

#### Build and Run

```bash
# Build the cluster-enabled image
docker build -f Dockerfile.cluster -t hexalabs-marketplace:cluster .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Check worker processes
docker-compose exec app pm2 list
```

The Docker setup includes:
- **4 workers** inside the container
- **Resource limits** (2 CPU, 2GB RAM)
- **MongoDB** with connection pooling
- **Redis** for session management (optional)

---

### Option 3: Kubernetes (Recommended for Production)

#### Deploy with Multiple Replicas

```bash
# Deploy with 5 pods
kubectl apply -f k8s/deployment.yaml

# Check pods
kubectl get pods -n hexalabs

# Scale manually
kubectl scale deployment hexalabs-app --replicas=5 -n hexalabs

# View autoscaler status
kubectl get hpa -n hexalabs
```

The Kubernetes setup includes:
- **5 pod replicas** (each running the app)
- **Horizontal Pod Autoscaler** (auto-scales 5-10 pods)
- **Load balancer** distributes traffic
- **Resource limits** per pod
- **Health checks** for automatic recovery

---

## 🔧 Configuration Details

### PM2 Workers (ecosystem.config.js)

```javascript
{
  instances: 4,        // Number of workers
  exec_mode: 'cluster', // Cluster mode for load balancing
  max_memory_restart: '1G', // Restart if memory exceeds 1GB
  autorestart: true,   // Auto-restart on crash
}
```

### Docker Resources (docker-compose.yml)

```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'      # Use 2 CPU cores
      memory: 2G       # Max 2GB RAM
    reservations:
      cpus: '1.0'      # Reserve 1 CPU core
      memory: 1G       # Reserve 1GB RAM
```

### Kubernetes Scaling (k8s/deployment.yaml)

```yaml
spec:
  replicas: 5          # 5 pods initially
  
  # Auto-scaling
  minReplicas: 5       # Minimum 5 pods
  maxReplicas: 10      # Maximum 10 pods
  
  # Scale up when CPU > 70% or Memory > 80%
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        averageUtilization: 70
```

---

## 📊 Monitoring Workers

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# List all processes
pm2 list

# Detailed info
pm2 show hexalabs-marketplace

# View logs
pm2 logs hexalabs-marketplace

# Flush logs
pm2 flush
```

### Docker Monitoring

```bash
# View container stats
docker stats hexalabs-marketplace

# Check PM2 inside container
docker exec hexalabs-marketplace pm2 list

# View logs
docker logs -f hexalabs-marketplace
```

### Kubernetes Monitoring

```bash
# View pod status
kubectl get pods -n hexalabs

# Check autoscaler
kubectl get hpa -n hexalabs

# View pod metrics
kubectl top pods -n hexalabs

# View logs from all pods
kubectl logs -f deployment/hexalabs-app -n hexalabs
```

---

## 🧪 Testing Concurrent Load

### Using Apache Bench (ab)

```bash
# Install Apache Bench
# Windows: Download from Apache website
# Linux: sudo apt-get install apache2-utils
# Mac: brew install ab

# Test with 100 concurrent requests
ab -n 1000 -c 100 http://localhost:3000/

# Test specific endpoint
ab -n 500 -c 50 http://localhost:3000/api/labs
```

### Using Artillery (Load Testing)

```bash
# Install Artillery
npm install -g artillery

# Create test config (quick-test.yml)
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 20
scenarios:
  - flow:
    - get:
        url: "/"

# Run test
artillery run quick-test.yml
```

---

## ⚡ Performance Optimization

### 1. Adjust Worker Count

**Rule of thumb**: Number of workers = Number of CPU cores

```bash
# Check CPU cores
# Linux/Mac
nproc

# Windows
echo %NUMBER_OF_PROCESSORS%

# Set workers to CPU count
pm2 start ecosystem.config.js -i max  # Auto-detect cores
pm2 start ecosystem.config.js -i 4    # Specific number
```

### 2. Memory Management

```javascript
// In ecosystem.config.js
max_memory_restart: '1G',  // Restart if exceeds 1GB
```

### 3. Connection Pooling

MongoDB connection pooling is automatic with Mongoose, but you can optimize:

```javascript
// In src/lib/db.ts
mongoose.connect(uri, {
  maxPoolSize: 10,  // Max 10 connections per worker
  minPoolSize: 2,   // Min 2 connections
});
```

### 4. Enable Redis Caching (Optional)

Redis is included in docker-compose.yml for session storage and caching.

---

## 🔍 Troubleshooting

### Issue: Workers keep restarting

**Solution**: Check memory usage
```bash
pm2 monit  # Watch memory usage
# Increase max_memory_restart if needed
```

### Issue: Port already in use

**Solution**: Kill existing process
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Issue: Slow response times

**Solution**: 
1. Increase worker count
2. Check database connection pool
3. Enable Redis caching
4. Optimize database queries

---

## ✅ Production Checklist

```
[ ] PM2 installed and configured
[ ] ecosystem.config.js updated with correct worker count
[ ] Application built (npm run build)
[ ] PM2 started (pm2 start ecosystem.config.js)
[ ] PM2 startup script configured (pm2 startup)
[ ] PM2 save current processes (pm2 save)
[ ] Monitoring enabled (pm2 monit)
[ ] Logs directory created
[ ] Resource limits configured
[ ] Load testing completed
[ ] Auto-restart verified
[ ] Health checks working
[ ] Production ready! 🎉
```

---

## 🚀 Quick Commands Reference

```bash
# PM2
pm2 start ecosystem.config.js     # Start workers
pm2 restart hexalabs-marketplace   # Restart
pm2 stop hexalabs-marketplace      # Stop
pm2 delete hexalabs-marketplace    # Remove
pm2 logs                           # View logs
pm2 monit                          # Monitor

# Docker
docker-compose up -d               # Start
docker-compose restart app         # Restart
docker-compose logs -f app         # Logs
docker exec app pm2 list           # Check workers

# Kubernetes
kubectl get pods -n hexalabs       # List pods
kubectl scale deployment --replicas=5  # Scale
kubectl get hpa -n hexalabs        # Autoscaler status
kubectl logs -f deployment/hexalabs-app  # Logs
```

---

**Your app now runs with 4-5 workers for maximum performance!** 🚀
