#!/bin/bash
# backup-metadata.sh - Metadata DB backup automation for NocoDB

set -e  # Exit on any error

# Configuration
BACKUP_DIR="${BACKUP_DIR:-backups}"
CONTAINER_NAME="${CONTAINER_NAME:-nocodb_metadata}"
DB_USER="${DB_USER:-nocodb}"
DB_NAME="${DB_NAME:-nocodb_meta}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/nocodb-metadata-$TIMESTAMP.sql"

echo "💾 Backing up NocoDB metadata DB..."

# Check if container exists
if ! docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "❌ Error: Container '$CONTAINER_NAME' not found"
  exit 1
fi

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "⚠️  Warning: Container '$CONTAINER_NAME' is not running"
  echo "   Starting container..."
  docker start "$CONTAINER_NAME"
  sleep 2
fi

# Verify container is ready
if ! docker exec "$CONTAINER_NAME" pg_isready -U "$DB_USER" > /dev/null 2>&1; then
  echo "❌ Error: Container '$CONTAINER_NAME' is not ready"
  exit 1
fi

# Perform backup
echo "📦 Creating backup: $BACKUP_FILE"
if docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"; then
  # Get backup size
  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "✅ Backup created successfully: $BACKUP_FILE ($BACKUP_SIZE)"
else
  echo "❌ Error: Backup failed"
  exit 1
fi

# Cleanup old backups
if [ "$RETENTION_DAYS" -gt 0 ]; then
  echo "🧹 Cleaning up backups older than $RETENTION_DAYS days..."
  DELETED=$(find "$BACKUP_DIR" -name "nocodb-metadata-*.sql" -mtime +$RETENTION_DAYS -delete -print | wc -l)
  if [ "$DELETED" -gt 0 ]; then
    echo "✅ Deleted $DELETED old backup(s)"
  else
    echo "ℹ️  No old backups to delete"
  fi
fi

# List recent backups
echo ""
echo "📋 Recent backups:"
ls -lh "$BACKUP_DIR"/nocodb-metadata-*.sql 2>/dev/null | tail -5 || echo "   No backups found"

echo ""
echo "✅ Backup complete!"
