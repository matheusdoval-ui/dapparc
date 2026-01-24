@echo off
echo ================================================
echo Atualizando GitHub com as mudanças...
echo ================================================
echo.

cd /d "%~dp0"

echo [1/4] Verificando status do Git...
git status
echo.

echo [2/4] Adicionando arquivos modificados...
git add app/page.tsx
echo.

echo [3/4] Fazendo commit das mudanças...
git commit -m "Atualizar links do cabeçalho: Docs e Explorer"
echo.

echo [4/4] Enviando para o GitHub...
git push
echo.

echo ================================================
echo Atualização concluída!
echo ================================================
pause
