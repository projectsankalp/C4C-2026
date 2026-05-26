Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "               GRAAMSEHAT DEVELOPMENT SUITE" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will:" -ForegroundColor Gray
Write-Host " 1. Install all dependencies in all 5 folders (essential for a new computer)" -ForegroundColor Gray
Write-Host " 2. Start all 5 servers on specific ports" -ForegroundColor Gray
Write-Host " 3. Automatically open all 5 apps in your browser" -ForegroundColor Gray
Write-Host ""

$apps = @(
    @{ Name = "IVR Server"; Path = "IVR"; Port = 5000; Command = "npm start"; Url = "http://127.0.0.1:5000" },
    @{ Name = "Landing Page"; Path = "Landing Page"; Port = 3000; Command = "npm run dev -- --port 3000 --host 127.0.0.1"; Url = "http://127.0.0.1:3000" },
    @{ Name = "Villager App"; Path = "Villager App"; Port = 3001; Command = "npm run dev -- --port 3001 --host 127.0.0.1"; Url = "http://127.0.0.1:3001" },
    @{ Name = "ASHA Worker"; Path = "ASHA Worker"; Port = 3002; Command = "npm run dev -- --port 3002 --host 127.0.0.1"; Url = "http://127.0.0.1:3002" },
    @{ Name = "Admin Dashboard"; Path = "Admin Dashboard"; Port = 3003; Command = "npm run dev -- --port 3003 --host 127.0.0.1"; Url = "http://127.0.0.1:3003" }
)

Write-Host "----------------------------------------------------------" -ForegroundColor Yellow
Write-Host "[Step 1/2] Verifying & Installing Dependencies" -ForegroundColor Yellow
Write-Host "----------------------------------------------------------" -ForegroundColor Yellow

foreach ($app in $apps) {
    Write-Host "Verifying dependencies for $($app.Name)..." -ForegroundColor Yellow
    Push-Location "$($app.Path)"
    try {
        npm install
    } finally {
        Pop-Location
    }
    Write-Host "✓ $($app.Name) dependencies checked." -ForegroundColor Green
    Write-Host ""
}

Write-Host "----------------------------------------------------------" -ForegroundColor Yellow
Write-Host "[Step 2/2] Launching Servers & Opening Web Browser Tabs" -ForegroundColor Yellow
Write-Host "----------------------------------------------------------" -ForegroundColor Yellow
Write-Host ""

foreach ($app in $apps) {
    Write-Host "Launching $($app.Name) on port $($app.Port)..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { cd '$($app.Path)'; $($app.Command) }"
}

Write-Host "Waiting 5 seconds for dev servers to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Opening browser tabs..." -ForegroundColor Green
foreach ($app in $apps) {
    Start-Process $app.Url
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🎉 All 5 applications are now running and open in your browser!" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
