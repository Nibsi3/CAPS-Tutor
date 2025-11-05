# Deploy to Appwrite using CLI
# This script deploys the pre-built Next.js app to Appwrite Functions

$ErrorActionPreference = "Stop"

# Appwrite configuration
$PROJECT_ID = "690a39bf0011810ee554"
$FUNCTION_ID = "690a3b49003855f68c7e"
$DEPLOY_DIR = "appwrite-deploy"

Write-Host "🚀 Deploying to Appwrite..." -ForegroundColor Cyan

# Check if appwrite-deploy directory exists
if (-not (Test-Path $DEPLOY_DIR)) {
    Write-Host "❌ Error: $DEPLOY_DIR directory not found!" -ForegroundColor Red
    Write-Host "   Please run .\scripts\build-for-appwrite.ps1 first to create the deployment package" -ForegroundColor Yellow
    exit 1
}

# Check if server.js exists
if (-not (Test-Path "$DEPLOY_DIR\server.js")) {
    Write-Host "❌ Error: server.js not found in $DEPLOY_DIR!" -ForegroundColor Red
    Write-Host "   Please run .\scripts\build-for-appwrite.ps1 first to build the application" -ForegroundColor Yellow
    exit 1
}

# Check if Appwrite CLI is installed
Write-Host "📦 Checking Appwrite CLI installation..." -ForegroundColor Yellow
$cliInstalled = $false
try {
    $version = appwrite --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Appwrite CLI found: $version" -ForegroundColor Green
        $cliInstalled = $true
    }
} catch {
    $cliInstalled = $false
}

if (-not $cliInstalled) {
    Write-Host "❌ Appwrite CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Appwrite CLI first:" -ForegroundColor Yellow
    Write-Host "1. Visit: https://appwrite.io/docs/tooling/command-line/installation" -ForegroundColor Gray
    Write-Host "2. Or try: npm install -g appwrite-cli" -ForegroundColor Gray
    Write-Host "3. Or download from: https://github.com/appwrite/sdk-for-cli" -ForegroundColor Gray
    Write-Host ""
    Write-Host "After installation, run this script again." -ForegroundColor Yellow
    exit 1
}

# Check if logged in
Write-Host "🔐 Checking authentication..." -ForegroundColor Yellow
$loginCheck = appwrite account get 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Appwrite!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please login first:" -ForegroundColor Yellow
    Write-Host "   appwrite login" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Authenticated" -ForegroundColor Green

# Set project ID and endpoint
Write-Host "🔧 Setting Appwrite project..." -ForegroundColor Yellow
appwrite client --endpoint="https://cloud.appwrite.io/v1" --project-id=$PROJECT_ID
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to set project ID" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Project set to: $PROJECT_ID" -ForegroundColor Green

# Deploy to Appwrite
Write-Host "📤 Creating deployment..." -ForegroundColor Yellow
Write-Host "   Function ID: $FUNCTION_ID" -ForegroundColor Gray
Write-Host "   Code directory: $DEPLOY_DIR" -ForegroundColor Gray

appwrite functions create-deployment `
    --function-id=$FUNCTION_ID `
    --code="$DEPLOY_DIR" `
    --entrypoint="server.js" `
    --activate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Check Appwrite Console to verify deployment" -ForegroundColor Gray
Write-Host "2. Ensure environment variables are set in Appwrite Function settings:" -ForegroundColor Gray
Write-Host "   - PORT=3000" -ForegroundColor Gray
Write-Host "   - NEXT_PUBLIC_APPWRITE_ENDPOINT" -ForegroundColor Gray
Write-Host "   - NEXT_PUBLIC_APPWRITE_PROJECT_ID" -ForegroundColor Gray
Write-Host "   - NEXT_PUBLIC_APPWRITE_DATABASE_ID" -ForegroundColor Gray
Write-Host "3. Test your deployed function" -ForegroundColor Gray

