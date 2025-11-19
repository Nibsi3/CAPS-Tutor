# Git Repository Cleanup Script
# This script removes large files from Git history to reduce repository size
# WARNING: This will rewrite Git history. Make sure you have a backup!

Write-Host "=== Git Repository Cleanup Script ===" -ForegroundColor Cyan
Write-Host "WARNING: This will rewrite Git history!" -ForegroundColor Red
Write-Host "Make sure you have a backup or are working on a branch." -ForegroundColor Yellow
Write-Host ""

# Check if git-filter-repo is installed
$hasFilterRepo = Get-Command git-filter-repo -ErrorAction SilentlyContinue

if (-not $hasFilterRepo) {
    Write-Host "git-filter-repo is not installed." -ForegroundColor Yellow
    Write-Host "Installing git-filter-repo via pip..." -ForegroundColor Yellow
    pip install git-filter-repo
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install git-filter-repo. Please install it manually:" -ForegroundColor Red
        Write-Host "  pip install git-filter-repo" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "Current repository size:" -ForegroundColor Cyan
git count-objects -vH

Write-Host ""
Write-Host "Removing large files from Git history..." -ForegroundColor Cyan

# Remove PDF files
Write-Host "  - Removing PDF files..." -ForegroundColor Yellow
git filter-repo --path-glob '*.pdf' --invert-paths --force

# Remove image files
Write-Host "  - Removing image files..." -ForegroundColor Yellow
git filter-repo --path-glob '*.jpg' --invert-paths --force
git filter-repo --path-glob '*.jpeg' --invert-paths --force
git filter-repo --path-glob '*.png' --invert-paths --force
git filter-repo --path-glob '*.gif' --invert-paths --force

# Remove large JSON files that should not be in git
Write-Host "  - Removing large JSON data files..." -ForegroundColor Yellow
git filter-repo --path 'scripts/all-papers-image-conversions.json' --invert-paths --force
git filter-repo --path 'scripts/ls-p2-image-conversions.json' --invert-paths --force
git filter-repo --path 'scripts/missing-images-report.json' --invert-paths --force
git filter-repo --path-glob 'extracted_papers/**/*.json' --invert-paths --force

# Remove directories that should not be in git
Write-Host "  - Removing extracted_papers directory..." -ForegroundColor Yellow
git filter-repo --path 'extracted_papers' --invert-paths --force

Write-Host "  - Removing Past Paper Images directory..." -ForegroundColor Yellow
git filter-repo --path 'Past Paper Images' --invert-paths --force

# Clean up and optimize
Write-Host ""
Write-Host "Cleaning up and optimizing repository..." -ForegroundColor Cyan
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
Write-Host "  git push origin --force --tags" -ForegroundColor White
Write-Host ""
Write-Host "WARNING: Coordinate with your team before force pushing!" -ForegroundColor Red


