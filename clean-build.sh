#!/bin/bash

echo "🧹 Cleaning all caches..."
rm -rf node_modules/.vite
rm -rf dist
rm -rf .vercel

echo "✅ Cache cleared!"
echo ""
echo "🔨 Building with production environment..."
npm run build

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 Build info:"
echo "  - API URL: https://newnewoo-server.vercel.app/api"
echo "  - Socket URL: https://newnewoo-server.vercel.app"
echo "  - Version: 2.0.1"
echo ""
echo "🚀 Ready to deploy!"
