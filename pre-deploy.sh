#!/bin/bash
# Pre-Deployment Checklist for Obamax Gardens Management Software
# Run this from your project root directory

echo "=========================================="
echo "PRE-DEPLOYMENT CHECKLIST"
echo "=========================================="
echo ""

# 1. Check PHP version
echo "✓ Checking PHP version requirement (needs 8.2+)..."
php -v

echo ""
echo "✓ Installing/Updating dependencies..."
echo "  Running: npm install"
npm install

echo ""
echo "✓ Building production assets..."
echo "  Running: npm run build"
npm run build

echo ""
echo "✓ Installing PHP dependencies (production)..."
echo "  Running: composer install --optimize-autoloader --no-dev"
composer install --optimize-autoloader --no-dev

echo ""
echo "✓ Checking .env file..."
if [ -f .env ]; then
    echo "  .env file exists ✓"
else
    echo "  .env file NOT found - creating from .env.example..."
    cp .env.example .env
    echo "  Remember to configure .env with your hosting details!"
fi

echo ""
echo "=========================================="
echo "FILES TO UPLOAD:"
echo "=========================================="
echo ""
echo "✓ Copy these to public_html on your server:"
echo ""
echo "  app/"
echo "  bootstrap/"
echo "  config/"
echo "  database/"
echo "  public/"
echo "  resources/"
echo "  routes/"
echo "  vendor/"
echo "  .env                    (after configuring)"
echo "  .htaccess"
echo "  artisan"
echo "  composer.json"
echo "  composer.lock"
echo ""
echo "✓ DO NOT upload:"
echo ""
echo "  node_modules/           (not needed, assets already built)"
echo "  storage/logs/           (create empty on server)"
echo "  tests/                  (optional)"
echo ""
echo "=========================================="
echo "NEXT STEPS:"
echo "=========================================="
echo ""
echo "1. Update .env with production database credentials"
echo "2. Upload files to hosting via FTP"
echo "3. Create database in cPanel"
echo "4. Run migrations via SSH/cPanel Terminal:"
echo "   php artisan migrate --force"
echo "5. Set file permissions:"
echo "   chmod -R 777 storage"
echo "   chmod -R 777 bootstrap/cache"
echo "6. Access http://www.obamaxgardens.com"
echo ""
echo "=========================================="
