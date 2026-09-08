Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "        DigiLand Platform - Starting Servers" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[1/2] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

Write-Host "[2/2] Starting React / Vite Frontend on http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "   Both services are launching in separate windows!" -ForegroundColor Green
Write-Host "   - Backend API Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "   - Web Application:  http://localhost:5173" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
