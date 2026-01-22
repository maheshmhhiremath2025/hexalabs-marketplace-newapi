# 🔐 OAuth Redirect URIs - Quick Reference

## ⚠️ CRITICAL: Update These Before Deployment

### 🔵 Google OAuth
**Console:** https://console.cloud.google.com/apis/credentials

**Redirect URI to Add:**
```
https://marketplace.hexalabs.online/api/auth/callback/google
```

**Steps:**
1. Go to Google Cloud Console
2. Select your project
3. Navigate to: APIs & Services → Credentials
4. Click on your OAuth 2.0 Client ID
5. Under "Authorized redirect URIs", click "ADD URI"
6. Paste: `https://marketplace.hexalabs.online/api/auth/callback/google`
7. Click "SAVE"

---

### 🔷 Microsoft OAuth
**Console:** https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade

**Redirect URI to Add:**
```
https://marketplace.hexalabs.online/api/auth/callback/microsoft
```

**Steps:**
1. Go to Azure Portal
2. Navigate to: Azure Active Directory → App registrations
3. Select your application: (Client ID: `a0e8d389-22cf-4165-8243-ebbf820f79ec`)
4. Go to: Authentication → Platform configurations → Web
5. Under "Redirect URIs", click "Add URI"
6. Paste: `https://marketplace.hexalabs.online/api/auth/callback/microsoft`
7. Click "SAVE"

---

## 📋 Deployment Checklist

- [ ] **Update Google OAuth redirect URI** (see above)
- [ ] **Update Microsoft OAuth redirect URI** (see above)
- [ ] **Pull latest code on server:**
  ```bash
  cd ~/hexalabs-marketplace-newapi
  git pull origin main
  ```
- [ ] **Restart Docker containers:**
  ```bash
  docker-compose down
  docker-compose up -d
  ```
- [ ] **Test Google login:** https://marketplace.hexalabs.online/api/auth/signin
- [ ] **Test Microsoft login:** https://marketplace.hexalabs.online/api/auth/signin
- [ ] **Verify HTTPS loads:** https://marketplace.hexalabs.online

---

## 🔧 Current Configuration

| Setting | Value |
|---------|-------|
| **Domain** | marketplace.hexalabs.online |
| **Protocol** | HTTPS (SSL enabled) |
| **NEXTAUTH_URL** | https://marketplace.hexalabs.online |
| **Google Client ID** | 518993287392-p3gdoc0gjbs00t655u8mnlm3rj91s6a9.apps.googleusercontent.com |
| **Microsoft Client ID** | a0e8d389-22cf-4165-8243-ebbf820f79ec |

---

## ⚡ Quick Deploy Commands

```bash
# On Ubuntu Server
cd ~/hexalabs-marketplace-newapi
git pull origin main
docker-compose down
docker-compose up -d
docker-compose logs -f app
```

---

**Last Updated:** 2026-01-22  
**Status:** Ready for deployment after OAuth redirect URIs are updated
