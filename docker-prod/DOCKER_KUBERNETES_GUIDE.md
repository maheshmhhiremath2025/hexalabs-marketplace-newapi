# 🐳 Docker & Kubernetes Deployment Guide

Complete guide to containerize and deploy Hexalabs Marketplace using Docker and Kubernetes.

---

## 📋 Table of Contents

1. [Docker Setup](#docker-setup)
2. [Docker Compose (Local Development)](#docker-compose-local-development)
3. [Kubernetes Deployment](#kubernetes-deployment)
4. [Production Deployment](#production-deployment)

---

## 🐳 Docker Setup

### Prerequisites
- Docker Desktop installed (https://www.docker.com/products/docker-desktop)
- Docker Compose (included with Docker Desktop)

### Files Created
- `Dockerfile` - Multi-stage build for optimized production image
- `.dockerignore` - Excludes unnecessary files from build
- `docker-compose.yml` - Local development environment
- `mongo-init.js` - MongoDB initialization script

---

## 🚀 Docker Compose (Local Development)

### Quick Start

1. **Update next.config.js** for standalone output:
```javascript
// Add to next.config.js
module.exports = {
  output: 'standalone',
  // ... rest of your config
}
```

2. **Create .env file** in project root:
```env
NEXTAUTH_SECRET=your-secret-here
RAZORPAY_KEY_ID=rzp_test_S5MyGzMGCVaygJ
RAZORPAY_KEY_SECRET=JI1GepYekJNY2PJBdJNmkE2W
```

3. **Build and run**:
```bash
# Build the Docker image
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Access Your Application
- **App**: http://localhost:3000
- **MongoDB Express** (Database UI): http://localhost:8081
  - Username: `admin`
  - Password: `admin`

### Useful Commands
```bash
# Rebuild and restart
docker-compose up -d --build

# View logs for specific service
docker-compose logs -f app
docker-compose logs -f mongo

# Execute commands in container
docker-compose exec app sh
docker-compose exec mongo mongosh

# Stop and remove volumes (clean slate)
docker-compose down -v
```

---

## ☸️ Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (minikube, kind, GKE, EKS, AKS, etc.)
- kubectl installed
- Docker image pushed to registry

### Step 1: Build and Push Docker Image

```bash
# Build the image
docker build -t your-registry/hexalabs-marketplace:latest .

# Tag for your registry
docker tag hexalabs-marketplace:latest your-registry/hexalabs-marketplace:latest

# Push to registry (Docker Hub, GCR, ECR, etc.)
docker push your-registry/hexalabs-marketplace:latest
```

### Step 2: Update Kubernetes Manifests

Edit `k8s/deployment.yaml`:
1. Replace `your-registry/hexalabs-marketplace:latest` with your actual image
2. Replace `your-domain.com` with your actual domain
3. Update secrets with your actual values

### Step 3: Deploy to Kubernetes

```bash
# Create namespace
kubectl create namespace hexalabs

# Apply all manifests
kubectl apply -f k8s/deployment.yaml

# Check deployment status
kubectl get all -n hexalabs

# Check pods
kubectl get pods -n hexalabs

# View logs
kubectl logs -f deployment/hexalabs-app -n hexalabs
```

### Step 4: Access Your Application

```bash
# Get service external IP (for LoadBalancer)
kubectl get svc hexalabs-service -n hexalabs

# Port forward for local testing
kubectl port-forward svc/hexalabs-service 3000:80 -n hexalabs
```

---

## 🏭 Production Deployment

### Option 1: Kubernetes on Cloud (GKE, EKS, AKS)

#### Google Kubernetes Engine (GKE)
```bash
# Create cluster
gcloud container clusters create hexalabs-cluster \
  --num-nodes=3 \
  --machine-type=e2-medium \
  --zone=us-central1-a

# Get credentials
gcloud container clusters get-credentials hexalabs-cluster

# Deploy
kubectl apply -f k8s/deployment.yaml
```

#### Amazon EKS
```bash
# Create cluster
eksctl create cluster \
  --name hexalabs-cluster \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3

# Deploy
kubectl apply -f k8s/deployment.yaml
```

#### Azure AKS
```bash
# Create cluster
az aks create \
  --resource-group hexalabs-rg \
  --name hexalabs-cluster \
  --node-count 3 \
  --node-vm-size Standard_B2s

# Get credentials
az aks get-credentials --resource-group hexalabs-rg --name hexalabs-cluster

# Deploy
kubectl apply -f k8s/deployment.yaml
```

### Option 2: Docker on VPS (DigitalOcean, AWS EC2, etc.)

```bash
# SSH into your server
ssh user@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone your repository
git clone https://github.com/maheshmhhiremath2025/marketplace.git
cd marketplace

# Create .env file with production values
nano .env

# Run with Docker Compose
docker-compose up -d

# Set up nginx reverse proxy (optional)
# Install nginx and configure SSL with Let's Encrypt
```

---

## 🔧 Configuration

### Environment Variables

Update these in `k8s/deployment.yaml` Secret:

```yaml
stringData:
  NEXTAUTH_SECRET: "generate-with-openssl-rand-base64-32"
  NEXTAUTH_URL: "https://your-domain.com"
  MONGODB_URI: "mongodb://mongo-service:27017/hexalabs"
  RAZORPAY_KEY_ID: "your-production-key"
  RAZORPAY_KEY_SECRET: "your-production-secret"
```

### Scaling

```bash
# Scale app replicas
kubectl scale deployment hexalabs-app --replicas=5 -n hexalabs

# Auto-scaling
kubectl autoscale deployment hexalabs-app \
  --cpu-percent=70 \
  --min=3 \
  --max=10 \
  -n hexalabs
```

---

## 🔍 Monitoring & Debugging

### View Logs
```bash
# App logs
kubectl logs -f deployment/hexalabs-app -n hexalabs

# MongoDB logs
kubectl logs -f statefulset/mongo -n hexalabs

# All pods
kubectl logs -f -l app=hexalabs-marketplace -n hexalabs
```

### Debug Pod Issues
```bash
# Describe pod
kubectl describe pod <pod-name> -n hexalabs

# Execute shell in pod
kubectl exec -it <pod-name> -n hexalabs -- sh

# Check events
kubectl get events -n hexalabs --sort-by='.lastTimestamp'
```

### Health Checks
```bash
# Check if app is healthy
kubectl get pods -n hexalabs
kubectl describe deployment hexalabs-app -n hexalabs
```

---

## 🗄️ Database Management

### Backup MongoDB
```bash
# Backup
kubectl exec -it mongo-0 -n hexalabs -- mongodump --out /tmp/backup

# Copy backup to local
kubectl cp hexalabs/mongo-0:/tmp/backup ./backup

# Restore
kubectl cp ./backup hexalabs/mongo-0:/tmp/backup
kubectl exec -it mongo-0 -n hexalabs -- mongorestore /tmp/backup
```

---

## 🔒 Security Best Practices

1. **Use Secrets for sensitive data**
2. **Enable RBAC** in Kubernetes
3. **Use Network Policies** to restrict traffic
4. **Scan images** for vulnerabilities
5. **Use non-root user** in containers
6. **Enable TLS/SSL** for ingress
7. **Implement resource limits**
8. **Regular security updates**

---

## 📊 Performance Optimization

### Docker Image Optimization
- Multi-stage builds (already implemented)
- Minimize layers
- Use .dockerignore
- Use Alpine base images

### Kubernetes Optimization
- Set resource requests and limits
- Use horizontal pod autoscaling
- Implement readiness and liveness probes
- Use persistent volumes for MongoDB

---

## 🆘 Troubleshooting

### Issue: Image Pull Error
```bash
# Check if image exists
docker pull your-registry/hexalabs-marketplace:latest

# Check image pull secrets
kubectl get secrets -n hexalabs
```

### Issue: Pod CrashLoopBackOff
```bash
# Check logs
kubectl logs <pod-name> -n hexalabs

# Check events
kubectl describe pod <pod-name> -n hexalabs
```

### Issue: Database Connection Failed
```bash
# Check MongoDB service
kubectl get svc mongo-service -n hexalabs

# Test connection
kubectl exec -it <app-pod> -n hexalabs -- sh
# Inside pod: curl mongo-service:27017
```

---

## ✅ Deployment Checklist

```
[ ] Docker installed
[ ] Dockerfile created
[ ] .dockerignore created
[ ] docker-compose.yml configured
[ ] Environment variables set
[ ] Image built successfully
[ ] Image pushed to registry
[ ] Kubernetes cluster ready
[ ] kubectl configured
[ ] Secrets updated in k8s/deployment.yaml
[ ] Domain configured
[ ] SSL/TLS certificate configured
[ ] Deployed to Kubernetes
[ ] Pods running successfully
[ ] Service accessible
[ ] Database initialized
[ ] Monitoring set up
[ ] Backups configured
[ ] Production ready! 🎉
```

---

## 📚 Additional Resources

- **Docker Docs**: https://docs.docker.com/
- **Kubernetes Docs**: https://kubernetes.io/docs/
- **Next.js Docker**: https://nextjs.org/docs/deployment#docker-image
- **MongoDB on Kubernetes**: https://www.mongodb.com/kubernetes

---

**Your containerized app is ready to deploy anywhere!** 🚀
