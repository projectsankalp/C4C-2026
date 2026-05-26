@echo off
:: ─────────────────────────────────────────────────────────────────────────────
:: HaathSe KritiCam Backend — Quick Start Script
:: Run this from the kriticam-backend\ folder: start_backend.bat
:: ─────────────────────────────────────────────────────────────────────────────

echo.
echo  ██╗  ██╗ █████╗  █████╗ ████████╗██╗  ██╗███████╗███████╗
echo  ██║  ██║██╔══██╗██╔══██╗╚══██╔══╝██║  ██║██╔════╝██╔════╝
echo  ███████║███████║███████║   ██║   ███████║███████╗█████╗
echo  ██╔══██║██╔══██║██╔══██║   ██║   ██╔══██║╚════██║██╔══╝
echo  ██║  ██║██║  ██║██║  ██║   ██║   ██║  ██║███████║███████╗
echo  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚══════╝
echo.
echo  KritiCam AI Backend — Person 1 Server
echo  ─────────────────────────────────────────
echo.

:: Check if .env exists
if not exist ".env" (
    echo  [WARNING] No .env file found!
    echo  Copying .env.example to .env...
    copy .env.example .env
    echo  Please edit .env with your API keys, then re-run this script.
    echo  Running in DEMO MODE without real API keys.
    echo.
)

:: Activate virtual environment
if exist "venv\Scripts\activate.bat" (
    echo  [OK] Activating virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo  [ERROR] Virtual environment not found!
    echo  Run: python -m venv venv ^& pip install -r requirements.txt
    pause
    exit /b 1
)

:: Launch the FastAPI server
echo  [START] Launching FastAPI on http://localhost:8000
echo  [INFO]  Swagger UI: http://localhost:8000/docs
echo  [INFO]  Health check: http://localhost:8000/api/health
echo  [INFO]  Press Ctrl+C to stop the server
echo.

uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause
