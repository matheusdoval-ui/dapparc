@echo off
cd /d "%~dp0"

echo Parando Node...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Iniciando servidor...
start http://localhost:3000/teste.html
npm run dev

pause
