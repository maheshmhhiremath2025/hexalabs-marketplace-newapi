# Docker Deployment Guide - Hexalabs Marketplace

Complete step-by-step guide for deploying the Hexalabs Marketplace using Docker on Ubuntu Server.

## 📋 Prerequisites

- Ubuntu Server (20.04 or later)
- Docker and Docker Compose installed
- Git installed
- Access to your actual `.env.local` file with credentials

---

## 🚀 Step-by-Step Deployment

### Step 1: Install Docker (if not already installed)

```bash
# Update package list
sudo apt update

# Install required packages
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package list again
sudo apt update

# Install Docker
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add your user to docker group (to run docker without sudo)
sudo usermod -aG docker $USER

# Apply group changes (or logout and login again)
newgrp docker

# Verify installation
docker --version
docker-compose --version
```

---

### Step 2: Clone the Repository

```bash
# Navigate to home directory
cd ~

# Clone the repository
git clone https://github.com/maheshmhhiremath2025/hexalabs-marketplace-newapi.git hexalabs-marketplace

# Navigate to project directory
cd hexalabs-marketplace
```

---

### Step 3: Configure Environment Variables

The repository contains `.env.local` with placeholder values. You need to update it with your actual credentials.

```bash
# Edit .env.local file
nano .env.local
```

**Replace ALL placeholder values with your actual credentials:**

```env
MONGODB_URI=mongodb://localhost:27020/hexalabs
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=6+LJem/os8jsq5SX5wTMkQa2vKEumQWZeWlmfhGWybw=

# JWT Secret for API authentication
JWT_SECRET=6+LJem/os8jsq5SX5wTMkQa2vKEumQWZeWlmfhGWybw=

# Redis for rate limiting
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=true

AZURE_CLIENT_ID=98dc81b0-b77a-45fc-a687-7b1dbaa2196f
AZURE_CLIENT_SECRET=qh68Q~k4MygmJnFVIl5z6kNufwPr8lwBFI0WFamS
AZURE_SUBSCRIPTION_ID=50cf6107-1342-4241-96fa-990b714ea823
AZURE_TENANT_ID=3f46c9ac-f582-4caf-9be0-bd01d2a3c024
GUACAMOLE_URL=http://20.193.146.110:8080/guacamole
GUACAMOLE_USERNAME=guacadmin
GUACAMOLE_PASSWORD=guacadmin
AZURE_AD_DOMAIN=maheshmhhiremathgmail.onmicrosoft.com
AZURE_CUSTOM_ROLE_ID=/subscriptions/50cf6107-1342-4241-96fa-990b714ea823/providers/Microsoft.Authorization/roleDefinitions/1895c520-5653-4a3e-a76a-840933d4a2ea
AZURE_CUSTOM_INITIATIVE_ID=/subscriptions/50cf6107-1342-4241-96fa-990b714ea823/providers/Microsoft.Authorization/policySetDefinitions/a26be36939b045a39a25324f

# Email Configuration
EMAIL_USER=hexalabsmktplace@gmail.com
EMAIL_PASSWORD=gxgjsudlelawgwwo

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_S5MyGzMGCVaygJ
RAZORPAY_KEY_SECRET=JI1GepYekJNY2PJBdJNmkE2W
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_S5MyGzMGCVaygJ

# Currency & Tax
EXCHANGE_RATE_USD_TO_INR=83
TAX_RATE=0.18

# Zoho Books Configuration
ZOHO_CLIENT_ID=1000.5PIAMTZQTJSQEECLY86RN4KXM4ANJC
ZOHO_CLIENT_SECRET=958aa25c472ed21128e8bc08855aa46e8eb4d672eb
ZOHO_REFRESH_TOKEN=1000.228d52e3cecb763bc7fe02474ade5498.64a177ddb3f94090836b6166ee87f060
ZOHO_ORGANIZATION_ID=60063425642
ZOHO_AUTH_DOMAIN=https://accounts.zoho.in
ZOHO_API_DOMAIN=https://www.zohoapis.in

# Google OAuth
GOOGLE_CLIENT_ID=518993287392-p3gdoc0gjbs00t655u8mnlm3rj91s6a9.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Microsoft OAuth
MICROSOFT_CLIENT_ID=a0e8d389-22cf-4165-8243-ebbf820f79ec
MICROSOFT_CLIENT_SECRET=hcU8Q~uD6UxyBktXofe~~_FmLcFjrug-oArjhaO-

# Organization Request Email
ORG_REQUEST_EMAIL=labs@hexalabs.online
```

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

---

### Step 4: Start Docker Services

```bash
# Make sure you're in the project directory
cd ~/hexalabs-marketplace

# Start all services in detached mode
docker-compose up -d
```

**What this does:**
- Builds the Next.js application
- Starts MongoDB container on port 27020
- Starts Redis container on port 6379
- Starts the Next.js app container on port 3000
- All containers run in the background

---

### Step 5: Verify Deployment

```bash
# Check if all containers are running
docker-compose ps

# You should see 3 containers running:
# - hexalabs-marketplace-app-1
# - hexalabs-marketplace-mongodb-1
# - hexalabs-marketplace-redis-1
```

