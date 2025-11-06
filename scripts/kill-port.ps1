# Kill processes using a specific port
# Usage: .\scripts\kill-port.ps1 -Port 9002

param(
    [Parameter(Mandatory=$true)]
    [int]$Port
)

Write-Host "🔍 Finding processes using port $Port..." -ForegroundColor Cyan

$connections = netstat -ano | Select-String ":$Port\s+.*LISTENING"

if ($connections) {
    $pids = $connections | ForEach-Object {
        $_.Line -replace '.*\s+(\d+)$', '$1'
    } | Select-Object -Unique
    
    foreach ($pid in $pids) {
        Write-Host "⚠️  Found process $pid using port $Port" -ForegroundColor Yellow
        
        try {
            $process = Get-Process -Id $pid -ErrorAction Stop
            Write-Host "   Process: $($process.ProcessName) ($($process.Id))" -ForegroundColor Gray
            Stop-Process -Id $pid -Force -ErrorAction Stop
            Write-Host "✅ Successfully killed process $pid" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to kill process $pid : $_" -ForegroundColor Red
        }
    }
} else {
    Write-Host "✅ No processes found using port $Port" -ForegroundColor Green
}

