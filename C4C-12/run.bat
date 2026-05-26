@echo off
title GraamSehat Dev Environment Setup & Launch
echo ==========================================================
echo               GRAAMSEHAT DEVELOPMENT SUITE
echo ==========================================================
echo.
echo This script will:
echo  1. Install all dependencies in all 5 folders (essential for a new computer)
echo  2. Start all 5 servers on specific ports
echo  3. Automatically open all 5 apps in your browser
echo.
echo Press any key to start the setup...
pause > nul

echo.
echo ----------------------------------------------------------
echo [Step 1/2] Installing Dependencies (This may take a moment)
echo ----------------------------------------------------------

echo.
echo [1/5] Installing IVR Server dependencies...
cd IVR && call npm install && cd ..

echo.
echo [2/5] Installing Landing Page dependencies...
cd "Landing Page" && call npm install && cd ..

echo.
echo [3/5] Installing Villager App dependencies...
cd "Villager App" && call npm install && cd ..

echo.
echo [4/5] Installing ASHA Worker App dependencies...
cd "ASHA Worker" && call npm install && cd ..

echo.
echo [5/5] Installing Admin Dashboard dependencies...
cd "Admin Dashboard" && call npm install && cd ..

echo.
echo Dependencies successfully verified/installed!
echo.
echo ----------------------------------------------------------
echo [Step 2/2] Launching Servers & Opening Web Browser Tabs
echo ----------------------------------------------------------
echo.

:: Start IVR Server
echo Starting IVR Server on http://127.0.0.1:5000 ...
start "GraamSehat - IVR Server" /D "IVR" cmd /k "npm start"

:: Start Landing Page
echo Starting Landing Page on http://127.0.0.1:3000 ...
start "GraamSehat - Landing Page" /D "Landing Page" cmd /k "npm run dev -- --port 3000 --host 127.0.0.1"

:: Start Villager App
echo Starting Villager App on http://127.0.0.1:3001 ...
start "GraamSehat - Villager App" /D "Villager App" cmd /k "npm run dev -- --port 3001 --host 127.0.0.1"

:: Start ASHA Worker App
echo Starting ASHA Worker App on http://127.0.0.1:3002 ...
start "GraamSehat - ASHA Worker" /D "ASHA Worker" cmd /k "npm run dev -- --port 3002 --host 127.0.0.1"

:: Start Admin Dashboard
echo Starting Admin Dashboard on http://127.0.0.1:3003 ...
start "GraamSehat - Admin Dashboard" /D "Admin Dashboard" cmd /k "npm run dev -- --port 3003 --host 127.0.0.1"

echo.
echo Waiting 5 seconds for dev servers to initialize...
timeout /t 5 /nobreak > nul

echo Opening browser tabs...
start http://127.0.0.1:3000
start http://127.0.0.1:3001
start http://127.0.0.1:3002
start http://127.0.0.1:3003
start http://127.0.0.1:5000

echo.
echo ==========================================================
echo 🎉 All 5 applications are now running and open in your browser!
echo.
echo Port mapping summary:
echo  - http://127.0.0.1:3000 (Landing Page)
echo  - http://127.0.0.1:3001 (Villager App)
echo  - http://127.0.0.1:3002 (ASHA Worker App)
echo  - http://127.0.0.1:3003 (Admin Dashboard)
echo  - http://127.0.0.1:5000 (IVR Simulator Dashboard)
echo ==========================================================
echo.
pause
