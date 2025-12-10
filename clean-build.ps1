# Force clean build
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue node_modules\.vite
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue dist
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue .vercel

Write-Host "✅ Cache cleared!" -ForegroundColor Green
Write-Host "🔨 Building project..." -ForegroundColor Yellow

npm run build

Write-Host "✅ Build complete!" -ForegroundColor Green
