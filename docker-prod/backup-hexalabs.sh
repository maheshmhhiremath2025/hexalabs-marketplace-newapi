#!/bin/bash

BACKUP_DIR="/home/hexalabs/marketplace/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="hexalabs_backup_$DATE.tar.gz"

echo "📦 Starting backup..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
echo "💾 Backing up database..."
docker exec hexalabs-mongo mongodump \
  --username admin \
  --password hexalabs123 \
  --authenticationDatabase admin \
  --db hexalabs \
  --out /backups/mongo_$DATE

# Backup environment files
echo "📄 Backing up configuration..."
cd /home/hexalabs/marketplace
tar -czf $BACKUP_DIR/$BACKUP_FILE \
  .env.production \
  ecosystem.config.js \
  docker-compose.prod.yml \
  backups/mongo_$DATE

# Remove old backups (keep last 7 days)
find $BACKUP_DIR -name "hexalabs_backup_*.tar.gz" -mtime +7 -delete

echo "✅ Backup complete: $BACKUP_FILE"
echo "📁 Location: $BACKUP_DIR/$BACKUP_FILE"
