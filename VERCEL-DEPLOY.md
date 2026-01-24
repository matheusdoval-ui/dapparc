# 🚀 Guia de Deploy no Vercel

Este guia detalha como fazer o deploy do ARCtx no Vercel e conectar ao domínio `arctx.xyz`.

## 📋 Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. Repositório no GitHub com o código do projeto
3. Acesso ao domínio `arctx.xyz` (configuração DNS)

## 🔧 Passo 1: Preparar o Repositório

1. Certifique-se de que o código está no GitHub:
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

2. Verifique se o `.gitignore` está configurado corretamente (não commitar `.env.local`)

## 🌐 Passo 2: Criar Projeto no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login

2. Clique em **"Add New Project"**

3. **Importe o repositório** do GitHub:
   - Selecione o repositório `arc-network-d-app`
   - Clique em **"Import"**

## ⚙️ Passo 3: Configurar Build

Na tela de configuração do projeto:

1. **Framework Preset**: Selecione **Next.js** ⚠️ IMPORTANTE!

2. **Root Directory**: Deixe vazio (ou `./` se necessário)

3. **Build Command**: `npm run build`

4. **Output Directory**: `.next` (padrão do Next.js)

5. **Install Command**: `npm install` (padrão)

## 🔐 Passo 4: Variáveis de Ambiente

Adicione as seguintes variáveis de ambiente no Vercel:

1. Clique em **"Environment Variables"**

2. Adicione as variáveis:

   **Opcional - ARC RPC URL:**
   ```
   Name: ARC_RPC_URL
   Value: https://rpc.testnet.arc.network
   Environments: Production, Preview, Development
   ```

   **Opcional - Contract Address:**
   ```
   Name: NEXT_PUBLIC_CONTRACT_ADDRESS
   Value: 0x... (endereço do contrato deployado)
   Environments: Production, Preview, Development
   ```

   > **Nota:** Se você não tiver um contrato deployado, deixe `NEXT_PUBLIC_CONTRACT_ADDRESS` vazio. O dApp funcionará usando self-transfer.

## 🚀 Passo 5: Fazer Deploy

1. Clique em **"Deploy"**

2. Aguarde o build completar (geralmente 2-5 minutos)

3. Verifique se o deploy foi bem-sucedido

4. Acesse a URL fornecida pelo Vercel (ex: `arc-network-d-app.vercel.app`)

## 🌍 Passo 6: Conectar Domínio

1. No dashboard do projeto, vá em **Settings** → **Domains**

2. Adicione o domínio `arctx.xyz`

3. O Vercel fornecerá instruções de DNS:
   - Tipo: **CNAME** ou **A Record**
   - Nome: `@` ou `arctx`
   - Valor: O endereço fornecido pelo Vercel

4. Configure no seu provedor de DNS:
   - Acesse o painel do seu registrador de domínio
   - Adicione o registro CNAME/A conforme instruções do Vercel
   - Aguarde a propagação DNS (pode levar até 24h, geralmente 1-2h)

5. Verifique o status no Vercel - deve mostrar "Valid Configuration" quando estiver pronto

## ✅ Passo 7: Verificar Deploy

1. Acesse `https://arctx.xyz`

2. Teste a aplicação:
   - Conecte uma carteira (MetaMask/Rabby)
   - Verifique se está na ARC Testnet
   - Teste a conexão e visualização de estatísticas

3. Verifique os logs no Vercel se houver problemas

## 🔄 Atualizações Futuras

Para atualizar o site:

1. Faça push das mudanças para o GitHub:
```bash
git add .
git commit -m "Update dApp"
git push origin main
```

2. O Vercel detectará automaticamente e fará um novo deploy

3. Aguarde o build completar (geralmente 2-5 minutos)

## 🆘 Troubleshooting

### Erro: "Build Failed"

- Verifique os logs de build no Vercel
- Certifique-se de que `npm run build` funciona localmente
- Verifique se todas as dependências estão no `package.json`

### Erro: "NOT_FOUND" após deploy

- ⚠️ **Certifique-se de que o Framework Preset está como Next.js**
- Verifique se o `next.config.mjs` está correto
- Verifique os logs de build

### Domínio não funciona

- Aguarde a propagação DNS (pode levar até 24h)
- Verifique se o registro DNS está correto
- Use ferramentas como `dig` ou `nslookup` para verificar

### Variáveis de ambiente não funcionam

- Certifique-se de que as variáveis começam com `NEXT_PUBLIC_` para serem expostas ao cliente
- Faça um novo deploy após adicionar variáveis
- Verifique se as variáveis estão configuradas para o ambiente correto (Production)

## 📚 Recursos

- [Documentação do Vercel](https://vercel.com/docs)
- [Next.js no Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Configuração de Domínios](https://vercel.com/docs/concepts/projects/domains)

## 🎉 Pronto!

Seu dApp ARCtx está agora disponível em `https://arctx.xyz`!
