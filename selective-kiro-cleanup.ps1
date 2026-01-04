# Selective Kiro Process Cleanup Script
# Kills background processes while preserving main chat session

Write-Host "🔍 KIRO PROCESS ANALYSIS" -ForegroundColor Cyan
Write-Host "=" * 50

# Get all Kiro processes with details
$kiroProcesses = Get-Process -Name "Kiro" -ErrorAction SilentlyContinue | Sort-Object WorkingSet -Descending

if ($kiroProcesses.Count -eq 0) {
    Write-Host "❌ No Kiro processes found" -ForegroundColor Red
    exit
}

Write-Host "📊 Current Kiro Processes:" -ForegroundColor Yellow
$kiroProcesses | ForEach-Object {
    $memoryMB = [math]::Round($_.WorkingSet / 1MB, 1)
    $cpuTime = $_.TotalProcessorTime.TotalSeconds
    Write-Host "   PID: $($_.Id) | Memory: ${memoryMB}MB | CPU: ${cpuTime}s | Start: $($_.StartTime)" -ForegroundColor White
}

Write-Host "`n🎯 SELECTIVE CLEANUP STRATEGY:" -ForegroundColor Green

# Identify processes to keep (main chat session - usually the one with moderate memory usage)
$mainProcess = $kiroProcesses | Where-Object { 
    $memoryMB = $_.WorkingSet / 1MB
    $memoryMB -gt 50 -and $memoryMB -lt 200  # Main process typically uses 50-200MB
} | Select-Object -First 1

if ($mainProcess) {
    Write-Host "✅ Preserving main process: PID $($mainProcess.Id) (${([math]::Round($mainProcess.WorkingSet / 1MB, 1))}MB)" -ForegroundColor Green
}

# Identify processes to kill (memory hogs and excessive workers)
$processesToKill = $kiroProcesses | Where-Object { 
    $_.Id -ne $mainProcess.Id -and (
        ($_.WorkingSet / 1MB) -gt 300 -or  # Kill memory hogs (>300MB)
        ($_.WorkingSet / 1MB) -lt 10       # Kill tiny worker processes (<10MB)
    )
}

if ($processesToKill.Count -gt 0) {
    Write-Host "🗑️  Processes to terminate:" -ForegroundColor Red
    $processesToKill | ForEach-Object {
        $memoryMB = [math]::Round($_.WorkingSet / 1MB, 1)
        Write-Host "   PID: $($_.Id) | Memory: ${memoryMB}MB" -ForegroundColor Red
    }
    
    Write-Host "`n⚠️  Proceeding with selective cleanup in 3 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    $processesToKill | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force
            Write-Host "✅ Killed PID: $($_.Id)" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to kill PID: $($_.Id) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "ℹ️  No processes identified for cleanup" -ForegroundColor Blue
}

Write-Host "`n📊 POST-CLEANUP STATUS:" -ForegroundColor Cyan
Start-Sleep -Seconds 2
$remainingProcesses = Get-Process -Name "Kiro" -ErrorAction SilentlyContinue
if ($remainingProcesses) {
    $totalMemory = ($remainingProcesses | Measure-Object WorkingSet -Sum).Sum / 1MB
    Write-Host "✅ Remaining processes: $($remainingProcesses.Count)" -ForegroundColor Green
    Write-Host "✅ Total memory usage: $([math]::Round($totalMemory, 1))MB" -ForegroundColor Green
} else {
    Write-Host "⚠️  No Kiro processes remaining" -ForegroundColor Yellow
}
} else {
    Write-Host "⚠️  No Kiro processes remaining" -ForegroundColor Yellow
}

Write-Host "`n🎯 READY TO CONTINUE WORK" -ForegroundColor Green