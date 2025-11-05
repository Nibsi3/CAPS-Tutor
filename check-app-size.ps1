# Check app size excluding node_modules and .git

Write-Host "Calculating app size..." -ForegroundColor Cyan

# Source code size (excluding node_modules and .git)
$sourceFiles = Get-ChildItem -Path . -Recurse -File -ErrorAction SilentlyContinue | Where-Object { 
    $_.FullName -notmatch '\\node_modules\\' -and 
    $_.FullName -notmatch '\\.git\\' 
}

$sourceSize = ($sourceFiles | Measure-Object -Property Length -Sum).Sum
$sourceSizeMB = [math]::Round($sourceSize / 1MB, 2)
$sourceSizeGB = [math]::Round($sourceSize / 1GB, 2)

Write-Host "`nSource Code (excluding node_modules and .git):" -ForegroundColor Green
Write-Host "  Size: $sourceSizeMB MB ($sourceSizeGB GB)" -ForegroundColor White
Write-Host "  Files: $($sourceFiles.Count)" -ForegroundColor White

# node_modules size if exists
if (Test-Path node_modules) {
    $nodeModulesFiles = Get-ChildItem -Path node_modules -Recurse -File -ErrorAction SilentlyContinue
    $nodeModulesSize = ($nodeModulesFiles | Measure-Object -Property Length -Sum).Sum
    $nodeModulesSizeMB = [math]::Round($nodeModulesSize / 1MB, 2)
    $nodeModulesSizeGB = [math]::Round($nodeModulesSize / 1GB, 2)
    
    Write-Host "`nnode_modules:" -ForegroundColor Yellow
    Write-Host "  Size: $nodeModulesSizeMB MB ($nodeModulesSizeGB GB)" -ForegroundColor White
    Write-Host "  Files: $($nodeModulesFiles.Count)" -ForegroundColor White
    
    # Total size
    $totalSize = $sourceSize + $nodeModulesSize
    $totalSizeMB = [math]::Round($totalSize / 1MB, 2)
    $totalSizeGB = [math]::Round($totalSize / 1GB, 2)
    
    Write-Host "`nTotal (including node_modules):" -ForegroundColor Magenta
    Write-Host "  Size: $totalSizeMB MB ($totalSizeGB GB)" -ForegroundColor White
} else {
    Write-Host "`nnode_modules: not found" -ForegroundColor Yellow
}

# Check for large directories
Write-Host "`nTop 10 largest directories (excluding node_modules and .git):" -ForegroundColor Cyan
Get-ChildItem -Path . -Directory -ErrorAction SilentlyContinue | Where-Object { 
    $_.Name -ne 'node_modules' -and $_.Name -ne '.git' 
} | ForEach-Object {
    $dirSize = (Get-ChildItem -Path $_.FullName -Recurse -File -ErrorAction SilentlyContinue | 
                Measure-Object -Property Length -Sum).Sum
    [PSCustomObject]@{
        Directory = $_.Name
        SizeMB = [math]::Round($dirSize / 1MB, 2)
        SizeGB = [math]::Round($dirSize / 1GB, 2)
    }
} | Sort-Object SizeMB -Descending | Select-Object -First 10 | Format-Table -AutoSize

