# 🚀 Deploy Rápido - Passo a Passo

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
git commit -m "feat: improve leaderboard UI, add English translations, fix wallet lookup"
```

## 🌐 Passo 3: Fazer Push para GitHub

```powershell
git push origin main
```

**Nota:** Se pedir credenciais:
- Use um Personal Access Token do GitHub (não sua senha)
- Crie em: https://github.com/settings/tokens
- Permissões: `repo` (acesso completo aos repositórios)

## 🚀 Passo 4: Deploy no Vercel

### Opção A: Via Interface Web (Recomendado)

1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Clique em **"Add New Project"**
4. Selecione o repositório: `matheusdoval-ui/dapparc` (ou o nome correto)
5. **IMPORTANTE:** Selecione **Framework Preset: Next.js**
6. Configure variáveis de ambiente (opcional):
   - `ARC_RPC_URL` = `https://rpc.testnet.arc.network`
   - `NEXT_PUBLIC_CONTRACT_ADDRESS` = (deixe vazio se não tiver)
7. Clique em **"Deploy"**
8. Aguarde 2-5 minutos

### Opção B: Via CLI do Vercel

```powershell
# Instalar Vercel CLI (se ainda não tiver)
npm install -g vercel

# Fazer deploy
cd C:\Users\mathe\Desktop\dapp\arc-network-d-app
vercel

# Para produção
vercel --prod
```

## 🌍 Passo 5: Conectar Domínio arctx.xyz

1. No Vercel, vá em **Settings** → **Domains**
2. Adicione: `arctx.xyz`
3. Siga as instruções de DNS fornecidas
4. Configure no seu provedor de DNS:
   - Tipo: **CNAME**
   - Nome: `@` ou `arctx`
   - Valor: (o que o Vercel fornecer)
5. Aguarde propagação DNS (1-24h, geralmente 1-2h)

## ✅ Verificar Deploy

Após o deploy, acesse:
- URL Vercel: `https://dapparc.vercel.app` (ou a URL fornecida)
- Domínio: `https://arctx.xyz` (após DNS propagar)

## 🔍 Testar Funcionalidades

1. ✅ Conectar carteira (MetaMask/Rabby)
2. ✅ Verificar se está na ARC Testnet
3. ✅ Consultar endereço manualmente
4. ✅ Verificar leaderboard
5. ✅ Testar todas as funcionalidades

## 🆘 Problemas Comuns

### Erro: "Build Failed"
- Verifique logs no Vercel
- Certifique-se que `npm run build` funciona localmente
- Verifique se Framework Preset = **Next.js**

### Erro: "NOT_FOUND"
- ⚠️ **Framework Preset deve ser Next.js**
- Verifique `next.config.mjs`

### Git Lock
```powershell
Remove-Item -Force .git\index.lock
```

### Credenciais GitHub
- Use Personal Access Token (não senha)
- Crie em: https://github.com/settings/tokens

## 📊 Status do Projeto

✅ Código pronto para deploy
✅ Todas as funcionalidades implementadas
✅ Traduções em inglês
✅ Leaderboard funcional
✅ Melhorias de UI/UX

## 🎉 Pronto!

Após seguir estes passos, seu dApp estará online!
