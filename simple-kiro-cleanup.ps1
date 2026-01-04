# Simple Kiro Process Cleanup
Write-Host "🔍 KIRO PROCESS CLEANUP" -ForegroundColor Cyan
Write-Host "=" * 30

# Get all Kiro processes
$kiroProcesses = Get-Process -Name "Kiro" -ErrorAction SilentlyContinue | Sort-Object WorkingSet -Descending

if ($kiroProcesses.Count -eq 0) {
    Write-Host "❌ No Kiro processes found" -ForegroundColor Red
    exit
}

Write-Host "📊 Found $($kiroProcesses.Count) Kiro processes" -ForegroundColor Yellow

# Show current processes
$kiroProcesses | ForEach-Object {
    $memoryMB = [math]::Round($_.WorkingSet / 1MB, 1)
    Write-Host "   PID: $($_.Id) | Memory: ${memoryMB}MB" -ForegroundColor White
}

# Identify main process (moderate memory usage, likely our chat session)
$mainProcess = $kiroProcesses | Where-Object { 
    $memoryMB = $_.WorkingSet / 1MB
    $memoryMB -gt 50 -and $memoryMB -lt 300
} | Select-Object -First 1

if ($mainProcess) {
    $mainMemory = [math]::Round($mainProcess.WorkingSet / 1MB, 1)
    Write-Host "`n✅ Preserving main process: PID $($mainProcess.Id) (${mainMemory}MB)" -ForegroundColor Green
}

# Kill memory hogs and tiny processes
$processesToKill = $kiroProcesses | Where-Object { 
    $_.Id -ne $mainProcess.Id -and (
        ($_.WorkingSet / 1MB) -gt 300 -or  # Kill memory hogs (>300MB)
        ($_.WorkingSet / 1MB) -lt 10       # Kill tiny processes (<10MB)
    )
}

if ($processesToKill.Count -gt 0) {
    Write-Host "`n🗑️  Killing $($processesToKill.Count) processes..." -ForegroundColor Red
    
    $processesToKill | ForEach-Object {
        $memoryMB = [math]::Round($_.WorkingSet / 1MB, 1)
        try {
            Stop-Process -Id $_.Id -Force
            Write-Host "✅ Killed PID: $($_.Id) (${memoryMB}MB)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to kill PID: $($_.Id)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "`nℹ️  No processes need cleanup" -ForegroundColor Blue
}

# Show final status
Start-Sleep -Seconds 2
$remainingProcesses = Get-Process -Name "Kiro" -ErrorAction SilentlyContinue
if ($remainingProcesses) {
    $totalMemory = ($remainingProcesses | Measure-Object WorkingSet -Sum).Sum / 1MB
    Write-Host "`n📊 FINAL STATUS:" -ForegroundColor Cyan
    Write-Host "✅ Remaining processes: $($remainingProcesses.Count)" -ForegroundColor Green
    Write-Host "✅ Total memory usage: $([math]::Round($totalMemory, 1))MB" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  No Kiro processes remaining" -ForegroundColor Yellow
}

Write-Host "`n🎯 CLEANUP COMPLETE" -ForegroundColor Green