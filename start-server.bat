@echo off
cd /d "%~dp0"
start "CAPS Tutor Dev Server" /min powershell -NoExit -Command "npm run dev"
echo Server starting on http://localhost:9002
echo The server window has been minimized to the taskbar.
echo You can close this window - the server will keep running.
timeout /t 3 >nul



