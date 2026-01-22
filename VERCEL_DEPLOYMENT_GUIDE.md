# 🚀 Vercel Deployment Guide - Hexalabs Marketplace

Complete guide to deploy your Hexalabs Marketplace to Vercel.

---

## 📋 Prerequisites

Before deploying, you need:

1. **GitHub Account** (✅ Already done - your repo is at https://github.com/maheshmhhiremath2025/marketplace)
2. **Vercel Account** - Sign up at https://vercel.com (free)
3. **MongoDB Atlas Account** - Sign up at https://www.mongodb.com/cloud/atlas (free tier available)

---

## 🗄️ Step 1: Set Up MongoDB Atlas (Cloud Database)

Your local MongoDB won't work on Vercel. You need a cloud database:

### 1.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free
3. Create a new project (e.g., "Hexalabs Marketplace")

### 1.2 Create a Cluster
1. Click "Build a Database"
2. Choose **FREE** tier (M0)
3. Select a cloud provider and region (choose closest to your users)
4. Click "Create Cluster"

### 1.3 Create Database User
1. Go to "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `hexalabs_admin`
5. Password: Generate a strong password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### 1.4 Whitelist IP Addresses
1. Go to "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ For production, restrict to Vercel IPs only
4. Click "Confirm"

### 1.5 Get Connection String
1. Go to "Database" → Click "Connect"
2. Choose "Connect your application"
3. Copy the connection string:
   ```
   mongodb+srv://hexalabs_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password
5. Add database name: `mongodb+srv://hexalabs_admin:yourpassword@cluster0.xxxxx.mongodb.net/hexalabs?retryWrites=true&w=majority`

---

## 🔐 Step 2: Prepare Environment Variables

Create a file called `.env.production` in your project root with these values:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://hexalabs_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/hexalabs?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=generate-a-random-secret-here-use-openssl-rand-base64-32

# Razorpay (Payment Gateway)
RAZORPAY_KEY_ID=rzp_test_S5MyGzMGCVaygJ
RAZORPAY_KEY_SECRET=JI1GepYekJNY2PJBdJNmkE2W

# Google OAuth (Optional - for Google login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth (Optional - for GitHub login)
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Email Configuration (Optional - for sending emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Zoho Books (Optional - for invoicing)
ZOHO_CLIENT_ID=your-zoho-client-id
ZOHO_CLIENT_SECRET=your-zoho-client-secret
ZOHO_REFRESH_TOKEN=your-zoho-refresh-token
ZOHO_ORGANIZATION_ID=your-zoho-org-id
```

### Generate NEXTAUTH_SECRET:
Run this command in your terminal:
```bash
openssl rand -base64 32
```
Or use: https://generate-secret.vercel.app/32

---

## 🌐 Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**
   - Visit https://vercel.com
   - Click "Sign Up" or "Log In"
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Find and select: `maheshmhhiremath2025/marketplace`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add each variable from your `.env.production` file:
     - Name: `MONGODB_URI`
     - Value: `mongodb+srv://...`
     - Click "Add"
   - Repeat for ALL environment variables

5. **Deploy**
   - Click "Deploy"
   - Wait 2-5 minutes for deployment
   - Your app will be live at: `https://your-app-name.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? hexalabs-marketplace
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

---

## ⚙️ Step 4: Configure OAuth Redirect URLs

After deployment, update OAuth settings:

### Google OAuth
1. Go to https://console.cloud.google.com/
2. Select your project
3. Go to "Credentials"
4. Edit your OAuth 2.0 Client ID
5. Add to "Authorized redirect URIs":
   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   ```

### GitHub OAuth
1. Go to https://github.com/settings/developers
2. Select your OAuth App
3. Update "Authorization callback URL":
   ```
   https://your-app-name.vercel.app/api/auth/callback/github
   ```

---

## 🔄 Step 5: Update NextAuth Configuration

Update `src/lib/auth.ts` to use environment variable for URL:

```typescript
export const authOptions: NextAuthOptions = {
  // ... other options
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Use NEXTAUTH_URL in production
      const productionUrl = process.env.NEXTAUTH_URL || baseUrl;
      return url.startsWith(productionUrl) ? url : productionUrl;
    },
  },
};
```

---

## 🧪 Step 6: Test Your Deployment

After deployment, test these features:

- [ ] Homepage loads correctly
- [ ] Catalog page displays labs
- [ ] User registration works
- [ ] User login works (email/password)
- [ ] OAuth login works (Google/GitHub)
- [ ] Add items to cart
- [ ] Checkout flow works
- [ ] Razorpay payment modal opens
- [ ] Payment processing works
- [ ] Dashboard shows purchased labs
- [ ] Logo displays correctly

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to database"
**Solution**: 
- Check MongoDB Atlas connection string
- Verify IP whitelist includes 0.0.0.0/0
- Check database user credentials

### Issue: "OAuth redirect mismatch"
**Solution**:
- Update OAuth redirect URLs in Google/GitHub console
- Ensure NEXTAUTH_URL matches your Vercel domain

### Issue: "Environment variables not found"
**Solution**:
- Go to Vercel Dashboard → Project → Settings → Environment Variables
- Add missing variables
- Redeploy: `vercel --prod`

### Issue: "Build failed"
**Solution**:
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Fix any TypeScript errors locally first

---

## 📊 Post-Deployment Checklist

- [ ] Set up custom domain (optional)
- [ ] Configure Razorpay for production mode
- [ ] Set up email notifications
- [ ] Configure analytics (Google Analytics, Vercel Analytics)
- [ ] Set up error monitoring (Sentry)
- [ ] Enable Vercel Analytics
- [ ] Set up automatic deployments (already enabled via GitHub)
- [ ] Configure environment-specific variables
- [ ] Test all payment flows
- [ ] Set up database backups (MongoDB Atlas)

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** to GitHub
2. **Use strong passwords** for database users
3. **Rotate secrets** regularly
4. **Enable 2FA** on Vercel and MongoDB Atlas
5. **Restrict MongoDB IP whitelist** to Vercel IPs only (production)
6. **Use production Razorpay keys** for live payments
7. **Enable HTTPS** (automatic on Vercel)
8. **Set up rate limiting** for API routes

---

## 🚀 Continuous Deployment

Your project is now set up for automatic deployments:

- **Push to `main` branch** → Automatic production deployment
- **Push to other branches** → Preview deployments
- **Pull requests** → Preview deployments with unique URLs

---

## 📝 Important Notes

1. **Database Migration**: Your local MongoDB data won't transfer automatically. You'll need to:
   - Export data from local MongoDB
   - Import to MongoDB Atlas
   - Or start fresh with production data

2. **File Uploads**: The logo in `/public` works fine, but user-uploaded files need cloud storage (AWS S3, Cloudinary)

3. **Environment Variables**: Always use environment variables for sensitive data, never hardcode

4. **Costs**: 
   - Vercel: Free tier (Hobby plan)
   - MongoDB Atlas: Free tier (M0 cluster)
   - Razorpay: Transaction fees apply

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas/
- **Vercel Support**: https://vercel.com/support

---

## ✅ Quick Deploy Checklist

```
[ ] MongoDB Atlas cluster created
[ ] Database user created
[ ] Connection string obtained
[ ] Environment variables prepared
[ ] Vercel account created
[ ] Project imported to Vercel
[ ] Environment variables added to Vercel
[ ] Deployed successfully
[ ] OAuth redirect URLs updated
[ ] Tested all features
[ ] Production ready! 🎉
```

---

**Your app will be live at**: `https://your-project-name.vercel.app`

Good luck with your deployment! 🚀
