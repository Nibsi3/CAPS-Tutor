# Build and package script for Appwrite deployment (PowerShell)
# This script builds the Next.js app and packages it for deployment

$ErrorActionPreference = "Stop"

Write-Host "🚀 Building Next.js app for Appwrite deployment..." -ForegroundColor Cyan

# Set environment variables
$env:NODE_ENV = "production"
$env:NODE_OPTIONS = "--max-old-space-size=4096"
$env:NEXT_TELEMETRY_DISABLED = "1"

# Build the application
Write-Host "📦 Running Next.js build..." -ForegroundColor Yellow
npx next build

# Verify standalone output exists
if (-not (Test-Path ".next/standalone")) {
    Write-Host "❌ Error: .next/standalone directory not found!" -ForegroundColor Red
    Write-Host "   Make sure next.config.ts has 'output: standalone' configured" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path ".next/standalone/server.js")) {
    Write-Host "❌ Error: server.js not found in .next/standalone!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host "📁 Standalone output created at: .next/standalone" -ForegroundColor Gray
Write-Host "📁 Static files at: .next/static" -ForegroundColor Gray
Write-Host "📁 Public files at: public" -ForegroundColor Gray

# Create deployment package directory
$DEPLOY_DIR = "appwrite-deploy"
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow

# Clean up any existing deployment directory
if (Test-Path $DEPLOY_DIR) {
    Remove-Item -Path $DEPLOY_DIR -Recurse -Force
}
New-Item -ItemType Directory -Path $DEPLOY_DIR | Out-Null

# Copy standalone output
Write-Host "   Copying standalone files..." -ForegroundColor Gray
Copy-Item -Path ".next/standalone/*" -Destination $DEPLOY_DIR -Recurse -Force

# Copy static files
Write-Host "   Copying static files..." -ForegroundColor Gray
New-Item -ItemType Directory -Path "$DEPLOY_DIR/.next/static" -Force | Out-Null
Copy-Item -Path ".next/static/*" -Destination "$DEPLOY_DIR/.next/static" -Recurse -Force

# Copy public directory
Write-Host "   Copying public directory..." -ForegroundColor Gray
Copy-Item -Path "public" -Destination $DEPLOY_DIR -Recurse -Force

# Create a simple README for deployment
$readmeContent = @'
# Appwrite Deployment Package

This directory contains the pre-built Next.js application ready for deployment.

## Structure
- server.js - Application entry point
- .next/static/ - Static assets
- public/ - Public files
- node_modules/ - Production dependencies

## Deployment Instructions

1. Upload this entire directory to Appwrite Storage or your deployment location
2. Set the entry point to: node server.js
3. Set PORT environment variable to 3000
4. Ensure Node.js 20+ is available

## Environment Variables Required

- NEXT_PUBLIC_APPWRITE_ENDPOINT
- NEXT_PUBLIC_APPWRITE_PROJECT_ID
- NEXT_PUBLIC_APPWRITE_DATABASE_ID
- Any other environment variables your app needs
'@

Set-Content -Path "$DEPLOY_DIR/README.md" -Value $readmeContent

Write-Host "✅ Deployment package created at: $DEPLOY_DIR" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Package size:" -ForegroundColor Cyan
$size = (Get-ChildItem -Path $DEPLOY_DIR -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "   $([math]::Round($size, 2)) MB" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 Ready for deployment!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review the package in: $DEPLOY_DIR" -ForegroundColor Gray
Write-Host "2. Upload to Appwrite Storage or configure Appwrite to use pre-built files" -ForegroundColor Gray
Write-Host "3. See docs/APPWRITE_PREBUILD_DEPLOYMENT.md for detailed instructions" -ForegroundColor Gray

