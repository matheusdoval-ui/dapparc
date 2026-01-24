# Script para atualizar GitHub com as mudanças
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Atualizando GitHub com as mudanças..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Navegar para o diretório do script
Set-Location $PSScriptRoot

Write-Host "[1/4] Verificando status do Git..." -ForegroundColor Yellow
git status
Write-Host ""

Write-Host "[2/4] Adicionando arquivos modificados..." -ForegroundColor Yellow
git add app/page.tsx
Write-Host ""

Write-Host "[3/4] Fazendo commit das mudanças..." -ForegroundColor Yellow
git commit -m "Atualizar links do cabeçalho: Docs e Explorer"
Write-Host ""

Write-Host "[4/4] Enviando para o GitHub..." -ForegroundColor Yellow
git push
Write-Host ""

Write-Host "================================================" -ForegroundColor Green
Write-Host "Atualização concluída!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
