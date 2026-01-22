#!/bin/bash

# Hexalabs Marketplace - Quick Deploy Script
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 Hexalabs Marketplace - Quick Deploy"
echo "========================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  Please run as root or with sudo"
    exit 1
fi

# Variables
PROJECT_DIR="/home/hexalabs/marketplace"
DOMAIN="hexlabs.online"

# Get domain from user
read -p "Enter your domain name (e.g., hexalabs.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo "❌ Domain name is required!"
    exit 1
fi

echo ""
echo "📋 Configuration:"
echo "   Domain: $DOMAIN"
echo "   Project Dir: $PROJECT_DIR"
echo ""
read -p "Continue? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Update system
echo "📦 Updating system..."
apt update && apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Install Nginx
echo "🌐 Installing Nginx..."
apt install -y nginx

# Install Certbot
echo "🔒 Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Configure firewall
echo "🔥 Configuring firewall..."
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Clone repository
echo "📥 Cloning repository..."
if [ ! -d "$PROJECT_DIR" ]; then
    git clone https://github.com/maheshmhhiremath2025/marketplace.git $PROJECT_DIR
fi

cd $PROJECT_DIR

# Create .env.production
echo "⚙️  Creating environment file..."
if [ ! -f .env.production ]; then
    cp .env.production.example .env.production
    
    # Generate NEXTAUTH_SECRET
    SECRET=$(openssl rand -base64 32)
    
    # Update .env.production
    sed -i "s|your-domain.com|$DOMAIN|g" .env.production
    sed -i "s|REPLACE_WITH_RANDOM_SECRET_HERE|$SECRET|g" .env.production
    
    echo "✅ Environment file created"
    echo "⚠️  Please edit .env.production and add your API keys"
fi

# Configure Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/hexalabs <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/hexalabs /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Get SSL certificate
echo "🔒 Getting SSL certificate..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Build and deploy
echo "🏗️  Building application..."
docker compose -f docker-compose.prod.yml build

echo "🚀 Starting services..."
docker compose -f docker-compose.prod.yml up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 15

# Check status
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Status:"
docker compose -f docker-compose.prod.yml ps
echo ""
echo "🌐 Your application should be available at:"
echo "   https://$DOMAIN"
echo ""
echo "📝 Next steps:"
echo "   1. Edit .env.production and add your API keys"
echo "   2. Restart services: docker compose -f docker-compose.prod.yml restart"
echo "   3. View logs: docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🎉 Happy deploying!"
