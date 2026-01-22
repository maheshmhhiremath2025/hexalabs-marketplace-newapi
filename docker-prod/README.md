# 🐳 Docker Production Deployment Files

This folder contains all the files needed for production deployment of Hexalabs Marketplace using **Docker** or **Kubernetes**.

---

## 📚 DEPLOYMENT GUIDES

### 🐳 Docker Deployment

**1. PRODUCTION_DEPLOYMENT_GUIDE.md** - Complete Docker Production Guide
- ✅ Server setup from scratch
- ✅ Docker installation
- ✅ Domain & SSL configuration
- ✅ Auto-restart setup
- ✅ Crash recovery
- ✅ Backup & restore
- ✅ Troubleshooting
- **Start here for Docker deployment**

**2. DOCKER_KUBERNETES_GUIDE.md** - Docker & Kubernetes Overview
- Docker setup and usage
- Kubernetes deployment basics
- Both deployment options explained

**3. MULTI_WORKER_GUIDE.md** - Multi-Worker Configuration
- PM2 cluster mode (4 workers)
- Performance optimization
- Load testing
- Monitoring

### ☸️ Kubernetes Deployment

**k8s/deployment.yaml** - Complete Kubernetes Manifests
- 5 pod replicas
- Horizontal Pod Autoscaler (5-10 pods)
- MongoDB StatefulSet
- Services & Ingress
- Auto-scaling configuration

**DOCKER_KUBERNETES_GUIDE.md** - Kubernetes Section
- Step-by-step K8s deployment
- GKE, EKS, AKS instructions
- Scaling and monitoring

---

## 📦 Deployment Files

### 2. **docker-compose.prod.yml**
Production Docker Compose configuration with:
- Auto-restart enabled
- Health checks
- Resource limits (2 CPU, 2GB RAM)
- MongoDB + Redis
- 4 worker processes

### 3. **Dockerfile.cluster**
Multi-stage Dockerfile with:
- PM2 for cluster mode (4 workers)
- Optimized production build
- Security best practices

### 4. **ecosystem.config.js**
PM2 configuration for:
- 4 worker processes
- Auto-restart on crashes
- Memory limits
- Logging

### 5. **restart-hexalabs.sh**
Emergency restart script for quick recovery:
```bash
./restart-hexalabs.sh
```

### 6. **backup-hexalabs.sh**
Automated backup script:
```bash
./backup-hexalabs.sh
```

### 7. **quick-deploy.sh**
One-command automated deployment:
```bash
sudo bash quick-deploy.sh
```

### 8. **.env.production.example**
Environment variables template - copy and customize:
```bash
cp .env.production.example .env.production
nano .env.production
```

---

## 🚀 Quick Start

### Option 1: Automated Deployment
```bash
# On your server
sudo bash quick-deploy.sh
```

### Option 2: Manual Deployment
```bash
# 1. Copy .env.production.example to .env.production
cp .env.production.example .env.production

# 2. Edit environment variables
nano .env.production

# 3. Build and start
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# 4. Check status
docker compose -f docker-compose.prod.yml ps
```

---

## 📋 Deployment Checklist

- [ ] Server with Ubuntu 20.04/22.04
- [ ] Docker & Docker Compose installed
- [ ] Domain name configured
- [ ] .env.production created with your values
- [ ] Nginx installed and configured
- [ ] SSL certificate obtained
- [ ] Services started
- [ ] Application accessible

---

## 🔄 Common Commands

```bash
# Start services
docker compose -f docker-compose.prod.yml up -d

# Stop services
docker compose -f docker-compose.prod.yml down

# Restart services
./restart-hexalabs.sh

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Backup
./backup-hexalabs.sh

# Check status
docker compose -f docker-compose.prod.yml ps

# Check workers
docker exec hexalabs-marketplace pm2 list
```

---

## 📖 Documentation

For complete deployment instructions, see **PRODUCTION_DEPLOYMENT_GUIDE.md**

---

## 🆘 Need Help?

1. Check the troubleshooting section in PRODUCTION_DEPLOYMENT_GUIDE.md
2. View logs: `docker compose -f docker-compose.prod.yml logs -f`
3. Check container status: `docker compose -f docker-compose.prod.yml ps`

---

**Ready to deploy!** 🚀
