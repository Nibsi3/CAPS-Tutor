# Restart Next.js Dev Server with Clean Cache
# This ensures environment variables are properly loaded

Write-Host "🔄 Restarting Next.js dev server with clean cache..." -ForegroundColor Cyan

# Kill any existing processes on port 9002
Write-Host "`n1. Checking for processes on port 9002..." -ForegroundColor Yellow
$connections = netstat -ano | Select-String ":9002\s+.*LISTENING"
if ($connections) {
    $pids = $connections | ForEach-Object {
        $_.Line -replace '.*\s+(\d+)$', '$1'
    } | Select-Object -Unique
    
    foreach ($pid in $pids) {
        Write-Host "   Killing process $pid..." -ForegroundColor Yellow
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

# Clear Next.js cache
Write-Host "`n2. Clearing .next cache..." -ForegroundColor Yellow
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host "   ✅ Cache cleared" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No cache to clear" -ForegroundColor Gray
}

# Verify .env.local exists
Write-Host "`n3. Checking .env.local..." -ForegroundColor Yellow
if (Test-Path .env.local) {
    $envContent = Get-Content .env.local
    $hasProjectId = $envContent | Select-String "NEXT_PUBLIC_APPWRITE_PROJECT_ID=" | Where-Object { $_ -notmatch "^#" }
    $hasDatabaseId = $envContent | Select-String "NEXT_PUBLIC_APPWRITE_DATABASE_ID=" | Where-Object { $_ -notmatch "^#" }
    $hasEndpoint = $envContent | Select-String "NEXT_PUBLIC_APPWRITE_ENDPOINT=" | Where-Object { $_ -notmatch "^#" }
    
    if ($hasProjectId -and $hasDatabaseId -and $hasEndpoint) {
        Write-Host "   ✅ All required Appwrite variables found" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Some variables may be missing!" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ .env.local not found!" -ForegroundColor Red
    exit 1
}

# Start dev server
Write-Host "`n4. Starting dev server..." -ForegroundColor Yellow
Write-Host "   Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

npm run dev

