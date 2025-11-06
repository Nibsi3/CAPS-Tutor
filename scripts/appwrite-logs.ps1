# Appwrite Log Monitor (PowerShell)
# Monitors Appwrite logs and provides utilities for viewing logs

param(
    [string]$Level = "",
    [string]$Category = "",
    [string]$Export = "",
    [int]$Port = 3000,
    [switch]$Follow,
    [switch]$Help
)

$ErrorActionPreference = "Continue"

function Write-ColorOutput($ForegroundColor, $Message) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $fc
}

function Show-Help {
    Write-ColorOutput "Cyan" "`nAppwrite Log Monitor`n"
    Write-Output "Usage: .\scripts\appwrite-logs.ps1 [options]`n"
    Write-Output "Options:"
    Write-Output "  -Level <level>        Filter by log level (info, warn, error, debug)"
    Write-Output "  -Category <category>  Filter by category (auth, database, storage, api, general)"
    Write-Output "  -Export <file>        Export logs to JSON file"
    Write-Output "  -Port <port>          Port of the Next.js dev server (default: 3000)"
    Write-Output "  -Follow               Follow/log new entries"
    Write-Output "  -Help                 Show this help message`n"
    Write-Output "Examples:"
    Write-Output "  .\scripts\appwrite-logs.ps1"
    Write-Output "  .\scripts\appwrite-logs.ps1 -Level error"
    Write-Output "  .\scripts\appwrite-logs.ps1 -Category auth -Follow`n"
    Write-Output "Note: This script monitors logs from the browser console."
    Write-Output "For Appwrite Functions/App Hosting logs, use:"
    Write-Output "  appwrite functions logs"
    Write-Output "  appwrite apphosting logs`n"
}

if ($Help) {
    Show-Help
    exit 0
}

Write-ColorOutput "Cyan" "`nAppwrite Log Monitor`n"
Write-Output "Monitoring Appwrite logs...`n"

# Check if Next.js app is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$Port" -Method Get -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-ColorOutput "Green" "✓ Next.js app is running on port $Port`n"
} catch {
    Write-ColorOutput "Yellow" "⚠️  Next.js app is not running on port $Port"
    Write-Output "Start your app with: npm run dev`n"
}

Write-ColorOutput "Cyan" "To view Appwrite logs:`n"
Write-Output "1. Open your browser and navigate to http://localhost:$Port"
Write-Output "2. Open the browser's Developer Console (F12 or Right-click → Inspect → Console)"
Write-Output "3. Look for logs prefixed with [Appwrite ...]`n"

Write-ColorOutput "Cyan" "Or use the logger API in browser console:`n"
Write-Output "  // View all logs"
Write-Output "  window.appwriteLogger.getLogs()"
Write-Output ""
Write-Output "  // Filter logs"
Write-Output "  window.appwriteLogger.getFilteredLogs({ level: 'error' })"
Write-Output "  window.appwriteLogger.getFilteredLogs({ category: 'auth' })"
Write-Output ""
Write-Output "  // Export logs"
Write-Output "  window.appwriteLogger.exportLogsAsText()"
Write-Output "  window.appwriteLogger.exportLogs()"
Write-Output ""
Write-Output "  // Listen for new logs"
Write-Output "  window.appwriteLogger.addListener((log) => console.log(log))"
Write-Output ""

if ($Export) {
    Write-ColorOutput "Yellow" "`nNote: To export logs, you need to access the browser console."
    Write-Output "In browser console, run:"
    Write-Output "  window.appwriteLogger.exportLogs()`n"
    Write-Output "Or copy the output and save to: $Export`n"
}

if ($Follow) {
    Write-ColorOutput "Yellow" "`nFollowing logs...`n"
    Write-Output "This script will continue running. Open browser console to see logs.`n"
    Write-Output "Press Ctrl+C to stop.`n"
    
    # Keep script running
    try {
        while ($true) {
            Start-Sleep -Seconds 1
        }
    } catch {
        Write-Output "`nStopped monitoring."
    }
}

