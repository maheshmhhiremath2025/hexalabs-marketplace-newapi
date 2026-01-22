# Hexalabs Marketplace - Production Deployment Guide

Complete step-by-step guide to deploy Hexalabs Marketplace to production.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Service Setup Guides](#service-setup-guides)
   - [Azure Service Principal Setup](#azure-service-principal-setup)
   - [Google OAuth Setup](#google-oauth-setup)
   - [Microsoft OAuth Setup](#microsoft-oauth-setup)
   - [Gmail App Password Setup](#gmail-app-password-setup)
   - [Razorpay Account Setup](#razorpay-account-setup)
   - [MongoDB Atlas Setup](#mongodb-atlas-setup)
   - [Zoho Books Setup](#zoho-books-setup)
3. [Environment Configuration](#environment-configuration)
4. [Deployment Options](#deployment-options)
   - [Option 1: Vercel (Recommended)](#option-1-vercel-recommended)
   - [Option 2: Docker + VPS](#option-2-docker--vps)
   - [Option 3: Azure App Service](#option-3-azure-app-service)
5. [Post-Deployment Setup](#post-deployment-setup)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Service Setup Guides

Before deploying, you need to set up all required third-party services. Follow these detailed guides:

---

### Azure Service Principal Setup

**Purpose:** Required for Azure VM provisioning and management

#### Step 1: Create Azure Service Principal

1. **Login to Azure Portal**
   - Go to https://portal.azure.com
   - Sign in with your Azure account

2. **Open Cloud Shell**
   - Click the Cloud Shell icon (>_) in the top navigation
   - Select "Bash" when prompted

3. **Create Service Principal**
   ```bash
   # Create service principal with Contributor role
   az ad sp create-for-rbac \
     --name "hexalabs-service-principal" \
     --role Contributor \
     --scopes /subscriptions/YOUR_SUBSCRIPTION_ID
   ```

4. **Save the Output**
   ```json
   {
     "appId": "98dc81b0-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
     "displayName": "hexalabs-service-principal",
     "password": "qh68Q~xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
     "tenant": "3f46c9ac-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
   }
   ```

   **Map to Environment Variables:**
   - `appId` → `AZURE_CLIENT_ID`
   - `password` → `AZURE_CLIENT_SECRET`
   - `tenant` → `AZURE_TENANT_ID`

#### Step 2: Get Subscription ID

```bash
# List all subscriptions
az account list --output table

# Get current subscription
az account show --query id -o tsv
```

**Save as:** `AZURE_SUBSCRIPTION_ID`

#### Step 3: Create Custom Role (Optional but Recommended)

1. **Create role definition file** (`custom-role.json`):
   ```json
   {
     "Name": "Hexalabs Lab Manager",
     "Description": "Custom role for Hexalabs lab provisioning",
     "Actions": [
       "Microsoft.Compute/*",
       "Microsoft.Network/*",
       "Microsoft.Resources/*",
       "Microsoft.Storage/*/read"
     ],
     "NotActions": [],
     "AssignableScopes": [
       "/subscriptions/YOUR_SUBSCRIPTION_ID"
     ]
   }
   ```

2. **Create the role:**
   ```bash
   az role definition create --role-definition custom-role.json
   ```

3. **Get the role ID:**
   ```bash
   az role definition list --name "Hexalabs Lab Manager" --query [0].id -o tsv
   ```

**Save as:** `AZURE_CUSTOM_ROLE_ID`

#### Step 4: Get Azure AD Domain

```bash
# Get your Azure AD domain
az ad signed-in-user show --query 'userPrincipalName' -o tsv
```

**Extract domain** (e.g., `yourcompany.onmicrosoft.com`)  
**Save as:** `AZURE_AD_DOMAIN`

---

### Google OAuth Setup

**Purpose:** Enable "Sign in with Google" functionality

#### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit https://console.cloud.google.com
   - Sign in with your Google account

2. **Create New Project**
   - Click "Select a project" → "New Project"
   - **Project name:** Hexalabs Marketplace
   - Click "Create"

#### Step 2: Enable Google+ API

1. **Navigate to APIs & Services**
   - Left menu → "APIs & Services" → "Library"

2. **Enable Google+ API**
   - Search for "Google+ API"
   - Click on it → Click "Enable"

#### Step 3: Configure OAuth Consent Screen

1. **Go to OAuth consent screen**
   - Left menu → "OAuth consent screen"

2. **Choose User Type**
   - Select "External" (for public access)
   - Click "Create"

3. **Fill App Information**
   - **App name:** Hexalabs Marketplace
   - **User support email:** your-email@gmail.com
   - **Developer contact:** your-email@gmail.com
   - Click "Save and Continue"

4. **Scopes** (Step 2)
   - Click "Add or Remove Scopes"
   - Add: `email`, `profile`, `openid`
   - Click "Save and Continue"

5. **Test Users** (Step 3)
   - Add your email for testing
   - Click "Save and Continue"

#### Step 4: Create OAuth Credentials

1. **Go to Credentials**
   - Left menu → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"

2. **Configure OAuth Client**
   - **Application type:** Web application
   - **Name:** Hexalabs Web Client

3. **Add Authorized Redirect URIs**
   ```
   http://localhost:3000/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/google
   ```

4. **Click "Create"**

5. **Save Credentials**
   - **Client ID** → `GOOGLE_CLIENT_ID`
   - **Client Secret** → `GOOGLE_CLIENT_SECRET`

---

### Microsoft OAuth Setup

**Purpose:** Enable "Sign in with Microsoft" functionality

#### Step 1: Register Application in Azure AD

1. **Go to Azure Portal**
   - Visit https://portal.azure.com
   - Navigate to "Azure Active Directory"

2. **Register New Application**
   - Left menu → "App registrations"
   - Click "New registration"

3. **Fill Application Details**
   - **Name:** Hexalabs Marketplace
   - **Supported account types:** Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI:** 
     - Platform: Web
     - URI: `https://yourdomain.com/api/auth/callback/azure-ad`
   - Click "Register"

#### Step 2: Get Application Credentials

1. **Copy Application (client) ID**
   - From the Overview page
   - **Save as:** `MICROSOFT_CLIENT_ID`

2. **Copy Directory (tenant) ID**
   - From the Overview page
   - **Save as:** `AZURE_TENANT_ID` (if not already saved)

#### Step 3: Create Client Secret

1. **Go to Certificates & secrets**
   - Left menu → "Certificates & secrets"
   - Click "New client secret"

2. **Add Client Secret**
   - **Description:** Hexalabs Production
   - **Expires:** 24 months (recommended)
   - Click "Add"

3. **Copy Secret Value**
   - **IMPORTANT:** Copy immediately (won't be shown again)
   - **Save as:** `MICROSOFT_CLIENT_SECRET`

#### Step 4: Configure API Permissions

1. **Go to API permissions**
   - Left menu → "API permissions"
   - Click "Add a permission"

2. **Add Microsoft Graph Permissions**
   - Select "Microsoft Graph"
   - Select "Delegated permissions"
   - Add: `email`, `openid`, `profile`, `User.Read`
   - Click "Add permissions"

3. **Grant Admin Consent** (if required)
   - Click "Grant admin consent for [Your Organization]"

#### Step 5: Add Additional Redirect URIs

1. **Go to Authentication**
   - Left menu → "Authentication"
   - Under "Web" → "Redirect URIs"
   - Add:
     ```
     http://localhost:3000/api/auth/callback/azure-ad
     https://yourdomain.com/api/auth/callback/azure-ad
     ```
   - Click "Save"

---

### Gmail App Password Setup

**Purpose:** Send transactional emails (order confirmations, lab credentials, etc.)

#### Step 1: Enable 2-Factor Authentication

1. **Go to Google Account Security**
   - Visit https://myaccount.google.com/security
   - Sign in with your Gmail account

2. **Enable 2-Step Verification**
   - Scroll to "Signing in to Google"
   - Click "2-Step Verification"
   - Follow the setup wizard
   - Verify with your phone

#### Step 2: Generate App Password

1. **Go to App Passwords**
   - Visit https://myaccount.google.com/apppasswords
   - Or: Security → 2-Step Verification → App passwords

2. **Create App Password**
   - **Select app:** Mail
   - **Select device:** Other (Custom name)
   - **Name:** Hexalabs Marketplace
   - Click "Generate"

3. **Copy the 16-character Password**
   - Example: `gxgj sude lela wgww`
   - **Remove spaces:** `gxgjsudlelawgwwo`
   - **Save as:** `EMAIL_PASSWORD`

4. **Save Your Email**
   - **Your Gmail address** → `EMAIL_USER`

**⚠️ Important Notes:**
- App passwords only work with 2FA enabled
- Each app password is unique - don't reuse
- Store securely - can't be viewed again

---

### Razorpay Account Setup

**Purpose:** Accept payments from customers

#### Step 1: Create Razorpay Account

1. **Sign Up**
   - Visit https://razorpay.com
   - Click "Sign Up"
   - Fill business details
   - Verify email and phone

2. **Complete KYC**
   - Upload business documents
   - PAN card, GST certificate (if applicable)
   - Bank account details
   - Wait for approval (1-2 business days)

#### Step 2: Get API Keys (Test Mode)

1. **Go to Dashboard**
   - Login to https://dashboard.razorpay.com

2. **Navigate to API Keys**
   - Settings → API Keys
   - Click "Generate Test Key"

3. **Copy Test Keys**
   - **Key ID** → `RAZORPAY_KEY_ID` (for testing)
   - **Key Secret** → `RAZORPAY_KEY_SECRET` (for testing)
   - **Key ID** → `NEXT_PUBLIC_RAZORPAY_KEY_ID` (for frontend)

#### Step 3: Get Live API Keys (Production)

1. **Activate Account**
   - Complete KYC verification
   - Wait for account activation

2. **Generate Live Keys**
   - Settings → API Keys
   - Toggle to "Live Mode"
   - Click "Generate Live Key"

3. **Copy Live Keys**
   - **Key ID** → `RAZORPAY_KEY_ID` (production)
   - **Key Secret** → `RAZORPAY_KEY_SECRET` (production)
   - **Key ID** → `NEXT_PUBLIC_RAZORPAY_KEY_ID` (production)

#### Step 4: Configure Webhooks

1. **Go to Webhooks**
   - Settings → Webhooks
   - Click "Create New Webhook"

2. **Add Webhook URL**
   - **URL:** `https://yourdomain.com/api/payment/webhook`
   - **Secret:** (auto-generated - save this)
   - **Events:** Select all payment events
   - Click "Create Webhook"

---

### MongoDB Atlas Setup

**Purpose:** Cloud-hosted MongoDB database

#### Step 1: Create MongoDB Atlas Account

1. **Sign Up**
   - Visit https://www.mongodb.com/cloud/atlas/register
   - Sign up with email or Google

2. **Create Organization**
   - **Organization Name:** Hexalabs
   - Click "Next"

3. **Create Project**
   - **Project Name:** Hexalabs Marketplace
   - Click "Next"

#### Step 2: Create Database Cluster

1. **Choose Deployment**
   - Click "Build a Database"
   - Select "Shared" (Free tier) or "Dedicated" (Production)

2. **Configure Cluster**
   - **Cloud Provider:** AWS / Google Cloud / Azure
   - **Region:** Choose closest to your users
   - **Cluster Tier:** M0 (Free) or M10+ (Production)
   - **Cluster Name:** hexalabs-cluster

3. **Create Cluster**
   - Click "Create Cluster"
   - Wait 3-5 minutes for provisioning

#### Step 3: Create Database User

1. **Security → Database Access**
   - Click "Add New Database User"

2. **Create User**
   - **Authentication Method:** Password
   - **Username:** hexalabs-admin
   - **Password:** (Generate secure password)
   - **Database User Privileges:** Read and write to any database
   - Click "Add User"

#### Step 4: Configure Network Access

1. **Security → Network Access**
   - Click "Add IP Address"

2. **Allow Access**
   - **For Development:** Click "Allow Access from Anywhere" (0.0.0.0/0)
   - **For Production:** Add your server's IP address
   - Click "Confirm"

#### Step 5: Get Connection String

1. **Click "Connect"** on your cluster

2. **Choose Connection Method**
   - Select "Connect your application"

3. **Copy Connection String**
   ```
   mongodb+srv://hexalabs-admin:<password>@hexalabs-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

4. **Update Connection String**
   - Replace `<password>` with your database user password
   - Add database name: `/hexalabs?retryWrites=true&w=majority`
   - **Save as:** `MONGODB_URI`

**Example:**
```
mongodb+srv://hexalabs-admin:MySecurePass123@hexalabs-cluster.abc123.mongodb.net/hexalabs?retryWrites=true&w=majority
```

---

### Zoho Books Setup

**Purpose:** Automated invoicing and accounting

#### Step 1: Create Zoho Books Account

1. **Sign Up**
   - Visit https://www.zoho.com/in/books/
   - Click "Sign Up for Free"
   - Choose region: India
   - Complete registration

2. **Set Up Organization**
   - **Organization Name:** Hexalabs
   - **Industry:** IT Services
   - **Currency:** INR
   - Complete setup wizard

#### Step 2: Create API Client

1. **Go to Zoho API Console**
   - Visit https://api-console.zoho.in

2. **Create Client**
   - Click "Add Client"
   - Select "Server-based Applications"

3. **Fill Client Details**
   - **Client Name:** Hexalabs Marketplace
   - **Homepage URL:** https://yourdomain.com
   - **Authorized Redirect URIs:** https://yourdomain.com/api/zoho/callback
   - Click "Create"

4. **Save Credentials**
   - **Client ID** → `ZOHO_CLIENT_ID`
   - **Client Secret** → `ZOHO_CLIENT_SECRET`

#### Step 3: Generate Refresh Token

1. **Get Authorization Code**
   - Visit this URL (replace CLIENT_ID):
   ```
   https://accounts.zoho.in/oauth/v2/auth?scope=ZohoBooks.fullaccess.all&client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=https://yourdomain.com/api/zoho/callback&access_type=offline
   ```

2. **Authorize Application**
   - Login to Zoho
   - Click "Accept"
   - Copy the `code` parameter from redirect URL

3. **Exchange Code for Refresh Token**
   ```bash
   curl -X POST https://accounts.zoho.in/oauth/v2/token \
     -d "code=YOUR_AUTH_CODE" \
     -d "client_id=YOUR_CLIENT_ID" \
     -d "client_secret=YOUR_CLIENT_SECRET" \
     -d "redirect_uri=https://yourdomain.com/api/zoho/callback" \
     -d "grant_type=authorization_code"
   ```

4. **Save Refresh Token**
   - From response: `refresh_token` → `ZOHO_REFRESH_TOKEN`

#### Step 4: Get Organization ID

1. **Go to Zoho Books**
   - Login to https://books.zoho.in

2. **Get Organization ID**
   - Settings → Organization Profile
   - Copy **Organization ID**
   - **Save as:** `ZOHO_ORGANIZATION_ID`

#### Step 5: Set API Domains

**For India:**
```
ZOHO_AUTH_DOMAIN=https://accounts.zoho.in
ZOHO_API_DOMAIN=https://www.zohoapis.in
```

**For US:**
```
ZOHO_AUTH_DOMAIN=https://accounts.zoho.com
ZOHO_API_DOMAIN=https://www.zohoapis.com
```

---

## Prerequisites

### Required Services

✅ **MongoDB Database**
- MongoDB Atlas (recommended) or self-hosted MongoDB
- Connection string ready

✅ **Azure Account**
- Active Azure subscription
- Service Principal created with Contributor role
- Custom role and policy definitions deployed

✅ **Guacamole Server**
- Guacamole server running and accessible
- Admin credentials ready

✅ **Email Service**
- Gmail account with App Password enabled
- Or SMTP server credentials

✅ **Payment Gateway**
- Razorpay account (test/live keys)

✅ **Domain Name** (Optional but recommended)
- Custom domain purchased
- DNS access for configuration

---

## Environment Configuration

### Step 1: Prepare Environment Variables

Create a production `.env` file with all required variables:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hexalabs?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=6+LJem/os8jsq5SX5wTMkQa2vKEumQWZeWlmfhGWybw=

# Azure Configuration
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_SUBSCRIPTION_ID=your-subscription-id
AZURE_TENANT_ID=your-tenant-id
AZURE_AD_DOMAIN=yourcompany.onmicrosoft.com
AZURE_CUSTOM_ROLE_ID=/subscriptions/your-sub-id/providers/Microsoft.Authorization/roleDefinitions/your-role-id
AZURE_CUSTOM_INITIATIVE_ID=/subscriptions/your-sub-id/providers/Microsoft.Authorization/policySetDefinitions/your-policy-id

# Guacamole
GUACAMOLE_URL=http://your-guacamole-server:8080/guacamole
GUACAMOLE_USERNAME=guacadmin
GUACAMOLE_PASSWORD=your-secure-password

# Email Configuration to send emails from marketplace
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Razorpay (Use LIVE keys for production)
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX
RAZORPAY_KEY_SECRET=your-live-secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX

# Currency & Tax
EXCHANGE_RATE_USD_TO_INR=90
TAX_RATE=0.18

# Zoho Books
ZOHO_CLIENT_ID=your-client-id
ZOHO_CLIENT_SECRET=your-client-secret
ZOHO_REFRESH_TOKEN=your-refresh-token
ZOHO_ORGANIZATION_ID=your-org-id
ZOHO_AUTH_DOMAIN=https://accounts.zoho.in
ZOHO_API_DOMAIN=https://www.zohoapis.in

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# Organization Request Email
ORG_REQUEST_EMAIL=labs@yourdomain.com
```

### Step 2: Update OAuth Redirect URIs

**Google OAuth Console:**
1. Go to https://console.cloud.google.com/apis/credentials
2. Edit your OAuth 2.0 Client ID
3. Add authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`

**Microsoft Azure AD:**
1. Go to Azure Portal → Azure Active Directory → App registrations
2. Select your app
3. Add redirect URI: `https://yourdomain.com/api/auth/callback/azure-ad`

**Razorpay:**
1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payment/webhook`

---

## Deployment Options

## Option 1: Vercel (Recommended)

**Best for:** Quick deployment, automatic scaling, zero DevOps

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
# From your project directory
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? hexalabs-marketplace
# - Directory? ./
# - Override settings? No
```

### Step 4: Add Environment Variables

**Via Vercel Dashboard:**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all variables from your `.env` file
5. Set environment to "Production"

**Via CLI:**
```bash
# Add each variable
vercel env add MONGODB_URI production
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
# ... add all other variables
```

### Step 5: Deploy to Production

```bash
vercel --prod
```

### Step 6: Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` to your custom domain

**✅ Your app is now live on Vercel!**

---

## Option 2: Docker + VPS

**Best for:** Full control, self-hosted infrastructure

### Step 1: Prepare VPS

**Recommended Specs:**
- **CPU:** 4+ cores
- **RAM:** 8GB+ 
- **Storage:** 50GB+ SSD
- **OS:** Ubuntu 22.04 LTS

### Step 2: Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Step 3: Clone Repository

```bash
cd /opt
sudo git clone https://github.com/yourusername/hexalabs-marketplace.git
cd hexalabs-marketplace
```

### Step 4: Create Production Environment File

```bash
sudo nano .env.production
```

Paste all your environment variables (see Environment Configuration above).

### Step 5: Build and Deploy

**Using Docker Compose:**

```bash
# Build the image
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Step 6: Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/hexalabs
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

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

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/hexalabs /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 7: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
```

### Step 8: Setup Auto-Restart on Failure

```bash
# Docker containers will auto-restart (configured in docker-compose.prod.yml)

# Setup system service for Docker Compose
sudo nano /etc/systemd/system/hexalabs.service
```

**Service File:**

```ini
[Unit]
Description=Hexalabs Marketplace
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/hexalabs-marketplace
ExecStart=/usr/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
# Enable service
sudo systemctl enable hexalabs
sudo systemctl start hexalabs
```

**✅ Your app is now running on your VPS with auto-restart!**

---

## Option 3: Azure App Service

**Best for:** Azure ecosystem integration, managed infrastructure

### Step 1: Create App Service

```bash
# Login to Azure
az login

# Create resource group
az group create --name hexalabs-prod --location centralus

# Create App Service Plan
az appservice plan create \
  --name hexalabs-plan \
  --resource-group hexalabs-prod \
  --sku P1V2 \
  --is-linux

# Create Web App
az webapp create \
  --resource-group hexalabs-prod \
  --plan hexalabs-plan \
  --name hexalabs-marketplace \
  --runtime "NODE|18-lts"
```

### Step 2: Configure Environment Variables

```bash
# Set all environment variables
az webapp config appsettings set \
  --resource-group hexalabs-prod \
  --name hexalabs-marketplace \
  --settings \
    MONGODB_URI="your-mongodb-uri" \
    NEXTAUTH_URL="https://hexalabs-marketplace.azurewebsites.net" \
    NEXTAUTH_SECRET="your-secret" \
    # ... add all other variables
```

### Step 3: Deploy Code

**Option A: GitHub Actions (Recommended)**

Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: hexalabs-marketplace
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
```

**Option B: Local Deployment**

```bash
# Build locally
npm run build

# Deploy using Azure CLI
az webapp deployment source config-zip \
  --resource-group hexalabs-prod \
  --name hexalabs-marketplace \
  --src ./build.zip
```

### Step 4: Configure Custom Domain

```bash
# Add custom domain
az webapp config hostname add \
  --webapp-name hexalabs-marketplace \
  --resource-group hexalabs-prod \
  --hostname yourdomain.com

# Enable HTTPS
az webapp update \
  --resource-group hexalabs-prod \
  --name hexalabs-marketplace \
  --https-only true
```

**✅ Your app is now running on Azure App Service!**

---

## Post-Deployment Setup

### 1. Database Initialization

**Create Super Admin:**

```bash
# Connect to your MongoDB
mongosh "your-mongodb-uri"

# Create super admin user
db.users.insertOne({
  email: "admin@yourdomain.com",
  name: "Super Admin",
  password: "$2a$10$hashed_password_here", // Use bcrypt to hash
  role: "super_admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### 2. Test Critical Features

✅ **User Registration & Login**
- Test email/password login
- Test Google OAuth
- Test Microsoft OAuth

✅ **Lab Purchase Flow**
- Browse catalog
- Add to cart
- Complete checkout
- Verify Razorpay payment

✅ **Lab Provisioning**
- Launch a lab
- Verify Azure VM creation
- Test Guacamole RDP connection
- Check lab deletion

✅ **Admin Features**
- Access admin dashboard
- Create organization
- Assign licenses
- Manage team members

### 3. Setup Monitoring

**Vercel:**
- Built-in analytics available in dashboard
- Add Sentry for error tracking

**Docker/VPS:**
```bash
# Install monitoring tools
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  prom/prometheus

docker run -d \
  --name grafana \
  -p 3001:3000 \
  grafana/grafana
```

### 4. Configure Backups

**MongoDB Atlas:**
- Enable automatic backups in Atlas dashboard
- Set backup schedule (daily recommended)

**Self-hosted MongoDB:**
```bash
# Create backup script
sudo nano /opt/backup-mongodb.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
mongodump --uri="your-mongodb-uri" --out="$BACKUP_DIR/backup_$DATE"

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

```bash
# Make executable
sudo chmod +x /opt/backup-mongodb.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
0 2 * * * /opt/backup-mongodb.sh
```

---

## Monitoring & Maintenance

### Health Checks

**Create Health Check Endpoint:**

Already available at: `https://yourdomain.com/api/health`

**Setup Uptime Monitoring:**
- Use UptimeRobot (free): https://uptimerobot.com
- Add your domain
- Set check interval: 5 minutes
- Configure alerts via email/SMS

### Log Monitoring

**Vercel:**
```bash
# View real-time logs
vercel logs --follow
```

**Docker:**
```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f app

# View specific service
docker logs -f hexalabs-app
```

### Performance Monitoring

**Add Google Analytics:**

Update `src/app/layout.tsx`:

```typescript
<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  `}
</Script>
```

---

## Troubleshooting

### Common Issues

#### 1. "Internal Server Error" on Deployment

**Check:**
- All environment variables are set correctly
- MongoDB connection string is valid
- NEXTAUTH_SECRET is set

**Fix:**
```bash
# Vercel
vercel logs

# Docker
docker-compose logs app
```

#### 2. OAuth Login Not Working

**Check:**
- Redirect URIs are correctly configured
- `NEXTAUTH_URL` matches your production domain
- OAuth credentials are for production (not localhost)

**Fix:**
- Update redirect URIs in Google/Microsoft console
- Ensure HTTPS is enabled

#### 3. Payment Gateway Errors

**Check:**
- Using LIVE Razorpay keys (not test keys)
- Webhook URL is configured
- Webhook signature verification is working

**Fix:**
- Update Razorpay dashboard with production webhook URL
- Test with Razorpay test mode first

#### 4. Lab Provisioning Fails

**Check:**
- Azure credentials are valid
- Subscription has available quota
- Guacamole server is accessible from production

**Fix:**
```bash
# Test Azure connection
az login
az vm list

# Test Guacamole
curl http://your-guacamole-server:8080/guacamole/api/tokens
```

#### 5. Email Notifications Not Sending

**Check:**
- Gmail App Password is correct
- Less secure app access is enabled (if using Gmail)
- SMTP ports are not blocked

**Fix:**
- Generate new App Password
- Test with a simple script:

```javascript
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: { user: 'your-email', pass: 'your-app-password' }
});
transporter.sendMail({
  from: 'your-email',
  to: 'test@example.com',
  subject: 'Test',
  text: 'Test email'
});
```

---

## Security Checklist

Before going live, ensure:

- ✅ All secrets are strong and unique
- ✅ HTTPS is enabled
- ✅ CORS is properly configured
- ✅ Rate limiting is enabled
- ✅ Database has authentication enabled
- ✅ Firewall rules are configured
- ✅ Regular backups are scheduled
- ✅ Monitoring and alerts are set up
- ✅ Error tracking is configured
- ✅ Security headers are set

---

## Deployment Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] OAuth redirect URIs updated
- [ ] Payment gateway in live mode
- [ ] Database backups configured
- [ ] Domain DNS configured
- [ ] SSL certificate obtained

### Deployment
- [ ] Code deployed successfully
- [ ] Build completed without errors
- [ ] All services started
- [ ] Health check passing

### Post-Deployment
- [ ] Test user registration
- [ ] Test login (all methods)
- [ ] Test lab purchase
- [ ] Test lab provisioning
- [ ] Test admin features
- [ ] Verify email notifications
- [ ] Check monitoring dashboards
- [ ] Test payment processing

### Ongoing
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review logs daily
- [ ] Update dependencies monthly
- [ ] Rotate secrets quarterly
- [ ] Test backups monthly

---

## Support & Resources

**Documentation:**
- Next.js: https://nextjs.org/docs
- Vercel: https://vercel.com/docs
- Azure: https://docs.microsoft.com/azure
- MongoDB: https://docs.mongodb.com

**Community:**
- GitHub Issues: Report bugs and request features
- Email: support@hexalabs.online

---

## Quick Reference

### Useful Commands

**Vercel:**
```bash
vercel                    # Deploy to preview
vercel --prod            # Deploy to production
vercel logs              # View logs
vercel env ls            # List environment variables
vercel domains           # Manage domains
```

**Docker:**
```bash
docker-compose up -d                    # Start services
docker-compose down                     # Stop services
docker-compose logs -f                  # View logs
docker-compose restart                  # Restart services
docker-compose ps                       # List running services
```

**Azure:**
```bash
az webapp log tail                      # View logs
az webapp restart                       # Restart app
az webapp show                          # Show app details
az webapp config appsettings list       # List env vars
```

---

**🎉 Congratulations! Your Hexalabs Marketplace is now live in production!**

For additional help, contact: support@hexalabs.online
