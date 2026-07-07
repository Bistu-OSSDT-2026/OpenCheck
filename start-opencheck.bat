@echo off
setlocal

cd /d "%~dp0"

echo.
echo ==============================
echo   OpenCheck local launcher
echo ==============================
echo.

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm was not found. Please install Node.js first.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [INFO] Installing project dependencies with npm ci...
  call npm ci
  if errorlevel 1 (
    echo.
    echo [ERROR] Dependency installation failed.
    pause
    exit /b 1
  )
) else (
  echo [INFO] Existing node_modules found. Skipping install.
)

echo.
echo [INFO] Starting OpenCheck dev server...
echo [INFO] The browser should open automatically. If not, use the URL printed below.
echo.

call npm run dev -- --host 127.0.0.1 --open

echo.
echo [INFO] OpenCheck dev server stopped.
pause
