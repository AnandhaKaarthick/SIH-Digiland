@echo off
title DigiLand Launcher
echo ========================================================
echo         DigiLand Platform - Starting Servers
echo ========================================================
echo.
echo [1/2] Starting FastAPI Backend on http://localhost:8000...
start "DigiLand Backend (FastAPI)" cmd /k "python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Starting React / Vite Frontend on http://localhost:5173...
start "DigiLand Frontend (Vite)" cmd /k "npm run dev"

echo.
echo ========================================================
echo   Both services are launching in separate windows!
echo   - Backend API Docs: http://localhost:8000/docs
echo   - Web Application:  http://localhost:5173
echo ========================================================
echo.
pause
