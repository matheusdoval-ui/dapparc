# Comandos para Deploy no CMD (Command Prompt)

## 1. Navegar até a pasta do projeto
```cmd
cd C:\Users\mathe\Desktop\dapp\arc-network-d-app
```

## 2. Verificar status do Git
```cmd
git status
```

## 3. Remover lock file (se houver erro de permissão)
```cmd
del .git\index.lock
```

## 4. Adicionar todos os arquivos modificados
```cmd
git add .
```

## 5. Fazer commit das mudanças
```cmd
git commit -m "feat: adiciona sistema de pagamento para leaderboard - requer 1 USDC para aparecer no ranking"
```

## 6. Fazer push para o repositório remoto
```cmd
git push origin main
```

## Comandos em sequência (copiar e colar tudo de uma vez)
```cmd
cd C:\Users\mathe\Desktop\dapp\arc-network-d-app
del .git\index.lock 2>nul
git add .
git commit -m "feat: adiciona sistema de pagamento para leaderboard - requer 1 USDC para aparecer no ranking"
git push origin main
```

## Notas:
- Se pedir autenticação no `git push`, você precisará usar um Personal Access Token do GitHub
- O deploy na Vercel acontece automaticamente após o push
- Aguarde alguns minutos para o deploy completar
