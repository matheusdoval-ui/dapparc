# 🚀 Deploy das Alterações

## ✅ Alterações Realizadas

### 1. **Componente Wallet Card** (`components/wallet-card.tsx`)
- ✅ Removida a moldura (bordas e elementos decorativos)
- ✅ Aumentado proporcionalmente todos os elementos:
  - Card: `max-w-md` → `max-w-2xl`, altura `420px` → `500px`
  - Logo: `h-12 w-12` → `h-20 w-20`
  - Títulos: `text-lg` → `text-2xl`
  - Valores: `text-2xl` → `text-4xl`
  - Ícones, espaçamentos e padding aumentados
  - Gráfico: altura `h-24` → `h-32`
- ✅ Animações melhoradas (glow effect mais forte)

### 2. **Contrato ArcProofOfActivity** (`contracts/ArcProofOfActivity.sol`)
- ✅ Corrigido erro de compilação: `proveActivity` de `external` para `public`

### 3. **Configuração Hardhat** (`hardhat.config.js`)
- ✅ Configuração mantida para deploy do contrato Leaderboard

## 📋 Comandos para Deploy

### Opção 1: Deploy via Git (Recomendado para Vercel)

Execute no terminal local (PowerShell):

```powershell
# Remover lock se existir
Remove-Item -Force .git\index.lock -ErrorAction SilentlyContinue

# Adicionar arquivos
git add .

# Commit
git commit -m "feat: remover moldura e aumentar informações do wallet card + corrigir compilação do contrato"

# Push
git push origin main
```

### Opção 2: Deploy Manual no Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** → **Git**
4. Clique em **Redeploy** ou aguarde o deploy automático após o push

## ⚙️ Variáveis de Ambiente no Vercel

Certifique-se de que estas variáveis estão configuradas:

```env
NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS=0x... (endereço do contrato Leaderboard)
REGISTRY_CONTRACT_ADDRESS=0x... (mesmo endereço)
PRIVATE_KEY=0x231c6f6e09937af4ffa4a47cec3bc10c3210ad4486b8e98131c0f2aeacc61d8c
ARC_RPC_URL=https://rpc.testnet.arc.network
NEXT_PUBLIC_BUNDLER_URL=...
NEXT_PUBLIC_PAYMASTER_URL=...
NEXT_PUBLIC_ENTRY_POINT_ADDRESS=...
```

## ✅ Após o Deploy

1. Verifique se o site está funcionando
2. Teste a conexão da carteira
3. Confirme que o card está sem moldura e com informações maiores
4. Verifique se as animações estão mais visíveis

---

**Execute os comandos Git no terminal local para fazer o deploy!** 🚀
