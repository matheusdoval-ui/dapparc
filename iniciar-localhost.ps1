# Inicia o servidor local de forma limpa
Set-Location $PSScriptRoot

Write-Host "Parando processos Node..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

if (Test-Path ".next\dev\lock") {
    Write-Host "Removendo lock..." -ForegroundColor Yellow
    Remove-Item ".next\dev\lock" -Force
}

Write-Host "Iniciando servidor em http://localhost:3000..." -ForegroundColor Green
Start-Process "http://localhost:3000"
npm run dev
