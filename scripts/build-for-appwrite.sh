#!/bin/bash
# Build and package script for Appwrite deployment
# This script builds the Next.js app and packages it for deployment

set -e

echo "🚀 Building Next.js app for Appwrite deployment..."

# Set environment variables
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=4096"
export NEXT_TELEMETRY_DISABLED=1

# Build the application
echo "📦 Running Next.js build..."
npm run build

# Verify standalone output exists
if [ ! -d ".next/standalone" ]; then
    echo "❌ Error: .next/standalone directory not found!"
    echo "   Make sure next.config.ts has 'output: standalone' configured"
    exit 1
fi

if [ ! -f ".next/standalone/server.js" ]; then
    echo "❌ Error: server.js not found in .next/standalone!"
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📁 Standalone output created at: .next/standalone"
echo "📁 Static files at: .next/static"
echo "📁 Public files at: public"

# Create deployment package directory
DEPLOY_DIR="appwrite-deploy"
echo "📦 Creating deployment package..."

# Clean up any existing deployment directory
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# Copy standalone output
echo "   Copying standalone files..."
cp -r .next/standalone/* "$DEPLOY_DIR/"

# Copy static files
echo "   Copying static files..."
mkdir -p "$DEPLOY_DIR/.next/static"
cp -r .next/static/* "$DEPLOY_DIR/.next/static/"

# Copy public directory
echo "   Copying public directory..."
cp -r public "$DEPLOY_DIR/"

# Create a simple README for deployment
cat > "$DEPLOY_DIR/README.md" << EOF
# Appwrite Deployment Package

This directory contains the pre-built Next.js application ready for deployment.

## Structure
- \`server.js\` - Application entry point
- \`.next/static/\` - Static assets
- \`public/\` - Public files
- \`node_modules/\` - Production dependencies

## Deployment Instructions

1. Upload this entire directory to Appwrite Storage or your deployment location
2. Set the entry point to: \`node server.js\`
3. Set PORT environment variable to 3000
4. Ensure Node.js 20+ is available

## Environment Variables Required

- NEXT_PUBLIC_APPWRITE_ENDPOINT
- NEXT_PUBLIC_APPWRITE_PROJECT_ID
- NEXT_PUBLIC_APPWRITE_DATABASE_ID
- Any other environment variables your app needs
EOF

echo "✅ Deployment package created at: $DEPLOY_DIR"
echo ""
echo "📊 Package size:"
du -sh "$DEPLOY_DIR"
echo ""
echo "🎉 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Review the package in: $DEPLOY_DIR"
echo "2. Upload to Appwrite Storage or configure Appwrite to use pre-built files"
echo "3. See docs/APPWRITE_PREBUILD_DEPLOYMENT.md for detailed instructions"

