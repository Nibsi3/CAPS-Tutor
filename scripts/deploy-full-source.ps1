# Deploy full source code to Appwrite Functions
# This script packages the entire project for Appwrite to build

$ErrorActionPreference = "Stop"

# Appwrite configuration
$PROJECT_ID = "690a39bf0011810ee554"
$FUNCTION_ID = "690a3b49003855f68c7e"
$DEPLOY_DIR = "appwrite-source-deploy"

Write-Host "🚀 Preparing full source deployment to Appwrite..." -ForegroundColor Cyan

# Check if Appwrite CLI is installed
Write-Host "📦 Checking Appwrite CLI..." -ForegroundColor Yellow
$cliCheck = appwrite --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Appwrite CLI not found!" -ForegroundColor Red
    Write-Host "   Install with: npm install -g appwrite-cli" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Appwrite CLI found" -ForegroundColor Green

# Check if logged in
Write-Host "🔐 Checking authentication..." -ForegroundColor Yellow
$loginCheck = appwrite account get 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in!" -ForegroundColor Red
    Write-Host "   Run: appwrite login" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Authenticated" -ForegroundColor Green

# Create deployment directory
if (Test-Path $DEPLOY_DIR) {
    Remove-Item -Path $DEPLOY_DIR -Recurse -Force
}
New-Item -ItemType Directory -Path $DEPLOY_DIR | Out-Null

Write-Host "📦 Copying source files..." -ForegroundColor Yellow

# Copy essential files and directories
$itemsToCopy = @(
    "src",
    "public",
    "package.json",
    "package-lock.json",
    "next.config.ts",
    "tsconfig.json",
    "tailwind.config.ts",
    "postcss.config.mjs",
    "components.json",
    ".env.local"
)

foreach ($item in $itemsToCopy) {
    if (Test-Path $item) {
        if ((Get-Item $item).PSIsContainer) {
            Copy-Item -Path $item -Destination $DEPLOY_DIR -Recurse -Force
            Write-Host "   ✓ Copied $item/" -ForegroundColor Gray
        } else {
            Copy-Item -Path $item -Destination $DEPLOY_DIR -Force
            Write-Host "   ✓ Copied $item" -ForegroundColor Gray
        }
    }
}

# Create a .dockerignore-like file for Appwrite
$ignoreContent = @"
node_modules
.next
out
dist
build
*.log
.env
.env.*
.git
.gitignore
README.md
docs
scripts
past papers
*.pdf
*.py
*.ps1
*.sh
*.bat
appwrite-deploy
appwrite-source-deploy
"@
Set-Content -Path "$DEPLOY_DIR\.appwriteignore" -Value $ignoreContent

Write-Host "✅ Source package created at: $DEPLOY_DIR" -ForegroundColor Green

# Set project
Write-Host "🔧 Setting Appwrite project..." -ForegroundColor Yellow
appwrite client --endpoint="https://cloud.appwrite.io/v1" --project-id=$PROJECT_ID
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to set project" -ForegroundColor Red
    exit 1
}

# Deploy
Write-Host "📤 Deploying to Appwrite Functions..." -ForegroundColor Yellow
Write-Host "   This will trigger a build on Appwrite's servers" -ForegroundColor Gray

appwrite functions create-deployment `
    --function-id=$FUNCTION_ID `
    --code="$DEPLOY_DIR" `
    --activate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Note: If build times out, you may need to:" -ForegroundColor Yellow
    Write-Host "1. Configure Appwrite Function to skip build (if supported)" -ForegroundColor Gray
    Write-Host "2. Use Appwrite Sites/Hosting instead of Functions" -ForegroundColor Gray
    Write-Host "3. Optimize the build further" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "✅ Deployment initiated!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Monitor the build in Appwrite Console" -ForegroundColor Gray
Write-Host "2. Ensure build command is: npm run build" -ForegroundColor Gray
Write-Host "3. Set entry point to: node .next/standalone/server.js" -ForegroundColor Gray
Write-Host "4. Configure environment variables" -ForegroundColor Gray

