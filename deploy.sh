#!/bin/bash

# ============================================
# LOXTR Deployment Script
# ============================================

set -e  # Exit on error

echo "🚀 Starting LOXTR deployment..."

# ============================================
# 1. Pull latest code
# ============================================
echo "📥 Pulling latest code from Git..."
# git pull origin main

# ============================================
# 2. Build Docker images
# ============================================
echo "🏗️ Building Docker images..."
docker-compose build --no-cache

# ============================================
# 3. Stop old containers
# ============================================
echo "🛑 Stopping old containers..."
docker-compose down

# ============================================
# 4. Start new containers
# ============================================
echo "▶️ Starting new containers..."
docker-compose up -d

# ============================================
# 5. Run database migrations
# ============================================
echo "🗄️ Running database migrations..."
docker-compose exec -T django python manage.py migrate --noinput

# ============================================
# 6. Collect static files
# ============================================
echo "📦 Collecting static files..."
docker-compose exec -T django python manage.py collectstatic --noinput

# ============================================
# 7. Warm cache
# ============================================
echo "🔥 Warming cache..."
docker-compose exec -T django python manage.py warm_cache

# ============================================
# 8. Health check
# ============================================
echo "🏥 Running health check..."
sleep 10  # Wait for services to start

HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/v1/health/ || echo "Failed")

if [ "$HEALTH_STATUS" = "200" ]; then
    echo "✅ Deployment successful! Health check passed."
else
    echo "❌ Deployment failed! Health check returned: $HEALTH_STATUS"
    # exit 1
fi

# ============================================
# 9. Show running containers
# ============================================
echo "📊 Running containers:"
docker-compose ps

echo "🎉 Deployment complete!"
