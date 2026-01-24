# 🚀 Deploy das Atualizações - Comandos Rápidos

## ⚠️ Problema Detectado

Há um arquivo de lock do Git bloqueando operações. Execute estes comandos primeiro:

## 🔧 Passo 1: Remover Lock do Git

Abra o PowerShell ou Terminal e execute:

```powershell
cd C:\Users\mathe\Desktop\dapp\arc-network-d-app
Remove-Item -Force .git\index.lock -ErrorAction SilentlyContinue
```

## 📝 Passo 2: Adicionar e Commitar Mudanças

```powershell
git add .
git commit -m "feat: add favicon preto com aTX, melhorias no wallet card, persistência de dados do leaderboard"
```

## 🌐 Passo 3: Fazer Push para GitHub

```powershell
git push origin main
```

**Nota:** Se pedir credenciais:
- Use um Personal Access Token do GitHub (não sua senha)
- Crie em: https://github.com/settings/tokens
- Permissões: `repo` (acesso completo aos repositórios)

## 🚀 Passo 4: Deploy Automático no Vercel

Após o push, o Vercel detectará automaticamente e fará o deploy:

1. Acesse: https://vercel.com
2. Vá no seu projeto
3. Aguarde o deploy automático (geralmente 2-5 minutos)
4. Verifique se o deploy foi bem-sucedido

## ✅ Mudanças Incluídas no Deploy

- ✅ Favicon preto com "aTX" em branco
- ✅ Título atualizado para "arcTX Interaction"
- ✅ Melhorias no wallet card (validação em tempo real, melhor UX)
- ✅ Persistência de dados do leaderboard (arquivo JSON)
- ✅ Traduções em inglês
- ✅ Melhorias visuais no leaderboard

## 🔍 Verificar Deploy

Após o deploy, acesse:
- **URL Vercel**: `https://dapparc.vercel.app` (ou a URL do seu projeto)
- **Domínio**: `https://arctx.xyz` (se configurado)

## 🆘 Problemas Comuns

### Erro: Git Lock
```powershell
Remove-Item -Force .git\index.lock
```

### Erro: Credenciais GitHub
- Use Personal Access Token (não senha)
- Crie em: https://github.com/settings/tokens

### Deploy não inicia automaticamente
- Verifique se o repositório está conectado no Vercel
- Vá em Settings → Git → verifique a conexão

## 📊 Status

✅ Código pronto para deploy
✅ Todas as funcionalidades implementadas
✅ Favicon atualizado
✅ Persistência de dados configurada

## 🎉 Pronto!

Após seguir estes passos, suas atualizações estarão online!
