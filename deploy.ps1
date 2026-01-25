# Deploy - Execute no PowerShell (terminal local)
# cd C:\Users\mathe\Desktop\dapp\arc-network-d-app

Remove-Item -Force .git\index.lock -ErrorAction SilentlyContinue
git add .
git commit -m "feat: padronizar wallet card (conectado/desconectado) + deploy docs"
git push origin main
