# 🔒 SSL Deployment Guide - marketplace.hexalabs.online

## ✅ Prerequisites Completed
- [x] Domain: `marketplace.hexalabs.online`
- [x] SSL Certificate installed
- [x] Docker containers running

## 🚀 Deployment Steps

### 1️⃣ Update Environment Variables on Server

SSH into your Ubuntu server and update `.env.local`:

```bash
cd ~/hexalabs-marketplace-newapi
nano .env.local
```

Update the following line:
```bash
NEXTAUTH_URL=https://marketplace.hexalabs.online
```

Save and exit (`Ctrl+X`, then `Y`, then `Enter`).

### 2️⃣ Update OAuth Provider Redirect URIs

#### 🔵 Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   ```
   https://marketplace.hexalabs.online/api/auth/callback/google
   ```
5. Click **Save**

#### 🔷 Microsoft OAuth Configuration

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Select your application
4. Go to **Authentication** → **Platform configurations** → **Web**
5. Under **Redirect URIs**, add:
   ```
   https://marketplace.hexalabs.online/api/auth/callback/microsoft
   ```
6. Click **Save**

### 3️⃣ Restart Docker Containers

```bash
cd ~/hexalabs-marketplace-newapi
docker-compose down
docker-compose up -d
docker-compose logs -f app
```

### 4️⃣ Verify Deployment

#### Test HTTPS Access
```bash
curl https://marketplace.hexalabs.online
```

#### Test OAuth Endpoints
- Google: `https://marketplace.hexalabs.online/api/auth/signin`
- Microsoft: `https://marketplace.hexalabs.online/api/auth/signin`

#### Check Application Logs
```bash
docker-compose logs -f app | grep -i "ready\|error\|auth"
```

## 🔐 SSL Certificate Renewal (Let's Encrypt)

If using Let's Encrypt, set up auto-renewal:

```bash
# Test renewal
sudo certbot renew --dry-run

# Auto-renewal is typically set up via cron
sudo systemctl status certbot.timer
```

## 🌐 Nginx Configuration (If Using Reverse Proxy)

If you're using Nginx as a reverse proxy, your config should look like:

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

## 📋 Post-Deployment Checklist

- [ ] HTTPS loads successfully
- [ ] Google OAuth login works
- [ ] Microsoft OAuth login works
- [ ] All API endpoints accessible
- [ ] MongoDB connection stable
- [ ] Redis caching functional
- [ ] Email notifications working
- [ ] Payment gateway (Razorpay) functional

## 🔧 Troubleshooting

### OAuth Redirect Mismatch Error
**Problem:** `redirect_uri_mismatch` error

**Solution:**
1. Verify the redirect URI in OAuth provider matches exactly:
   - Google: `https://marketplace.hexalabs.online/api/auth/callback/google`
   - Microsoft: `https://marketplace.hexalabs.online/api/auth/callback/microsoft`
2. Ensure `NEXTAUTH_URL` in `.env.local` is `https://marketplace.hexalabs.online`
3. Restart Docker containers

### SSL Certificate Issues
**Problem:** Certificate not trusted or expired

**Solution:**
```bash
# Check certificate validity
sudo certbot certificates

# Renew certificate
sudo certbot renew --force-renewal

# Restart Nginx
sudo systemctl restart nginx
```

### Application Not Loading
**Problem:** 502 Bad Gateway or connection refused

**Solution:**
```bash
# Check if Docker containers are running
docker-compose ps

# Check application logs
docker-compose logs -f app

# Restart containers
docker-compose restart
```

## 📞 Support

For issues, check:
1. Application logs: `docker-compose logs -f app`
2. Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. SSL certificate: `sudo certbot certificates`

---

**Deployment Date:** 2026-01-22  
**Domain:** marketplace.hexalabs.online  
**SSL Provider:** Let's Encrypt (assumed)
