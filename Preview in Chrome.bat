@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node.js 20.19+ or 22.12+ from https://nodejs.org/ then run this file again.
  pause
  exit /b 1
)

if not exist "node_modules\vite\bin\vite.js" (
  echo Installing project dependencies. This requires an internet connection on first run...
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed. Check your internet connection and npm configuration.
    pause
    exit /b 1
  )
)

start "Blitz Gaming development server" /D "%~dp0" cmd /k npm run dev -- --host 127.0.0.1
timeout /t 4 /nobreak >nul

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" "http://localhost:5173/"
  exit /b 0
)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" "http://localhost:5173/"
  exit /b 0
)
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
  start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" "http://localhost:5173/"
  exit /b 0
)
start "" "http://localhost:5173/"
echo Chrome was not found in its usual install location. The URL has been opened in your default browser.
