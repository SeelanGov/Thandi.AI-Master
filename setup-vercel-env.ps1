# Setup Vercel Environment Variables (PowerShell)
# Run this script to add all environment variables to Vercel

Write-Host "`n🔐 Setting up Vercel Environment Variables..." -ForegroundColor Cyan
Write-Host "=" * 60
Write-Host ""

# Read .env.local file
$envFile = Get-Content .env.local
$envVars = @{}

foreach ($line in $envFile) {
    if ($line -match '^([^#][^=]+)=(.+)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $envVars[$key] = $value
    }
}

Write-Host "Found $($envVars.Count) environment variables" -ForegroundColor Green
Write-Host ""

# Add each variable to Vercel
$varsToAdd = @(
    'GROQ_API_KEY',
    'OPENAI_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
)

foreach ($varName in $varsToAdd) {
    if ($envVars.ContainsKey($varName)) {
        Write-Host "Adding $varName..." -ForegroundColor Yellow
        $value = $envVars[$varName]
        
        # Create temp file with value
        $tempFile = [System.IO.Path]::GetTempFileName()
        $value | Out-File -FilePath $tempFile -NoNewline -Encoding ASCII
        
        # Add to Vercel
        Get-Content $tempFile | vercel env add $varName production
        
        # Clean up
        Remove-Item $tempFile
        
        Write-Host "  ✅ $varName added" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $varName not found in .env.local" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Environment variables setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Now redeploy with:" -ForegroundColor Cyan
Write-Host "   vercel --prod" -ForegroundColor White
Write-Host ""
