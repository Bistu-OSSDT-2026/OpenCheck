@echo off
setlocal

cd /d "%~dp0"
set "HOST=127.0.0.1"
set "PORT=5173"
set "APP_URL=http://%HOST%:%PORT%/"

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
echo [INFO] Checking %APP_URL% ...
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $response = Invoke-WebRequest -UseBasicParsing -Uri '%APP_URL%' -TimeoutSec 2; if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500 -and $response.Content -like '*OpenCheck*') { exit 0 } exit 1 } catch { exit 1 }" >nul 2>nul
if not errorlevel 1 (
  echo [INFO] Existing OpenCheck dev server found. Opening browser...
  start "" "%APP_URL%"
  exit /b 0
)

echo.
echo [INFO] Starting OpenCheck dev server at %APP_URL% ...
echo [INFO] The browser should open automatically. If not, use %APP_URL%.
echo.

call npm run dev -- --host %HOST% --port %PORT% --strictPort --open /

echo.
echo [INFO] OpenCheck dev server stopped.
pause
