@echo off
echo ================================================
echo Fazendo commit das melhorias no GitHub...
echo ================================================
echo.

cd /d "%~dp0"

echo [1/5] Verificando status do Git...
git status
echo.

echo [2/5] Adicionando arquivos modificados...
git add app/api/wallet-stats/route.ts
git add components/wallet-card.tsx
echo.

echo [3/5] Fazendo commit das mudanças...
git commit -m "Adicionar melhorias: saldo USDC, grafico de crescimento e refresh manual

- Adicionar saldo USDC na carteira
- Adicionar timestamp de ultima atualizacao
- Implementar grafico de crescimento (30 dias) com Recharts
- Adicionar botao de refresh manual para estatisticas
- Melhorar feedback visual e UX"
echo.

echo [4/5] Enviando para o GitHub...
git push
echo.

echo [5/5] Verificando status final...
git status
echo.

echo ================================================
echo Commit concluido!
echo ================================================
echo.
echo Verifique em: https://github.com/matheusdoval-ui/dapparc
pause
