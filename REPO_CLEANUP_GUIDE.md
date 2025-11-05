# Repository Cleanup Guide

## Current Situation

Your repository is **6.36 GiB** (not 200MB), which is too large. Here's what's causing it:

### Large Files in Git History

1. **PDF Files** (many files 1-4MB each):
   - `past papers/Design P2 Nov 2020 Eng.pdf` (4.22 MB)
   - `past papers/Design P2 Nov 2020 Afr.pdf` (4.22 MB)
   - `past papers/Tourism Nov 2020 Afr.pdf` (3.52 MB)
   - And many more PDFs in the `past papers/` directory

2. **Image Files**:
   - Many PNG and JPG files in `extracted_papers/` and `Past Paper Images/`
   - Images extracted from PDFs

3. **Large JSON Files**:
   - `scripts/all-papers-image-conversions.json` (2.71 MB)
   - `scripts/ls-p2-image-conversions.json`
   - `scripts/missing-images-report.json`
   - JSON files in `extracted_papers/`

4. **Large TypeScript File**:
   - `src/lib/questions.ts` (2.93 MB) - Consider moving this to a database

5. **Build Cache** (if committed):
   - `.next/cache/` directory with large pack files (239MB, 166MB)

## Solution

### Option 1: Automated Cleanup (Recommended)

I've created two cleanup scripts:

1. **`cleanup-repo.ps1`** - Uses `git-filter-repo` (more modern, recommended)
2. **`cleanup-repo-simple.ps1`** - Uses `git filter-branch` (fallback)

**To use the automated cleanup:**

```powershell
# Install git-filter-repo (if not already installed)
pip install git-filter-repo

# Run the cleanup script
.\cleanup-repo.ps1
```

**⚠️ IMPORTANT WARNINGS:**
- This will **rewrite Git history**
- You'll need to **force push** to update GitHub: `git push origin --force --all`
- **Coordinate with your team** before force pushing
- Make sure you have a **backup** or work on a branch first

### Option 2: Manual Cleanup

If you prefer to do it manually:

1. **Install git-filter-repo:**
   ```powershell
   pip install git-filter-repo
   ```

2. **Remove PDFs from history:**
   ```powershell
   git filter-repo --path-glob '*.pdf' --invert-paths --force
   ```

3. **Remove images:**
   ```powershell
   git filter-repo --path-glob '*.jpg' --invert-paths --force
   git filter-repo --path-glob '*.jpeg' --invert-paths --force
   git filter-repo --path-glob '*.png' --invert-paths --force
   ```

4. **Remove large JSON files:**
   ```powershell
   git filter-repo --path 'scripts/all-papers-image-conversions.json' --invert-paths --force
   git filter-repo --path 'scripts/ls-p2-image-conversions.json' --invert-paths --force
   git filter-repo --path-glob 'extracted_papers/**/*.json' --invert-paths --force
   ```

5. **Remove directories:**
   ```powershell
   git filter-repo --path 'extracted_papers' --invert-paths --force
   git filter-repo --path 'Past Paper Images' --invert-paths --force
   ```

6. **Clean up and optimize:**
   ```powershell
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

### Option 3: Start Fresh (If You're the Only Contributor)

If you're the only one working on this repo and can afford to lose history:

1. Create a new branch with current state (without large files)
2. Delete old branches
3. Force push

**⚠️ This loses all commit history!**

## After Cleanup

1. **Check repository size:**
   ```powershell
   git count-objects -vH
   ```

2. **Force push to GitHub:**
   ```powershell
   git push origin --force --all
   git push origin --force --tags
   ```

3. **Verify on GitHub** that the repository size has decreased

## Prevention

The `.gitignore` file has been updated to prevent these files from being committed in the future:

- ✅ `.next/cache/` and `.next/static/` are now ignored
- ✅ All PDF, image, and large JSON files are already ignored

**Always check `git status` before committing** to ensure large files aren't accidentally added.

## Additional Recommendations

1. **Consider using Git LFS** for any large files that must be versioned:
   ```powershell
   git lfs install
   git lfs track "*.pdf"
   ```

2. **Move `questions.ts` to a database** - The 2.93 MB file should be in Firestore, not in Git

3. **Use GitHub's file size limits** - GitHub warns about files > 50MB and blocks files > 100MB

## Expected Results

After cleanup, your repository should be:
- **Under 100MB** (ideal)
- **100-200MB** (acceptable)
- Much faster to clone and push/pull

## Need Help?

If you encounter issues:
1. Check that `git-filter-repo` is properly installed
2. Ensure you have write access to the repository
3. Make sure you're on the correct branch
4. Consider creating a backup branch first: `git branch backup-before-cleanup`


