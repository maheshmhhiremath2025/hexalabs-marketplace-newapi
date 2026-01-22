#!/bin/bash

echo "🔄 Restarting Hexalabs Marketplace..."

cd /home/hexalabs/marketplace

# Stop services
echo "⏹️  Stopping services..."
docker compose -f docker-compose.prod.yml down

# Wait
sleep 5

# Start services
echo "▶️  Starting services..."
docker compose -f docker-compose.prod.yml up -d

# Wait for startup
sleep 10

# Check status
echo "✅ Checking status..."
docker compose -f docker-compose.prod.yml ps

echo "📊 Worker status:"
docker exec hexalabs-marketplace pm2 list

echo "🎉 Restart complete!"