**Expected output:**
```
NAME                              STATUS    PORTS
hexalabs-marketplace-app-1        Up        0.0.0.0:3000->3000/tcp
hexalabs-marketplace-mongodb-1    Up        0.0.0.0:27020->27017/tcp
hexalabs-marketplace-redis-1      Up        0.0.0.0:6379->6379/tcp
```

---

### Step 6: View Logs

```bash
# View all container logs
docker-compose logs -f

# View only app logs
docker-compose logs -f app

# View last 50 lines of app logs
docker-compose logs --tail=50 app
```

**Press `Ctrl+C` to exit log view**

---

### Step 7: Test the Application

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test from your local machine (replace YOUR_SERVER_IP)
curl http://YOUR_SERVER_IP:3000/api/health
```

**Or open in browser:**
```
http://YOUR_SERVER_IP:3000
```

---

## 🔧 Common Docker Commands

### Managing Services

```bash
# Stop all services
docker-compose down

# Stop services and remove volumes (WARNING: deletes database data)
docker-compose down -v

# Restart all services
docker-compose restart

# Restart only the app
docker-compose restart app

# Start services
docker-compose up -d

# Rebuild and start (after code changes)
docker-compose up -d --build
```

### Viewing Logs

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View logs for specific service
docker-compose logs app
docker-compose logs mongodb
docker-compose logs redis

# View last N lines
docker-compose logs --tail=100 app
```

### Accessing Containers

```bash
# Execute command in app container
docker-compose exec app sh

# Execute command in MongoDB container
docker-compose exec mongodb mongosh

# View running processes
docker-compose top
```

### Monitoring

```bash
# View resource usage
docker stats

# View container details
docker-compose ps

# Inspect a specific container
docker inspect hexalabs-marketplace-app-1
```

---

## 🔄 Updating the Application

When you pull new code from GitHub:

```bash
# Navigate to project directory
cd ~/hexalabs-marketplace

# Pull latest changes
git pull origin main

# Rebuild and restart containers
docker-compose up -d --build

# View logs to verify update
docker-compose logs -f app
```

---

## 🛠️ Troubleshooting

### Container Won't Start

```bash
# Check container status
docker-compose ps

# View error logs
docker-compose logs app

# Remove and recreate containers
docker-compose down
docker-compose up -d
```

### Port Already in Use

```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill the process (replace PID)
sudo kill -9 PID

# Or change port in docker-compose.yml
```

### Database Connection Issues

```bash
# Check MongoDB is running
docker-compose ps mongodb

# View MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Remove unused Docker images
docker system prune -a

# Remove unused volumes
docker volume prune
```

### Reset Everything

```bash
# Stop and remove everything
docker-compose down -v

# Remove all Docker data (WARNING: deletes everything)
docker system prune -a --volumes

# Start fresh
docker-compose up -d
```

---

## 🔒 Security Best Practices

### 1. Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Block direct access to MongoDB and Redis from outside
# (they should only be accessible from localhost)
```

### 2. Environment Variables

- ✅ Never commit `.env.local` to Git
- ✅ Keep backups of `.env.local` in a secure location
- ✅ Rotate secrets regularly
- ✅ Use strong passwords

### 3. Regular Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker
sudo apt install docker-ce docker-ce-cli containerd.io

# Pull latest code
cd ~/hexalabs-marketplace
git pull origin main
docker-compose up -d --build
```

---

## 📊 Production Deployment

For production deployment with Nginx and SSL:

### 1. Install Nginx

```bash
sudo apt install -y nginx
```

### 2. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/hexalabs
```

**Add this configuration:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/hexalabs /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Install SSL with Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 📝 Backup and Restore

### Backup MongoDB

```bash
# Create backup directory
mkdir -p ~/backups

# Backup MongoDB
docker-compose exec mongodb mongodump --out /data/backup
docker cp hexalabs-marketplace-mongodb-1:/data/backup ~/backups/mongodb-$(date +%Y%m%d)
```

### Restore MongoDB

```bash
# Copy backup to container
docker cp ~/backups/mongodb-20260122 hexalabs-marketplace-mongodb-1:/data/restore

# Restore
docker-compose exec mongodb mongorestore /data/restore
```

---

## ✅ Quick Reference

| Task | Command |
|------|---------|
| Start services | `docker-compose up -d` |
| Stop services | `docker-compose down` |
| View logs | `docker-compose logs -f` |
| Restart app | `docker-compose restart app` |
| Rebuild app | `docker-compose up -d --build` |
| Check status | `docker-compose ps` |
| Update code | `git pull && docker-compose up -d --build` |

---

## 🆘 Support

If you encounter issues:

1. Check logs: `docker-compose logs -f app`
2. Verify `.env.local` has correct values
3. Ensure all containers are running: `docker-compose ps`
4. Check disk space: `df -h`
5. Restart services: `docker-compose restart`

---

**🎉 Your Hexalabs Marketplace is now running with Docker!**

Access it at: `http://YOUR_SERVER_IP:3000`
