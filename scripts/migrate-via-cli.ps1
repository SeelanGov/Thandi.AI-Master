# Execute gate migration via Supabase CLI

Write-Host "🔧 Executing gate migration via Supabase CLI..." -ForegroundColor Cyan
Write-Host ""

# Read the SQL file
$sql = Get-Content -Path "scripts/add-gate-fields-to-careers.sql" -Raw

# Execute via Supabase CLI
Write-Host "Executing SQL..." -ForegroundColor Yellow
$sql | supabase db execute

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Migration complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verifying..." -ForegroundColor Yellow
    node scripts/add-gate-fields-simple.js
} else {
    Write-Host ""
    Write-Host "Migration failed" -ForegroundColor Red
    Write-Host "Error code:" $LASTEXITCODE -ForegroundColor Red
}
