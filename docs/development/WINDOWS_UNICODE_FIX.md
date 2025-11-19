# ✅ Windows Unicode Encoding Fix

## Problem

When processing PDFs on Windows, you encountered this error:

```
UnicodeEncodeError: 'charmap' codec can't encode character '\uf0e0' in position 5716: character maps to <undefined>
```

## Root Cause

1. **Windows Default Encoding**: Windows PowerShell/CMD uses `cp1252` encoding by default
2. **PDF Special Characters**: Life Sciences PDFs contain Unicode characters (like `\uf0e0`) used for:
   - Special symbols (arrows, Greek letters, mathematical symbols)
   - Bullets and formatting
   - Diagram labels
3. **Python stdout**: When Python prints to stdout, it uses the console's encoding (cp1252), which can't handle these characters

## The Fix (Applied)

### 1. Node.js Side (`src/lib/pdf-pymupdf-extractor.ts`)
```typescript
const { stdout, stderr } = await execAsync(command, {
  maxBuffer: 50 * 1024 * 1024,
  timeout: 120000,
  env: {
    ...process.env,
    PYTHONIOENCODING: 'utf-8' // ← Forces UTF-8 encoding
  }
});
```

This environment variable tells Python to use UTF-8 encoding for all I/O operations.

### 2. Python Side (`scripts/extract_pdf_pymupdf.py`)
```python
# Force UTF-8 encoding for stdout (Windows fix)
try:
    if sys.stdout.encoding != 'utf-8':
        sys.stdout.reconfigure(encoding='utf-8')
except AttributeError:
    # Python < 3.7 doesn't have reconfigure
    # The PYTHONIOENCODING env var should handle it
    pass
```

This explicitly reconfigures stdout to use UTF-8 encoding.

### 3. Better Error Handling
```typescript
if (errorMsg.includes('unicodeencodeerror') || errorMsg.includes('charmap')) {
  throw new Error(
    'Unicode encoding error (Windows). This should be fixed by PYTHONIOENCODING=utf-8.\n' +
    'If this persists, try running PowerShell as Administrator or set:\n' +
    '$env:PYTHONIOENCODING="utf-8"\n' +
    'Original error: ' + error.message
  );
}
```

Now gives helpful instructions if encoding issues persist.

## Testing the Fix

### 1. Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

The fix is automatic - the system will now set `PYTHONIOENCODING=utf-8` when calling Python.

### 2. Try Processing Again
Navigate to `http://localhost:9002/admin/process-papers` and click "Process All Past Papers"

### 3. Expected Result
```
📄 Processing paper: Life Sciences P1 Nov 2020 Eng (2).pdf
   🐍 Extracting paper with PyMuPDF...
   ✅ Downloaded file: 632.09 KB
   ✓ Extracted 15 pages, 23 images
   🤖 Processing with AI (single pass)...
   ✅ Extracted 150 questions
✅ Successfully processed
```

## If It Still Fails

### Manual Environment Variable (PowerShell)
```powershell
# Set for current session
$env:PYTHONIOENCODING="utf-8"

# Set permanently (requires admin)
[System.Environment]::SetEnvironmentVariable('PYTHONIOENCODING', 'utf-8', 'User')

# Restart PowerShell and dev server
npm run dev
```

### Manual Environment Variable (CMD)
```cmd
set PYTHONIOENCODING=utf-8
npm run dev
```

### Alternative: Use UTF-8 Console
```powershell
# Set console to UTF-8 (PowerShell)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Or change Windows Terminal settings:
# Settings → Profiles → Windows PowerShell → Command line:
# Add "-ExecutionPolicy Bypass -NoLogo -NoProfile" to command line
```

## Why This Works

1. **PYTHONIOENCODING=utf-8**: Tells Python to use UTF-8 for stdin/stdout/stderr
2. **sys.stdout.reconfigure()**: Changes the encoding of stdout stream at runtime
3. **Combined approach**: Ensures compatibility with different Python versions and Windows setups

## Technical Details

### Unicode Character Examples in PDFs:
- `\uf0e0` - Private Use Area (often used for custom symbols)
- `\u2192` - Rightwards arrow (→)
- `\u03b1` - Greek letter alpha (α)
- `\u2022` - Bullet point (•)

### Why cp1252 Fails:
- cp1252 (Windows-1252) is a single-byte encoding
- It only supports 256 characters (0x00 to 0xFF)
- Unicode has 143,859+ characters (as of Unicode 15.0)
- Characters outside cp1252 range cause `UnicodeEncodeError`

### Why UTF-8 Works:
- UTF-8 is a variable-length encoding (1-4 bytes per character)
- Supports all 143,859+ Unicode characters
- Backward compatible with ASCII (first 128 characters)
- Standard encoding for modern applications

## Related Files

- ✅ `src/lib/pdf-pymupdf-extractor.ts` - Sets PYTHONIOENCODING
- ✅ `scripts/extract_pdf_pymupdf.py` - Reconfigures stdout
- ✅ `TEST_PYMUPDF.md` - Updated troubleshooting guide
- ✅ Error handling improved with specific Unicode error detection

## Status

✅ **FIXED** - Automatically applied when you restart the dev server

The system will now handle Unicode characters in PDFs correctly on Windows.

