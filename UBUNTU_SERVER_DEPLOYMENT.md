# Hexalabs Marketplace - Ubuntu Server Deployment Guide

**Complete Step-by-Step Deployment on Ubuntu Server**

---

## 📋 Table of Contents

1. [Server Requirements](#server-requirements)
2. [Initial Server Setup](#initial-server-setup)
3. [Install Required Software](#install-required-software)
4. [Clone and Setup Project](#clone-and-setup-project)
5. [Configure Environment](#configure-environment)
6. [Setup Docker Services](#setup-docker-services)
7. [Configure Nginx Reverse Proxy](#configure-nginx-reverse-proxy)
8. [Setup SSL Certificate](#setup-ssl-certificate)
9. [Start Application](#start-application)
10. [Verify Deployment](#verify-deployment)
11. [Monitoring & Maintenance](#monitoring--maintenance)
12. [Troubleshooting](#troubleshooting)

---

## Server Requirements

### Minimum Specifications
- **OS:** Ubuntu 20.04 LTS or 22.04 LTS
- **CPU:** 2 cores
- **RAM:** 4 GB
- **Storage:** 40 GB SSD
- **Network:** Public IP address

### Recommended Specifications
- **OS:** Ubuntu 22.04 LTS
- **CPU:** 4 cores
- **RAM:** 8 GB
- **Storage:** 80 GB SSD
- **Network:** Public IP + Domain name

---

## Initial Server Setup

### Step 1: Connect to Your Server

```bash
# SSH into your Ubuntu server
ssh root@YOUR_SERVER_IP

# Or if using a different user
ssh username@YOUR_SERVER_IP
```

### Step 2: Update System

```bash
# Update package list
sudo apt update

# Upgrade all packages
sudo apt upgrade -y

# Install basic utilities
sudo apt install -y curl wget git vim ufw
```

### Step 3: Create Deployment User (Optional but Recommended)

```bash
# Create a new user for deployment
sudo adduser hexalabs

# Add user to sudo group
sudo usermod -aG sudo hexalabs

# Switch to new user
su - hexalabs
```

### Step 4: Configure Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

---

## Install Required Software

### Step 1: Install Docker

```bash
# Remove old versions (if any)
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

# Set up stable repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add current user to docker group
sudo usermod -aG docker $USER

# Apply group changes (or logout and login again)
newgrp docker

# Verify installation
docker --version
docker compose version
```

### Step 2: Install Node.js (for building)

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 3: Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

---

## Clone and Setup Project

### Step 1: Clone Repository

```bash
# Navigate to home directory
cd ~

# Clone the repository
git clone https://github.com/maheshmhhiremath2025/hexalabs-marketplace-newapi.git hexalabs-marketplace

# Navigate to project
cd hexalabs-marketplace
```

**Note:** If the repository is private or you're copying from your local machine:

```powershell
# On your local Windows machine, copy the entire folder to server:
scp -r c:\Users\Orcon\.gemini\antigravity\scratch\hexalabs-marketplace username@YOUR_SERVER_IP:~/
```

### Step 2: Install Dependencies

```bash
# Install npm dependencies
npm install

# This will install all packages from package.json
```

---

## Configure Environment

### Step 1: Copy Your Existing .env.local File

**Option A: Copy from local machine**

On your **local Windows machine**, run:

```powershell
# Copy .env.local to server
scp c:\Users\Orcon\.gemini\antigravity\scratch\hexalabs-marketplace\.env.local username@YOUR_SERVER_IP:~/hexalabs-marketplace/
```

**Option B: Create manually on server**

On your **Ubuntu server**:

```bash
# Navigate to project directory
cd ~/hexalabs-marketplace

# Create .env.local file
nano .env.local
```

Paste your existing `.env.local` content:

```env
MONGODB_URI=mongodb://localhost:27020/hexalabs
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=YOUR_NEXTAUTH_SECRET_HERE

# JWT Secret for API authentication
JWT_SECRET=YOUR_JWT_SECRET_HERE

# Redis for rate limiting
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=true

AZURE_CLIENT_ID=your_azure_client_id_here
AZURE_CLIENT_SECRET=your_azure_client_secret_here
AZURE_SUBSCRIPTION_ID=your_subscription_id_here
AZURE_TENANT_ID=your_tenant_id_here
GUACAMOLE_URL=http://20.193.146.110:8080/guacamole
GUACAMOLE_USERNAME=guacadmin
GUACAMOLE_PASSWORD=guacadmin
AZURE_AD_DOMAIN=maheshmhhiremathgmail.onmicrosoft.com
AZURE_CUSTOM_ROLE_ID=/subscriptions/YOUR_SUB_ID/providers/Microsoft.Authorization/roleDefinitions/YOUR_ROLE_ID
AZURE_CUSTOM_INITIATIVE_ID=/subscriptions/YOUR_SUB_ID/providers/Microsoft.Authorization/policySetDefinitions/YOUR_INITIATIVE_ID

# Email Configuration
EMAIL_USER=hexalabsmktplace@gmail.com
EMAIL_PASSWORD=your_gmail_app_password_here

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_razorpay_secret_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXX

# Currency & Tax
EXCHANGE_RATE_USD_TO_INR=83
TAX_RATE=0.18

# Zoho Books Configuration
ZOHO_CLIENT_ID=your_zoho_client_id_here
ZOHO_CLIENT_SECRET=your_zoho_client_secret_here
ZOHO_REFRESH_TOKEN=your_zoho_refresh_token_here
ZOHO_ORGANIZATION_ID=your_zoho_org_id_here
ZOHO_AUTH_DOMAIN=https://accounts.zoho.in
ZOHO_API_DOMAIN=https://www.zohoapis.in

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here

# Organization Request Email
ORG_REQUEST_EMAIL=labs@hexalabs.online
```

**Save and exit** (Ctrl+X, then Y, then Enter)

### Step 2: Update URLs for Production

```bash
# Edit .env.local
nano .env.local
```

**Update these lines** (replace `yourdomain.com` with your actual domain):

```env
# Change from localhost to your domain
NEXTAUTH_URL=https://yourdomain.com

# MongoDB - keep as localhost (Docker internal)
MONGODB_URI=mongodb://localhost:27020/hexalabs

# Redis - keep as localhost (Docker internal)
REDIS_URL=redis://localhost:6379
```

**Save and exit**

---

## Setup Docker Services

### Step 1: Review docker-compose.yml

Your `docker-compose.yml` should already be configured. Verify it exists:

```bash
cat docker-compose.yml
```

### Step 2: Build Application

```bash
# Build Next.js application
npm run build

# This creates the production build
```

### Step 3: Start Docker Services

```bash
# Start all services in background
docker compose up -d

# This starts:
# - MongoDB
# - Redis
# - Next.js App
# - Mongo Express (optional)
```

### Step 4: Verify Containers

```bash
# Check running containers
docker compose ps

# You should see:
# - hexalabs-marketplace (app)
# - hexalabs-mongo (database)
# - hexalabs-redis (cache)
# - hexalabs-mongo-express (optional UI)
```

### Step 5: View Logs

```bash
# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f app
docker compose logs -f mongo
docker compose logs -f redis
```

---

## Configure Nginx Reverse Proxy

### Step 1: Create Nginx Configuration

```bash
# Create new site configuration
sudo nano /etc/nginx/sites-available/hexalabs
```

**Paste this configuration** (replace `yourdomain.com`):

```nginx
# Hexalabs Marketplace Nginx Configuration

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Logs
    access_log /var/log/nginx/hexalabs-access.log;
    error_log /var/log/nginx/hexalabs-error.log;

    # Client upload size
    client_max_body_size 50M;

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
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }

    # Images caching
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        proxy_pass http://localhost:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

**Save and exit**

### Step 2: Enable Site

```bash
# Create symbolic link to enable site
sudo ln -s /etc/nginx/sites-available/hexalabs /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

---

## Setup SSL Certificate

### Step 1: Install Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Obtain SSL Certificate

```bash
# Get SSL certificate (replace with your domain and email)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com --email your-email@example.com --agree-tos --no-eff-email

# Certbot will automatically:
# 1. Verify domain ownership
# 2. Obtain certificate
# 3. Update Nginx configuration
# 4. Reload Nginx
```

### Step 3: Test Auto-Renewal

```bash
# Test certificate renewal
sudo certbot renew --dry-run

# Certificates will auto-renew via cron job
```

---

## Start Application

### Step 1: Verify All Services

```bash
# Check Docker containers
docker compose ps

# Check Nginx
sudo systemctl status nginx

# Check if app is responding
curl http://localhost:3000
```

### Step 2: Test Application

```bash
# Test from server
curl https://yourdomain.com

# Should return HTML content
```

### Step 3: Access from Browser

Open your browser and navigate to:
- **https://yourdomain.com**

You should see the Hexalabs Marketplace homepage!

---

## Verify Deployment

### Checklist

- [ ] **Application loads** at https://yourdomain.com
- [ ] **SSL certificate** is valid (green padlock)
- [ ] **User login** works (Google/Microsoft OAuth)
- [ ] **Lab browsing** works
- [ ] **Cart functionality** works
- [ ] **Payment** works (test mode)
- [ ] **MongoDB** is accessible
- [ ] **Redis** is working (check cache)
- [ ] **Email notifications** are sent

### Test Commands

```bash
# 1. Check MongoDB
docker exec hexalabs-mongo mongosh --eval "db.adminCommand('ping')"

# 2. Check Redis
docker exec hexalabs-redis redis-cli ping

# 3. Check application logs
docker compose logs -f app

# 4. Check Nginx logs
sudo tail -f /var/log/nginx/hexalabs-access.log
sudo tail -f /var/log/nginx/hexalabs-error.log

# 5. Test API endpoints
curl https://yourdomain.com/api/health
curl https://yourdomain.com/api/v1/labs
```

---

## Monitoring & Maintenance

### Daily Monitoring

```bash
# Check container status
docker compose ps

# Check disk space
df -h

# Check memory usage
free -h

# Check logs for errors
docker compose logs --tail=100 app | grep -i error
```

### Weekly Maintenance

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean up Docker
docker system prune -a --volumes -f

# Backup database
docker exec hexalabs-mongo mongodump --out=/data/backup-$(date +%Y%m%d)

# Check SSL certificate expiry
sudo certbot certificates
```

### Backup Strategy

```bash
# Create backup script
nano ~/backup.sh
```

```bash
#!/bin/bash
# Hexalabs Backup Script

BACKUP_DIR="/home/hexalabs/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
docker exec hexalabs-mongo mongodump --out=/tmp/backup-$DATE
docker cp hexalabs-mongo:/tmp/backup-$DATE $BACKUP_DIR/mongo-$DATE

# Backup .env.local
cp ~/hexalabs-marketplace/.env.local $BACKUP_DIR/env-$DATE

# Backup uploaded files (if any)
# tar -czf $BACKUP_DIR/uploads-$DATE.tar.gz ~/hexalabs-marketplace/public/uploads

# Remove backups older than 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
chmod +x ~/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e

# Add this line:
0 2 * * * /home/hexalabs/backup.sh >> /home/hexalabs/backup.log 2>&1
```

### Auto-Restart on Failure

```bash
# Docker containers already have restart: unless-stopped
# But you can also create a systemd service

sudo nano /etc/systemd/system/hexalabs.service
```

```ini
[Unit]
Description=Hexalabs Marketplace
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/hexalabs/hexalabs-marketplace
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
User=hexalabs

[Install]
WantedBy=multi-user.target
```

```bash
# Enable service
sudo systemctl enable hexalabs
sudo systemctl start hexalabs
```

---

## Troubleshooting

### Application Not Loading

```bash
# Check if containers are running
docker compose ps

# Check app logs
docker compose logs app

# Restart containers
docker compose restart

# Check Nginx
sudo nginx -t
sudo systemctl status nginx
```

### MongoDB Connection Issues

```bash
# Check MongoDB container
docker compose logs mongo

# Test connection
docker exec hexalabs-mongo mongosh --eval "db.adminCommand('ping')"

# Restart MongoDB
docker compose restart mongo
```

### Redis Connection Issues

```bash
# Check Redis container
docker compose logs redis

# Test connection
docker exec hexalabs-redis redis-cli ping

# Restart Redis
docker compose restart redis
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Check Nginx configuration
sudo nginx -t
```

### High Memory Usage

```bash
# Check memory
free -h

# Check Docker memory
docker stats

# Restart containers
docker compose restart

# Clean up unused Docker resources
docker system prune -a
```

### Application Errors

```bash
# View application logs
docker compose logs -f app

# Check for errors
docker compose logs app | grep -i error

# Restart application
docker compose restart app
```

---

## Useful Commands Reference

### Docker Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Restart services
docker compose restart

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f app

# Execute command in container
docker exec -it hexalabs-marketplace /bin/sh

# Check container stats
docker stats
```

### Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/hexalabs-access.log
sudo tail -f /var/log/nginx/hexalabs-error.log
```

### System Commands

```bash
# Check disk space
df -h

# Check memory
free -h

# Check CPU
top

# Check network
netstat -tulpn

# Check firewall
sudo ufw status
```

---

## Security Best Practices

### Implemented

- ✅ SSL/TLS encryption (HTTPS)
- ✅ Firewall configured (UFW)
- ✅ Nginx security headers
- ✅ Environment variables secured
- ✅ Docker containers isolated

### Additional Recommendations

```bash
# 1. Disable root SSH login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart sshd

# 2. Install fail2ban
sudo apt install -y fail2ban
sudo systemctl enable fail2ban

# 3. Enable automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades

# 4. Set up monitoring (optional)
# Install monitoring tools like Prometheus, Grafana, or use cloud monitoring
```

---

## Performance Optimization

### Nginx Caching

Already configured in the Nginx config above with:
- Static file caching (365 days)
- Image caching (30 days)

### Application Optimization

```bash
# Already using:
# - Redis caching (95-99% faster)
# - Next.js production build
# - Docker resource limits
```

### Database Optimization

```bash
# Create indexes (if not already done)
docker exec hexalabs-mongo mongosh hexalabs --eval "
  db.labs.createIndex({ code: 1 });
  db.users.createIndex({ email: 1 });
  db.orders.createIndex({ orderNumber: 1 });
"
```

---

## Conclusion

Your Hexalabs Marketplace is now deployed on Ubuntu server! 🎉

### What You Have

✅ **Production-ready deployment**  
✅ **HTTPS with auto-renewing SSL**  
✅ **Nginx reverse proxy**  
✅ **Docker containerization**  
✅ **MongoDB database**  
✅ **Redis caching**  
✅ **Automated backups**  
✅ **Monitoring setup**  

### Access Points

- **Website:** https://yourdomain.com
- **Mongo Express:** http://YOUR_SERVER_IP:8081 (admin/admin)
- **SSH:** ssh username@YOUR_SERVER_IP

### Next Steps

1. **Test all functionality**
2. **Set up monitoring alerts**
3. **Configure backups offsite**
4. **Update OAuth redirect URLs** to production domain
5. **Switch Razorpay to live mode** (when ready)

---

**Deployment Complete!** 🚀

*Last Updated: January 22, 2026*
