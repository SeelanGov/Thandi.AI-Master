# PowerShell script to clean up Node.js processes and prepare for testing

Write-Host "🧹 Cleaning up Node.js processes..." -ForegroundColor Yellow

# Kill all Node.js processes
Write-Host "Stopping all Node.js processes..."
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✅ Node.js processes stopped" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  No Node.js processes found" -ForegroundColor Blue
}

# Check for processes using port 3000
Write-Host "`nChecking port 3000..."
$port3000 = netstat -ano | Select-String ":3000"
if ($port3000) {
    Write-Host "⚠️  Port 3000 is in use:" -ForegroundColor Yellow
    $port3000
    Write-Host "You may need to kill these processes manually" -ForegroundColor Yellow
} else {
    Write-Host "✅ Port 3000 is free" -ForegroundColor Green
}

# Clear npm cache if needed
Write-Host "`n🗑️  Clearing npm cache..."
npm cache clean --force 2>$null
Write-Host "✅ npm cache cleared" -ForegroundColor Green

Write-Host "`n🚀 System cleaned up! Ready to start fresh." -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. npm run dev" -ForegroundColor White
Write-Host "2. Test: http://localhost:3000/api/pdf/test-session" -ForegroundColor White
Write-Host "3. Verify PDF downloads (not text)" -ForegroundColor White