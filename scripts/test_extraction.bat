@echo off
REM Quick test script for Paper Editor v3 extraction (Windows)

echo =====================================
echo Paper Editor v3 - Extraction Test
echo =====================================
echo.

REM Check Python
echo Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo X Python not found. Please install Python 3.8+
    exit /b 1
)

echo + Python found
python --version

REM Check PyMuPDF
echo Checking PyMuPDF installation...
python -c "import fitz" >nul 2>&1
if %errorlevel% neq 0 (
    echo X PyMuPDF not installed
    echo    Run: pip install PyMuPDF
    exit /b 1
)

echo + PyMuPDF installed
echo.

REM Test with sample file
if "%~1"=="" (
    echo Usage: test_extraction.bat ^<path_to_pdf^>
    echo.
    echo Example:
    echo   test_extraction.bat "C:\Users\cameron\Desktop\Life Sciences P1 Nov 2020 Eng (2).pdf"
    exit /b 0
)

set "PDF_PATH=%~1"

if not exist "%PDF_PATH%" (
    echo X PDF file not found: %PDF_PATH%
    exit /b 1
)

echo Extracting: %PDF_PATH%
echo.

REM Create output directory
set "OUTPUT_DIR=.\test_extraction_output"
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

REM Run extraction
python scripts\extract_paper_simple.py "%PDF_PATH%" "%OUTPUT_DIR%"

if %errorlevel% equ 0 (
    echo.
    echo =====================================
    echo + Extraction Complete!
    echo =====================================
    echo.
    echo Output location: %OUTPUT_DIR%
    echo   - extracted.json ^(paper data^)
    echo   - images\ ^(extracted diagrams^)
    echo.
    echo Next steps:
    echo 1. Open the web app: npm run dev
    echo 2. Navigate to /admin/paper-editor-v3
    echo 3. Load the extracted.json file
    echo.
) else (
    echo.
    echo X Extraction failed. Check errors above.
    exit /b 1
)
