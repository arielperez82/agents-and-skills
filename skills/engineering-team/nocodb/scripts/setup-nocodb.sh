#!/bin/bash
# setup-nocodb.sh - Docker Compose initialization and validation for NocoDB

set -e  # Exit on any error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DOCKER_COMPOSE_FILE="${DOCKER_COMPOSE_FILE:-docker/nocodb/docker-compose.yml}"

echo "🚀 Setting up NocoDB..."

# Check if docker-compose.yml exists
if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
  echo "❌ Error: docker-compose.yml not found at $DOCKER_COMPOSE_FILE"
  echo "   Create docker-compose.yml first (see references/setup.md)"
  exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
  echo "⚠️  Warning: .env file not found"
  echo "   Create .env from .env.example and configure values"
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Validate docker-compose.yml
echo "📋 Validating docker-compose.yml..."
if ! docker-compose -f "$DOCKER_COMPOSE_FILE" config > /dev/null 2>&1; then
  echo "❌ Error: docker-compose.yml validation failed"
  docker-compose -f "$DOCKER_COMPOSE_FILE" config
  exit 1
fi
echo "✅ docker-compose.yml is valid"

# Start containers
echo "🐳 Starting containers..."
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d

# Wait for containers to be healthy
echo "⏳ Waiting for containers to be healthy..."
MAX_WAIT=60
WAIT_COUNT=0
while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
  if docker-compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q "healthy"; then
    echo "✅ Containers are healthy"
    break
  fi
  sleep 2
  WAIT_COUNT=$((WAIT_COUNT + 2))
done

if [ $WAIT_COUNT -ge $MAX_WAIT ]; then
  echo "⚠️  Warning: Containers may not be healthy yet"
  echo "   Check status: docker-compose -f $DOCKER_COMPOSE_FILE ps"
fi

# Verify metadata DB connectivity
echo "🔍 Verifying metadata DB connectivity..."
if docker exec nocodb_metadata pg_isready -U nocodb > /dev/null 2>&1; then
  echo "✅ Metadata DB is ready"
else
  echo "❌ Error: Metadata DB is not ready"
  exit 1
fi

# Verify NocoDB UI accessibility
echo "🌐 Verifying NocoDB UI accessibility..."
MAX_RETRIES=10
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if curl -f http://localhost:8080 > /dev/null 2>&1; then
    echo "✅ NocoDB UI is accessible at http://localhost:8080"
    break
  fi
  sleep 2
  RETRY_COUNT=$((RETRY_COUNT + 1))
done

if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
  echo "❌ Error: NocoDB UI is not accessible"
  echo "   Check logs: docker logs nocodb"
  exit 1
fi

# Check container logs for errors
echo "📋 Checking container logs for errors..."
if docker logs nocodb 2>&1 | grep -i "error" | head -5; then
  echo "⚠️  Warning: Errors found in NocoDB logs"
  echo "   Review logs: docker logs nocodb"
else
  echo "✅ No errors found in logs"
fi

echo ""
echo "✅ NocoDB setup complete!"
echo ""
echo "📍 Next steps:"
echo "   1. Access NocoDB UI: http://localhost:8080"
echo "   2. Login with NC_ADMIN_EMAIL and NC_ADMIN_PASSWORD from .env"
echo "   3. Add external data source (Supabase) via UI"
echo "   4. Create views (see references/views.md)"
echo ""
echo "📚 Documentation:"
echo "   - Setup guide: references/setup.md"
echo "   - Architecture: references/architecture.md"
echo "   - Views: references/views.md"
