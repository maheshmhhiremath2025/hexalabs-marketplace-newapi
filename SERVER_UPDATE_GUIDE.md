# 🚀 Server Deployment Guide

## Quick Update (Recommended)

### One-Command Update
```bash
cd ~/hexalabs-marketplace-newapi && bash update-server.sh
```

This script automatically:
1. ✅ Stashes local changes (like `.env.local`)
2. ✅ Pulls latest code from GitHub
3. ✅ Restores your local changes
4. ✅ Rebuilds Docker image
5. ✅ Restarts containers
6. ✅ Shows logs

---

## First-Time Setup

1. **Upload the update script to server:**
   ```bash
   # On your local machine
   scp update-server.sh labuser@<server-ip>:~/hexalabs-marketplace-newapi/
   ```

2. **Make it executable:**
   ```bash
   # On the server
   cd ~/hexalabs-marketplace-newapi
   chmod +x update-server.sh
   ```

3. **Run it:**
   ```bash
   ./update-server.sh
   ```

---

## Manual Update (If Script Fails)

If you encounter git conflicts:

```bash
cd ~/hexalabs-marketplace-newapi

# Stash local changes
git stash

# Pull latest code
git pull origin main

# Restore local changes
git stash pop

# Rebuild and restart
docker-compose build --no-cache
docker-compose down
docker-compose up -d
docker-compose logs -f app
```

---

## Fix Current Git Conflict

You have a merge conflict right now. Run these commands on the server:

```bash
cd ~/hexalabs-marketplace-newapi

# Stash your local changes
git stash

# Now pull will work
git pull origin main

# Restore your changes
git stash pop

# If there are conflicts, you'll see them marked in files
# Edit .env.local and LabConsole.tsx to keep your changes

# Then rebuild
docker-compose build --no-cache
docker-compose down
docker-compose up -d
```

---

## Common Issues

### Issue: "Your local changes would be overwritten"
**Solution:** Use `git stash` before pulling

### Issue: Stash pop creates conflicts
**Solution:** Manually edit the conflicted files, then:
```bash
git add .
git stash drop
```

### Issue: Docker build fails
**Solution:** 
```bash
docker system prune -a
docker-compose build --no-cache
```

---

## Environment Variables

Your `.env.local` on the server should have:
- `NEXTAUTH_URL=https://marketplace.hexalabs.online`
- `NEXT_PUBLIC_GUACAMOLE_URL=https://marketplace.hexalabs.online/guacamole`
- All other credentials (MongoDB, Azure, Razorpay, etc.)

These will be preserved by the update script!
