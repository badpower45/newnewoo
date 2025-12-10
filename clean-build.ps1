# Force clean build with production environment
Write-Host "🧹 Cleaning all caches..." -ForegroundColor Yellow
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue node_modules\.vite
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue dist
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue .vercel

Write-Host "✅ Cache cleared!" -ForegroundColor Green
Write-Host ""
Write-Host "🔨 Building with production environment..." -ForegroundColor Yellow

npm run build

Write-Host ""
Write-Host "✅ Build complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Build info:" -ForegroundColor Cyan
Write-Host "  - API URL: https://newnewoo-server.vercel.app/api" -ForegroundColor White
Write-Host "  - Socket URL: https://newnewoo-server.vercel.app" -ForegroundColor White
Write-Host "  - Version: 2.0.1" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Ready to deploy!" -ForegroundColor Green
