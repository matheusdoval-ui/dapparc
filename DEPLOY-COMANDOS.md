# 🚀 Comandos para Deploy no Vercel

Guia rápido com todos os comandos necessários para fazer deploy do ARCtx no Vercel.

## 📋 Pré-requisitos

1. Conta no [Vercel](https://vercel.com) (crie em https://vercel.com/signup)
2. Conta no [GitHub](https://github.com) (crie em https://github.com/signup)
3. Git instalado no seu computador

## 🔧 Passo 1: Preparar o Repositório Git

### 1.1. Inicializar Git (se ainda não foi feito)

```bash
cd C:\Users\mathe\Desktop\dapp\arc-network-d-app
git init
```

### 1.2. Configurar Git (primeira vez)

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@example.com"
```

### 1.3. Adicionar todos os arquivos

```bash
git add .
```

### 1.4. Fazer o primeiro commit

```bash
git commit -m "Initial commit: ARCtx dApp ready for deployment"
```

## 🌐 Passo 2: Criar Repositório no GitHub

### 2.1. Criar repositório no GitHub

1. Acesse https://github.com/new
2. Nome do repositório: `arc-network-d-app` (ou outro nome)
3. **NÃO marque** "Add a README file"
4. Clique em **"Create repository"**

### 2.2. Conectar repositório local ao GitHub

```bash
# Adicione o repositório remoto (substitua USERNAME pelo seu usuário GitHub)
git remote add origin https://github.com/USERNAME/arc-network-d-app.git

# Renomeie branch para main (se necessário)
git branch -M main

# Envie os arquivos para o GitHub
git push -u origin main
```

**Nota:** Você precisará fazer login no GitHub quando executar `git push`. Use um Personal Access Token se solicitado.

## 🚀 Passo 3: Deploy no Vercel

### 3.1. Acessar Vercel

1. Acesse https://vercel.com
2. Faça login com sua conta GitHub

### 3.2. Importar Projeto

1. Clique em **"Add New Project"**
2. Selecione o repositório `arc-network-d-app`
3. Clique em **"Import"**

### 3.3. Configurar Build

Na tela de configuração:

- **Framework Preset**: Selecione **Next.js** ⚠️ **IMPORTANTE!**
- **Root Directory**: Deixe vazio
- **Build Command**: `npm run build` (já vem preenchido)
- **Output Directory**: `.next` (já vem preenchido)
- **Install Command**: `npm install` (já vem preenchido)

### 3.4. Adicionar Variáveis de Ambiente (Opcional)

Clique em **"Environment Variables"** e adicione:

```
Name: ARC_RPC_URL
Value: https://rpc.testnet.arc.network
Environments: Production, Preview, Development
```

```
Name: NEXT_PUBLIC_CONTRACT_ADDRESS
Value: (deixe vazio se não tiver contrato deployado)
Environments: Production, Preview, Development
```

### 3.5. Fazer Deploy

1. Clique em **"Deploy"**
2. Aguarde 2-5 minutos para o build completar
3. Você receberá uma URL como: `arc-network-d-app.vercel.app`

## 🌍 Passo 4: Conectar Domínio arctx.xyz

### 4.1. No Vercel

1. Vá em **Settings** → **Domains**
2. Adicione o domínio: `arctx.xyz`
3. O Vercel mostrará instruções de DNS

### 4.2. Configurar DNS

No seu provedor de DNS (onde você comprou o domínio):

1. Adicione um registro **CNAME**:
   - **Nome**: `@` ou `arctx`
   - **Valor**: O endereço fornecido pelo Vercel (ex: `cname.vercel-dns.com`)
   - **TTL**: 3600 (ou padrão)

2. Aguarde a propagação DNS (1-24 horas, geralmente 1-2 horas)

### 4.3. Verificar Status

No Vercel, o domínio deve mostrar **"Valid Configuration"** quando estiver pronto.

## ✅ Passo 5: Verificar Deploy

Acesse:
- **URL Vercel**: `https://arc-network-d-app.vercel.app` (ou a URL fornecida)
- **Domínio oficial**: `https://arctx.xyz` (após DNS propagar)

## 🔄 Atualizações Futuras

Para atualizar o site após fazer mudanças:

```bash
# 1. Adicionar mudanças
git add .

# 2. Fazer commit
git commit -m "Descrição das mudanças"

# 3. Enviar para GitHub
git push origin main
```

O Vercel detectará automaticamente e fará um novo deploy (geralmente 2-5 minutos).

## 📝 Comandos Resumidos (Copy & Paste)

```bash
# 1. Inicializar Git
cd C:\Users\mathe\Desktop\dapp\arc-network-d-app
git init
git add .
git commit -m "Initial commit: ARCtx dApp"

# 2. Conectar ao GitHub (substitua USERNAME)
git remote add origin https://github.com/USERNAME/arc-network-d-app.git
git branch -M main
git push -u origin main

# 3. Depois, acesse vercel.com e importe o repositório
# 4. Configure o domínio arctx.xyz no Vercel
```

## 🆘 Troubleshooting

### Erro: "Repository not found"
- Verifique se o repositório existe no GitHub
- Verifique se você tem permissão de acesso

### Erro: "Build Failed" no Vercel
- Verifique os logs de build no Vercel
- Certifique-se de que `npm run build` funciona localmente

### Erro: "NOT_FOUND" após deploy
- ⚠️ **Certifique-se de que o Framework Preset está como Next.js**
- Verifique se o `next.config.mjs` está correto

### Domínio não funciona
- Aguarde a propagação DNS (pode levar até 24h)
- Verifique se o registro DNS está correto no seu provedor

## 🎉 Pronto!

Após seguir estes passos, seu dApp estará disponível em:
- **https://arctx.xyz** (domínio oficial)
- **URL do Vercel** (temporária até DNS propagar)
