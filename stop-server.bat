@echo off
echo Stopping CAPS Tutor Dev Server...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :9002 ^| findstr LISTENING') do (
    echo Killing process %%a
    taskkill /F /PID %%a >nul 2>&1
)
echo Server stopped.
timeout /t 2 >nul



