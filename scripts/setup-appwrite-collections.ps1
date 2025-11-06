# Setup Appwrite Collections
# This script helps you create the required collections in Appwrite

Write-Host "📋 Appwrite Collections Setup" -ForegroundColor Cyan
Write-Host ""

$databaseId = "capstutor"
$projectId = "690a39bf0011810ee554"

Write-Host "Project ID: $projectId" -ForegroundColor Yellow
Write-Host "Database ID: $databaseId" -ForegroundColor Yellow
Write-Host ""

# Check if Appwrite CLI is available
$appwriteAvailable = $false
try {
    $version = appwrite --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $appwriteAvailable = $true
        Write-Host "✅ Appwrite CLI is installed" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Appwrite CLI not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "To create the 'users' collection:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1: Using Appwrite Console (Recommended)" -ForegroundColor Yellow
Write-Host "1. Go to: https://cloud.appwrite.io/console" -ForegroundColor White
Write-Host "2. Select project: CAPS Tutor" -ForegroundColor White
Write-Host "3. Go to: Databases → $databaseId" -ForegroundColor White
Write-Host "4. Click: Create Collection" -ForegroundColor White
Write-Host "5. Collection ID: users" -ForegroundColor White
Write-Host "6. Name: Users" -ForegroundColor White
Write-Host "7. Click: Create" -ForegroundColor White
Write-Host ""
Write-Host "Then add these attributes:" -ForegroundColor Yellow
Write-Host "  - firstName (String, 255)" -ForegroundColor Gray
Write-Host "  - lastName (String, 255)" -ForegroundColor Gray
Write-Host "  - email (String, 255)" -ForegroundColor Gray
Write-Host "  - gradeLevel (Integer, 1-12)" -ForegroundColor Gray
Write-Host "  - subjects (String Array)" -ForegroundColor Gray
Write-Host "  - language (String, default: 'en')" -ForegroundColor Gray
Write-Host "  - loginDates (String Array)" -ForegroundColor Gray
Write-Host "  - lastLoginDate (String)" -ForegroundColor Gray
Write-Host "  - lastLoginTimestamp (String)" -ForegroundColor Gray
Write-Host "  - totalStudyTimeMinutes (Integer)" -ForegroundColor Gray
Write-Host "  - unlockedAchievements (String Array)" -ForegroundColor Gray
Write-Host ""
Write-Host "Set permissions:" -ForegroundColor Yellow
Write-Host "  - Create: Users" -ForegroundColor Gray
Write-Host "  - Read: Users" -ForegroundColor Gray
Write-Host "  - Update: Users" -ForegroundColor Gray
Write-Host "  - Delete: None" -ForegroundColor Gray
Write-Host ""

if ($appwriteAvailable) {
    Write-Host "Option 2: Using Appwrite CLI" -ForegroundColor Yellow
    Write-Host "Run these commands:" -ForegroundColor White
    Write-Host "  appwrite databases createCollection --databaseId=$databaseId --collectionId=users --name='Users'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Then add attributes and permissions via console or CLI." -ForegroundColor Gray
    Write-Host ""
}

Write-Host "For detailed instructions, see: docs/APPWRITE_COLLECTIONS_SETUP.md" -ForegroundColor Cyan
Write-Host ""

# Try to list existing collections
if ($appwriteAvailable) {
    Write-Host "Checking existing collections..." -ForegroundColor Yellow
    try {
        appwrite databases listCollections --databaseId $databaseId 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Can access database" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️  Could not list collections. Make sure you're logged into Appwrite CLI." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "After creating the collection, refresh your browser and try signing in again." -ForegroundColor Green

