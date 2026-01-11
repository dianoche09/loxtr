#!/bin/bash

# ============================================
# LOXTR Initial Setup Script
# Run this once on first deployment
# ============================================

set -e

echo "🎬 Starting LOXTR initial setup..."

# ============================================
# 1. Copy environment file
# ============================================
echo "📝 Setting up environment variables..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "⚠️ Please edit backend/.env with your configuration!"
    # exit 1
fi

# ============================================
# 2. Create directories
# ============================================
echo "📁 Creating directories..."
mkdir -p logs/nginx certbot/conf certbot/www backups

# ============================================
# 3. Download GeoIP database
# ============================================
echo "🌍 Downloading GeoIP database..."
mkdir -p backend/geoip
# Download from MaxMind (requires account)
echo "⚠️ Please download GeoLite2-Country.mmdb from MaxMind and place in backend/geoip/"

# ============================================
# 4. Build and start containers
# ============================================
echo "🏗️ Building containers..."
docker-compose build

echo "▶️ Starting containers..."
docker-compose up -d

# ============================================
# 5. Wait for database
# ============================================
echo "⏳ Waiting for database..."
sleep 10

# ============================================
# 6. Run migrations
# ============================================
echo "🗄️ Running migrations..."
docker-compose exec -T django python manage.py migrate

# ============================================
# 7. Create superuser
# ============================================
echo "👤 Creating superuser..."
# docker-compose exec django python manage.py createsuperuser

# ============================================
# 8. Collect static files
# ============================================
echo "📦 Collecting static files..."
docker-compose exec -T django python manage.py collectstatic --noinput

# ============================================
# Done
# ============================================
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your configuration"
echo "2. Download GeoIP database to backend/geoip/"
echo "3. Access admin panel: http://localhost:8000/admin/"
echo ""
echo "Useful commands:"
echo "- View logs: docker-compose logs -f"
echo "- Restart: docker-compose restart"
echo "- Deploy: ./deploy.sh"
