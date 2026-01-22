# Razorpay Logo Not Showing - Solution

## Problem
The Razorpay payment modal is not displaying the Hexalabs logo, showing only the letter "H" as a fallback.

## Root Cause
Razorpay requires the merchant logo to be:
1. **Publicly accessible via HTTPS**
2. **Not on localhost** (localhost URLs won't work)
3. **Recommended size**: 256x256px or similar square dimensions

## Current Configuration
```typescript
image: `${window.location.origin}/hexalabs-logo.png`
```

This generates: `http://localhost:3000/hexalabs-logo.png` which Razorpay cannot access.

## Solutions

### Option 1: Use a Public CDN (Recommended)
Upload your logo to a public image hosting service and use that URL:

**Services you can use:**
- **Imgur**: https://imgur.com/upload
- **Cloudinary**: https://cloudinary.com
- **ImgBB**: https://imgbb.com
- **GitHub**: Upload to a public GitHub repo

**Example**:
```typescript
image: 'https://i.imgur.com/YOUR_IMAGE_ID.png'
```

### Option 2: Deploy to Production First
Once your app is deployed with HTTPS (e.g., on Vercel, Netlify), the logo will work automatically:
```typescript
image: `${window.location.origin}/hexalabs-logo.png`
// Will become: https://yourdomain.com/hexalabs-logo.png
```

### Option 3: Use Base64 Encoded Image (Not Recommended)
Convert your logo to base64 and embed it directly (makes code large):
```typescript
image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...'
```

### Option 4: Accept Localhost Limitation
Keep the current code - it will work in production but show "H" in development.

## Recommended Action

**For Development**: Accept that the logo won't show on localhost

**For Production**: The current code will work fine once deployed with HTTPS

## Quick Fix for Testing

If you want to test the logo immediately, upload `hexalabs-logo.png` to Imgur:

1. Go to https://imgur.com/upload
2. Upload `public/hexalabs-logo.png`
3. Copy the direct link (right-click image → Copy image address)
4. Update the code:

```typescript
image: 'https://i.imgur.com/YOUR_IMAGE_ID.png'
```

## Current File Location
Logo file: `public/hexalabs-logo.png` (90KB)

## Razorpay Logo Requirements
- Format: PNG, JPG (SVG not supported)
- Size: Recommended 256x256px
- Max file size: 2MB
- Must be HTTPS and publicly accessible
