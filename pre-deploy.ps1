# Pre-Deployment Checklist for Obamax Gardens Management Software (Windows)
# Run this from your project root directory in PowerShell

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "PRE-DEPLOYMENT CHECKLIST" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check PHP version
Write-Host "✓ Checking PHP version requirement (needs 8.2+)..." -ForegroundColor Green
php -v

Write-Host ""
Write-Host "✓ Installing/Updating dependencies..." -ForegroundColor Green
Write-Host "  Running: npm install"
npm install

Write-Host ""
Write-Host "✓ Building production assets..." -ForegroundColor Green
Write-Host "  Running: npm run build"
npm run build

Write-Host ""
Write-Host "✓ Installing PHP dependencies (production)..." -ForegroundColor Green
Write-Host "  Running: composer install --optimize-autoloader --no-dev"
composer install --optimize-autoloader --no-dev

Write-Host ""
Write-Host "✓ Checking .env file..." -ForegroundColor Green
if (Test-Path ".env") {
    Write-Host "  .env file exists ✓" -ForegroundColor Green
} else {
    Write-Host "  .env file NOT found - creating from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "  Remember to configure .env with your hosting details!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "FILES TO UPLOAD:" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Copy these to public_html on your server:" -ForegroundColor Green
Write-Host ""
Write-Host "  app/"
Write-Host "  bootstrap/"
Write-Host "  config/"
Write-Host "  database/"
Write-Host "  public/"
Write-Host "  resources/"
Write-Host "  routes/"
Write-Host "  vendor/"
Write-Host "  .env                    (after configuring)" -ForegroundColor Yellow
Write-Host "  .htaccess"
Write-Host "  artisan"
Write-Host "  composer.json"
Write-Host "  composer.lock"
Write-Host ""
Write-Host "✓ DO NOT upload:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  node_modules/           (not needed, assets already built)"
Write-Host "  storage/logs/           (create empty on server)"
Write-Host "  tests/                  (optional)"
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Update .env with production database credentials" -ForegroundColor Magenta
Write-Host "2. Upload files to hosting via FTP" -ForegroundColor Magenta
Write-Host "3. Create database in cPanel" -ForegroundColor Magenta
Write-Host "4. Run migrations via SSH/cPanel Terminal:" -ForegroundColor Magenta
Write-Host "   php artisan migrate --force" -ForegroundColor Yellow
Write-Host "5. Set file permissions:" -ForegroundColor Magenta
Write-Host "   chmod -R 777 storage" -ForegroundColor Yellow
Write-Host "   chmod -R 777 bootstrap/cache" -ForegroundColor Yellow
Write-Host "6. Access http://www.obamaxgardens.com" -ForegroundColor Magenta
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
