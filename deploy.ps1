# Deploy para Vercel - Execute no PowerShell (terminal local)
# Pasta: C:\Users\mathe\Desktop\dapp\arc-network-d-app
# Ou na pasta do worktree onde estiver trabalhando

Remove-Item -Force .git\index.lock -ErrorAction SilentlyContinue
git add .
git commit -m "chore: deploy Vercel - leaderboard ArcLeaderboard, fetchLeaderboard"
git push origin main

# Depois do push: Vercel faz deploy automático se o repo estiver conectado.
# Configure as variáveis em vercel.com → projeto → Settings → Environment Variables.
# Ver VERCEL-DEPLOY.md para a lista exata.

# Alternativa via CLI (se já logado):
# npx vercel login   # primeiro login
# npx vercel --prod --yes
