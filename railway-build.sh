#!/bin/bash
# Railway Deployment Check & Build Script
# This script runs before deployment to ensure everything is ready

echo "🚀 SellerCloudX Railway Deployment Check"
echo "========================================"

# Check Node version
echo "📦 Node version: $(node --version)"
echo "📦 NPM version: $(npm --version)"

# Check environment variables
echo ""
echo "🔧 Environment Check:"
echo "   NODE_ENV: ${NODE_ENV:-not set}"
echo "   DATABASE_URL: ${DATABASE_URL:+✅ Set}${DATABASE_URL:-❌ Not set}"
echo "   SESSION_SECRET: ${SESSION_SECRET:+✅ Set}${SESSION_SECRET:-❌ Not set}"
echo "   PORT: ${PORT:-5000}"

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
npm ci --only=production || npm install --only=production

# Build client
echo ""
echo "🔨 Building client (React + Vite)..."
npm run build:client

# Check build output
if [ -d "dist/public" ] && [ -f "dist/public/index.html" ]; then
  echo "✅ Client build successful"
  echo "   📂 Files in dist/public:"
  ls -lh dist/public | head -10
else
  echo "❌ Client build failed - dist/public/index.html not found"
  exit 1
fi

# Build server
echo ""
echo "🔨 Building server (Express + TypeScript)..."
npm run build:server

# Check server build
if [ -f "dist/index.js" ]; then
  echo "✅ Server build successful"
  echo "   📄 dist/index.js size: $(du -h dist/index.js | cut -f1)"
else
  echo "❌ Server build failed - dist/index.js not found"
  exit 1
fi

# Run postbuild
echo ""
echo "🔧 Running postbuild script..."
node postbuild.js

# Final verification
echo ""
echo "✅ Build verification:"
npm run build:verify

echo ""
echo "🎉 Deployment ready! Starting server..."
echo "========================================"
