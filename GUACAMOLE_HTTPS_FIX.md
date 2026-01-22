# 🔧 Guacamole HTTPS Proxy Setup

## Problem
The iframe shows a blank screen because:
- Marketplace runs on **HTTPS** (https://marketplace.hexalabs.online)
- Guacamole runs on **HTTP** (http://20.193.146.110:8080/guacamole)
- Browsers block **mixed content** (HTTP resources on HTTPS pages)

## Solution: Nginx Reverse Proxy

### Step 1: Update Nginx Configuration

Add this to your Nginx config (`/etc/nginx/sites-available/marketplace.hexalabs.online`):

```nginx
server {
    listen 80;
    server_name marketplace.hexalabs.online;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name marketplace.hexalabs.online;

    ssl_certificate /etc/letsencrypt/live/marketplace.hexalabs.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/marketplace.hexalabs.online/privkey.pem;

    # Main application
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

    # Guacamole proxy (NEW - ADD THIS)
    location /guacamole/ {
        proxy_pass http://20.193.146.110:8080/guacamole/;
        proxy_buffering off;
        proxy_http_version 1.1;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $http_connection;
        access_log off;
        
        # WebSocket support
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Step 2: Test and Reload Nginx

```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 3: Update Environment Variable

Update `.env.local` on the server:

```bash
# OLD
GUACAMOLE_URL=http://20.193.146.110:8080/guacamole

# NEW
GUACAMOLE_URL=https://marketplace.hexalabs.online/guacamole
```

### Step 4: Update LabConsole.tsx

The hardcoded URL needs to be changed to use the environment variable.

### Step 5: Restart Docker

```bash
cd ~/hexalabs-marketplace-newapi
docker-compose down
docker-compose up -d
```

## Alternative: Direct HTTPS to Guacamole Server

If you have access to the Guacamole server (20.193.146.110), you can:

1. Install SSL certificate on that server
2. Configure Tomcat/Guacamole to use HTTPS
3. Update GUACAMOLE_URL to `https://20.193.146.110:8443/guacamole`

## Verification

After setup, check browser console:
- ✅ No "Mixed Content" warnings
- ✅ Iframe loads successfully
- ✅ Guacamole login screen appears

## Troubleshooting

### Still seeing blank screen?
```bash
# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check if Guacamole is accessible
curl -I http://20.193.146.110:8080/guacamole
```

### WebSocket connection fails?
Ensure Nginx has WebSocket support enabled (shown in config above).
