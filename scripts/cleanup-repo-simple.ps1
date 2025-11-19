# Simple Git Repository Cleanup Script (Alternative)
# This uses git filter-branch instead of git-filter-repo
# WARNING: This will rewrite Git history!

Write-Host "=== Simple Git Repository Cleanup Script ===" -ForegroundColor Cyan
Write-Host "WARNING: This will rewrite Git history!" -ForegroundColor Red
Write-Host ""

Write-Host "Current repository size:" -ForegroundColor Cyan
git count-objects -vH

Write-Host ""
Write-Host "Creating backup branch before cleanup..." -ForegroundColor Yellow
git branch backup-before-cleanup

Write-Host ""
Write-Host "Removing large files from Git history..." -ForegroundColor Cyan

# Remove large files using git filter-branch
$filesToRemove = @(
    "*.pdf",
    "*.jpg",
    "*.jpeg", 
    "*.png",
    "*.gif",
    "extracted_papers/",
    "Past Paper Images/",
    "scripts/all-papers-image-conversions.json",
    "scripts/ls-p2-image-conversions.json",
    "scripts/missing-images-report.json"
)

# Create a filter script
$filterScript = @"
git rm --cached --ignore-unmatch `$@
"@

$filterScript | Out-File -FilePath "temp-filter.sh" -Encoding ASCII

foreach ($file in $filesToRemove) {
    Write-Host "  - Removing $file..." -ForegroundColor Yellow
    git filter-branch --force --index-filter "git rm --cached --ignore-unmatch '$file'" --prune-empty --tag-name-filter cat -- --all
}

Remove-Item "temp-filter.sh" -ErrorAction SilentlyContinue

# Clean up
Write-Host ""
Write-Host "Cleaning up and optimizing repository..." -ForegroundColor Cyan
git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Host ""
Write-Host "Final repository size:" -ForegroundColor Cyan
git count-objects -vH

Write-Host ""
Write-Host "=== Cleanup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Your Git history has been rewritten!" -ForegroundColor Red
Write-Host "You will need to force push to update the remote repository:" -ForegroundColor Yellow
Write-Host "  git push origin --force --all" -ForegroundColor White
Write-Host ""
Write-Host "WARNING: Coordinate with your team before force pushing!" -ForegroundColor Red


