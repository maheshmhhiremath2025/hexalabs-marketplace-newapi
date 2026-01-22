# 🚀 COMPLETE PRODUCTION DEPLOYMENT GUIDE
# Hexalabs Marketplace - Docker Setup with Auto-Restart & Domain Configuration

---

## 📋 TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Initial Server Setup](#initial-server-setup)
3. [Install Docker & Dependencies](#install-docker--dependencies)
4. [Clone & Configure Project](#clone--configure-project)
5. [Environment Variables Setup](#environment-variables-setup)
6. [Domain & SSL Configuration](#domain--ssl-configuration)
7. [Build & Deploy](#build--deploy)
8. [Auto-Restart Configuration](#auto-restart-configuration)
9. [Monitoring & Logs](#monitoring--logs)
10. [Crash Recovery](#crash-recovery)
11. [Backup & Restore](#backup--restore)
12. [Troubleshooting](#troubleshooting)

---

## ✅ PREREQUISITES

Before starting, you need:

- [ ] A server (VPS) - DigitalOcean, AWS EC2, Linode, etc.
- [ ] Ubuntu 20.04 or 22.04 (recommended)
- [ ] At least 2GB RAM, 2 CPU cores, 20GB storage
- [ ] A domain name (e.g., hexalabs.com)
- [ ] SSH access to your server
- [ ] Root or sudo privileges

---

## 🖥️ STEP 1: INITIAL SERVER SETUP

### 1.1 Connect to Your Server

```bash
# SSH into your server
ssh root@your-server-ip

# Or if using a specific user
ssh username@your-server-ip
```

### 1.2 Update System

```bash
# Update package list
sudo apt update

# Upgrade packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git vim nano ufw
```

### 1.3 Configure Firewall

```bash
# Allow SSH
sudo ufw allow OpenSSH

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 1.4 Create Application User (Optional but Recommended)

```bash
# Create user
sudo adduser hexalabs

# Add to sudo group
sudo usermod -aG sudo hexalabs

# Switch to new user
su - hexalabs
```

---

## 🐳 STEP 2: INSTALL DOCKER & DEPENDENCIES

### 2.1 Install Docker

```bash
# Remove old versions
sudo apt remove docker docker-engine docker.io containerd runc

# Install dependencies
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### 2.2 Configure Docker (Non-root access)

```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Apply changes (logout and login again, or run)
newgrp docker

# Test Docker without sudo
docker run hello-world
```

### 2.3 Install Docker Compose (if not installed)

```bash
# Download latest version
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker-compose --version
```

---

## 📦 STEP 3: CLONE & CONFIGURE PROJECT

### 3.1 Clone Repository

```bash
# Navigate to home directory
cd ~

# Clone your repository
git clone https://github.com/maheshmhhiremath2025/marketplace.git

# Navigate to project
cd marketplace

# Check files
ls -la
```

### 3.2 Create Required Directories

```bash
# Create logs directory
mkdir -p logs

# Create SSL certificates directory
mkdir -p ssl

# Set permissions
chmod 755 logs ssl
```

---

## 🔐 STEP 4: ENVIRONMENT VARIABLES SETUP

### 4.1 Create Production Environment File

```bash
# Create .env file
nano .env.production
```

### 4.2 Add Environment Variables

**Copy and paste this, then modify with YOUR values:**

```env
# ============================================
# APPLICATION SETTINGS
# ============================================
NODE_ENV=production
PORT=3000

# ============================================
# DOMAIN & URL CONFIGURATION
# ============================================
# Replace with YOUR domain
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com

# ============================================
# NEXTAUTH SECRET
# ============================================
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=REPLACE_WITH_RANDOM_SECRET_HERE

# ============================================
# DATABASE CONFIGURATION
# ============================================
# Option 1: Local MongoDB (Docker)
MONGODB_URI=mongodb://admin:hexalabs123@mongo:27017/hexalabs?authSource=admin

# Option 2: MongoDB Atlas (Cloud - Recommended for Production)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hexalabs?retryWrites=true&w=majority

# ============================================
# RAZORPAY PAYMENT GATEWAY
# ============================================
# Test keys (replace with production keys for live payments)
RAZORPAY_KEY_ID=rzp_test_S5MyGzMGCVaygJ
RAZORPAY_KEY_SECRET=JI1GepYekJNY2PJBdJNmkE2W

# Production keys (uncomment when ready)
# RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_ID
# RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY

# ============================================
# GOOGLE OAUTH (Optional)
# ============================================
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ============================================
# GITHUB OAUTH (Optional)
# ============================================
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# ============================================
# EMAIL CONFIGURATION (Optional)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# ============================================
# REDIS (Optional - for caching)
# ============================================
REDIS_URL=redis://redis:6379

# ============================================
# ZOHO BOOKS (Optional - for invoicing)
# ============================================
ZOHO_CLIENT_ID=your-zoho-client-id
ZOHO_CLIENT_SECRET=your-zoho-client-secret
ZOHO_REFRESH_TOKEN=your-refresh-token
ZOHO_ORGANIZATION_ID=your-org-id
```

**Save and exit**: Press `Ctrl+X`, then `Y`, then `Enter`

### 4.3 Generate NEXTAUTH_SECRET

```bash
# Generate secret
openssl rand -base64 32

# Copy the output and replace NEXTAUTH_SECRET in .env.production
```

### 4.4 Secure Environment File

```bash
# Set proper permissions (only owner can read)
chmod 600 .env.production

# Verify
ls -la .env.production
```

---

## 🌐 STEP 5: DOMAIN & SSL CONFIGURATION

### 5.1 Point Domain to Server

**In your domain registrar (GoDaddy, Namecheap, etc.):**

1. Go to DNS settings
2. Add/Update A Record:
   - **Type**: A
   - **Name**: @ (or your-domain.com)
   - **Value**: Your server IP address
   - **TTL**: 3600

3. Add/Update A Record for www:
   - **Type**: A
   - **Name**: www
   - **Value**: Your server IP address
   - **TTL**: 3600

4. Wait 5-30 minutes for DNS propagation

### 5.2 Verify DNS Propagation

```bash
# Check if domain points to your server
dig your-domain.com +short

# Should show your server IP
```

### 5.3 Install Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### 5.4 Configure Nginx for Your Domain

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/hexalabs
```

**Add this configuration (replace your-domain.com):**

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;
    
    # For Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # Public files
    location /public {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=3600";
    }
}
```

**Save and exit**: `Ctrl+X`, `Y`, `Enter`

### 5.5 Enable Nginx Configuration

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/hexalabs /etc/nginx/sites-enabled/

# Remove default configuration
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 5.6 Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (option 2)

# Verify auto-renewal
sudo certbot renew --dry-run
```

### 5.7 Configure Auto-Renewal

```bash
# Certbot auto-renewal is already set up
# Verify cron job
sudo systemctl status certbot.timer

# Manual renewal test
sudo certbot renew --dry-run
```

---

## 🚀 STEP 6: BUILD & DEPLOY

### 6.1 Update next.config.js for Standalone Build

```bash
# Edit next.config.js
nano next.config.js
```

**Add this at the top of the config:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // ... rest of your config
}

module.exports = nextConfig
```

### 6.2 Create Production Docker Compose

```bash
# Create docker-compose.prod.yml
nano docker-compose.prod.yml
```

**Add this configuration:**

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.cluster
    container_name: hexalabs-marketplace
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    depends_on:
      - mongo
      - redis
    networks:
      - hexalabs-network
    volumes:
      - ./logs:/app/logs
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  mongo:
    image: mongo:7.0
    container_name: hexalabs-mongo
    restart: unless-stopped
    ports:
      - "127.0.0.1:27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: hexalabs123
      MONGO_INITDB_DATABASE: hexalabs
    volumes:
      - mongo-data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
      - ./backups:/backups
    networks:
      - hexalabs-network
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G

  redis:
    image: redis:7-alpine
    container_name: hexalabs-redis
    restart: unless-stopped
    ports:
      - "127.0.0.1:6379:6379"
    command: redis-server --appendonly yes --requirepass hexalabs_redis_pass
    volumes:
      - redis-data:/data
    networks:
      - hexalabs-network
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M

networks:
  hexalabs-network:
    driver: bridge

volumes:
  mongo-data:
    driver: local
  redis-data:
    driver: local
```

### 6.3 Build Docker Images

```bash
# Build the application
docker compose -f docker-compose.prod.yml build

# This may take 5-10 minutes
```

### 6.4 Start Services

```bash
# Start all services in detached mode
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### 6.5 Verify Deployment

```bash
# Check if app is running
curl http://localhost:3000

# Check from outside
curl https://your-domain.com

# Check worker processes
docker exec hexalabs-marketplace pm2 list
```

---

## 🔄 STEP 7: AUTO-RESTART CONFIGURATION

### 7.1 Docker Auto-Restart (Already Configured)

The `restart: unless-stopped` policy in docker-compose.prod.yml ensures:
- Containers restart automatically if they crash
- Containers start automatically when server reboots
- Containers don't restart if manually stopped

### 7.2 PM2 Auto-Restart (Inside Container)

PM2 is already configured in `ecosystem.config.js` with:
- Auto-restart on crashes
- Memory limit monitoring
- Graceful shutdown

### 7.3 System-Level Auto-Start

```bash
# Enable Docker to start on boot
sudo systemctl enable docker

# Verify
sudo systemctl is-enabled docker
```

### 7.4 Create Systemd Service (Alternative Method)

```bash
# Create service file
sudo nano /etc/systemd/system/hexalabs.service
```

**Add this:**

```ini
[Unit]
Description=Hexalabs Marketplace
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/hexalabs/marketplace
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down
User=hexalabs

[Install]
WantedBy=multi-user.target
```

```bash
# Enable service
sudo systemctl enable hexalabs.service

# Start service
sudo systemctl start hexalabs.service

# Check status
sudo systemctl status hexalabs.service
```

---

## 📊 STEP 8: MONITORING & LOGS

### 8.1 View Application Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f app

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100 app

# PM2 logs inside container
docker exec hexalabs-marketplace pm2 logs

# View log files
tail -f logs/pm2-out.log
tail -f logs/pm2-error.log
```

### 8.2 Monitor Resources

```bash
# Container stats
docker stats

# Specific container
docker stats hexalabs-marketplace

# PM2 monitoring
docker exec hexalabs-marketplace pm2 monit
```

### 8.3 Health Checks

```bash
# Check health status
docker compose -f docker-compose.prod.yml ps

# Manual health check
curl http://localhost:3000/api/health

# Check from domain
curl https://your-domain.com/api/health
```

### 8.4 Set Up Log Rotation

```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/hexalabs
```

**Add this:**

```
/home/hexalabs/marketplace/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 hexalabs hexalabs
    sharedscripts
    postrotate
        docker exec hexalabs-marketplace pm2 reloadLogs
    endscript
}
```

---

## 🆘 STEP 9: CRASH RECOVERY

### 9.1 If Application Crashes

```bash
# Check status
docker compose -f docker-compose.prod.yml ps

# View logs to find error
docker compose -f docker-compose.prod.yml logs --tail=100 app

# Restart specific service
docker compose -f docker-compose.prod.yml restart app

# Restart all services
docker compose -f docker-compose.prod.yml restart
```

### 9.2 If Database Crashes

```bash
# Check MongoDB status
docker compose -f docker-compose.prod.yml logs mongo

# Restart MongoDB
docker compose -f docker-compose.prod.yml restart mongo

# If data corruption, restore from backup (see Step 10)
```

### 9.3 If Entire Server Crashes/Reboots

**Everything auto-restarts automatically!**

1. Docker starts on boot (systemd)
2. Docker Compose starts containers (restart policy)
3. PM2 starts workers inside container
4. Nginx starts and routes traffic

**Manual verification after reboot:**

```bash
# Check Docker
sudo systemctl status docker

# Check containers
docker compose -f docker-compose.prod.yml ps

# Check Nginx
sudo systemctl status nginx

# Check application
curl https://your-domain.com
```

### 9.4 Emergency Restart Script

```bash
# Create restart script
nano ~/restart-hexalabs.sh
```

**Add this:**

```bash
#!/bin/bash

echo "🔄 Restarting Hexalabs Marketplace..."

cd /home/hexalabs/marketplace

# Stop services
echo "⏹️  Stopping services..."
docker compose -f docker-compose.prod.yml down

# Wait
sleep 5

# Start services
echo "▶️  Starting services..."
docker compose -f docker-compose.prod.yml up -d

# Wait for startup
sleep 10

# Check status
echo "✅ Checking status..."
docker compose -f docker-compose.prod.yml ps

echo "📊 Worker status:"
docker exec hexalabs-marketplace pm2 list

echo "🎉 Restart complete!"
```

```bash
# Make executable
chmod +x ~/restart-hexalabs.sh

# Run when needed
~/restart-hexalabs.sh
```

---

## 💾 STEP 10: BACKUP & RESTORE

### 10.1 Automated Backup Script

```bash
# Create backup script
nano ~/backup-hexalabs.sh
```

**Add this:**

```bash
#!/bin/bash

BACKUP_DIR="/home/hexalabs/marketplace/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="hexalabs_backup_$DATE.tar.gz"

echo "📦 Starting backup..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
echo "💾 Backing up database..."
docker exec hexalabs-mongo mongodump \
  --username admin \
  --password hexalabs123 \
  --authenticationDatabase admin \
  --db hexalabs \
  --out /backups/mongo_$DATE

# Backup environment files
echo "📄 Backing up configuration..."
cd /home/hexalabs/marketplace
tar -czf $BACKUP_DIR/$BACKUP_FILE \
  .env.production \
  ecosystem.config.js \
  docker-compose.prod.yml \
  backups/mongo_$DATE

# Remove old backups (keep last 7 days)
find $BACKUP_DIR -name "hexalabs_backup_*.tar.gz" -mtime +7 -delete

echo "✅ Backup complete: $BACKUP_FILE"
```

```bash
# Make executable
chmod +x ~/backup-hexalabs.sh

# Test backup
~/backup-hexalabs.sh
```

### 10.2 Schedule Automated Backups

```bash
# Edit crontab
crontab -e

# Add this line (daily backup at 2 AM)
0 2 * * * /home/hexalabs/backup-hexalabs.sh >> /home/hexalabs/backup.log 2>&1
```

### 10.3 Restore from Backup

```bash
# List backups
ls -lh /home/hexalabs/marketplace/backups/

# Extract backup
cd /home/hexalabs/marketplace
tar -xzf backups/hexalabs_backup_YYYYMMDD_HHMMSS.tar.gz

# Restore MongoDB
docker exec hexalabs-mongo mongorestore \
  --username admin \
  --password hexalabs123 \
  --authenticationDatabase admin \
  --db hexalabs \
  --drop \
  /backups/mongo_YYYYMMDD_HHMMSS/hexalabs

# Restart services
docker compose -f docker-compose.prod.yml restart
```

---

## 🔧 STEP 11: TROUBLESHOOTING

### Issue 1: Cannot Access Application

```bash
# Check if containers are running
docker compose -f docker-compose.prod.yml ps

# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Check firewall
sudo ufw status

# Check DNS
dig your-domain.com +short

# Check SSL
sudo certbot certificates

# View logs
docker compose -f docker-compose.prod.yml logs app
```

### Issue 2: Database Connection Error

```bash
# Check MongoDB
docker compose -f docker-compose.prod.yml logs mongo

# Test connection
docker exec -it hexalabs-mongo mongosh \
  -u admin \
  -p hexalabs123 \
  --authenticationDatabase admin

# Restart MongoDB
docker compose -f docker-compose.prod.yml restart mongo
```

### Issue 3: Out of Memory

```bash
# Check memory usage
free -h
docker stats

# Increase swap (if needed)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Issue 4: SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew

# Force renewal
sudo certbot renew --force-renewal

# Check certificate
sudo certbot certificates

# Test auto-renewal
sudo certbot renew --dry-run
```

### Issue 5: Port Already in Use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>

# Or stop Docker containers
docker compose -f docker-compose.prod.yml down
```

---

## ✅ DEPLOYMENT CHECKLIST

```
SERVER SETUP
[ ] Server provisioned and accessible via SSH
[ ] System updated (apt update && apt upgrade)
[ ] Firewall configured (ports 80, 443, 22)
[ ] Docker installed and running
[ ] Docker Compose installed

PROJECT SETUP
[ ] Repository cloned
[ ] .env.production created with all variables
[ ] NEXTAUTH_SECRET generated
[ ] next.config.js updated with output: 'standalone'
[ ] Logs directory created

DOMAIN & SSL
[ ] Domain DNS A record points to server IP
[ ] DNS propagated (verified with dig)
[ ] Nginx installed and configured
[ ] SSL certificate obtained (Let's Encrypt)
[ ] HTTPS redirect working

DEPLOYMENT
[ ] Docker images built successfully
[ ] Containers started (docker-compose up -d)
[ ] Application accessible at https://your-domain.com
[ ] Workers running (pm2 list shows 4 processes)
[ ] Health check passing

AUTO-RESTART
[ ] Docker restart policy configured
[ ] PM2 auto-restart enabled
[ ] Docker systemd service enabled
[ ] Tested server reboot (everything auto-starts)

MONITORING & BACKUP
[ ] Log rotation configured
[ ] Backup script created and tested
[ ] Automated backups scheduled (cron)
[ ] Monitoring tools set up

SECURITY
[ ] Environment files secured (chmod 600)
[ ] Firewall rules applied
[ ] SSL certificate auto-renewal working
[ ] Production API keys configured

PRODUCTION READY! 🎉
```

---

## 📞 QUICK REFERENCE COMMANDS

```bash
# Start services
docker compose -f docker-compose.prod.yml up -d

# Stop services
docker compose -f docker-compose.prod.yml down

# Restart services
docker compose -f docker-compose.prod.yml restart

# View logs
docker compose -f docker-compose.prod.yml logs -f app

# Check status
docker compose -f docker-compose.prod.yml ps

# PM2 status
docker exec hexalabs-marketplace pm2 list

# PM2 logs
docker exec hexalabs-marketplace pm2 logs

# PM2 restart
docker exec hexalabs-marketplace pm2 restart all

# Backup
~/backup-hexalabs.sh

# Emergency restart
~/restart-hexalabs.sh

# Nginx reload
sudo systemctl reload nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# SSL renewal
sudo certbot renew
```

---

## 🎉 CONGRATULATIONS!

Your Hexalabs Marketplace is now deployed with:

✅ Auto-restart on crashes
✅ Auto-start on server reboot
✅ 4 worker processes for high performance
✅ SSL/HTTPS enabled
✅ Domain configured
✅ Automated backups
✅ Monitoring and logging
✅ Production-ready configuration

**Your application is live at**: https://your-domain.com

---

**Need help?** Review the troubleshooting section or check logs for errors.
