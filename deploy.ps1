# Deploy para Vercel - Execute no PowerShell (terminal local)
# cd C:\Users\mathe\Desktop\dapp\arc-network-d-app

Remove-Item -Force .git\index.lock -ErrorAction SilentlyContinue
git add .
git commit -m "chore: config Vercel (.env.example, VERCEL-DEPLOY.md)"
git push origin main

# Depois do push: Vercel faz deploy automático se o repo estiver conectado.
# Configure as variáveis em vercel.com → projeto → Settings → Environment Variables.
# Ver VERCEL-DEPLOY.md para a lista exata.
