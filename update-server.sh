#!/bin/bash
# Hexalabs Marketplace - Server Update Script
# This script handles git pull and Docker rebuild without conflicts

set -e

echo "🔄 Updating Hexalabs Marketplace..."
echo ""

# Navigate to project directory
cd ~/hexalabs-marketplace-newapi

# Stash any local changes (like .env.local modifications)
echo "📦 Stashing local changes..."
git stash

# Pull latest code
echo "⬇️  Pulling latest code from GitHub..."
git pull origin main

# Restore stashed changes (merge them back)
echo "📤 Restoring local changes..."
git stash pop || echo "ℹ️  No conflicts to resolve"

# Rebuild Docker image with no cache
echo ""
echo "🏗️  Rebuilding Docker image (this may take a few minutes)..."
docker-compose build --no-cache

# Stop existing containers
echo ""
echo "🛑 Stopping existing containers..."
docker-compose down

# Start containers in detached mode
echo ""
echo "🚀 Starting containers..."
docker-compose up -d

# Wait a moment for containers to start
sleep 3

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Viewing logs (press Ctrl+C to exit)..."
echo ""

# Show logs
docker-compose logs -f app
