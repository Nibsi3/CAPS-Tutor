# Calculate app size excluding git-ignored files
$excludedPatterns = @('node_modules', '\.next', '\.git', 'dist', 'build', 'out', '\.cache', 'venv', 'env', '__pycache__', 'past papers', 'Past Paper Images', 'extracted_papers', '\.pdf', '\.jpg', '\.jpeg', '\.png', '\.gif', '\.svg', '\.ico', '\.webp', '\.bmp', '\.tiff')
$pattern = $excludedPatterns -join '|'

$files = Get-ChildItem -Path . -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch $pattern }
$size = ($files | Measure-Object -Property Length -Sum).Sum
$mb = [math]::Round($size / 1MB, 2)
$kb = [math]::Round($size / 1KB, 2)

Write-Host "=== App Size (excluding git-ignored files) ==="
Write-Host "Size: $mb MB ($kb KB)"
Write-Host "File count: $($files.Count)"

# Calculate total size including ignored files
$total = (Get-ChildItem -Path . -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
$totalGB = [math]::Round($total / 1GB, 3)
$totalMB = [math]::Round($total / 1MB, 2)

Write-Host ""
Write-Host "=== Total Size (including ignored files) ==="
Write-Host "Size: $totalGB GB ($totalMB MB)"

