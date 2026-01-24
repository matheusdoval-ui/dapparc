# 🗄️ Configuração do Redis (Upstash) para Persistência do Leaderboard

## 📋 O que é necessário?

Para persistência permanente do leaderboard, você precisa de um banco de dados Redis. A Vercel recomenda usar **Upstash Redis** através do Vercel Marketplace.

> **Nota**: Vercel KV foi deprecated. Use Upstash Redis para novos projetos.

## 🚀 Passo 1: Criar Upstash Redis no Dashboard

1. Acesse o [Dashboard da Vercel](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Storage** → **Create Database** ou **Integrations** → **Browse Marketplace**
4. Procure por **Upstash Redis** ou **Redis**
5. Clique em **Add Integration** ou **Create Database**
6. Escolha um nome para o banco (ex: `leaderboard-redis`)
7. Selecione a região mais próxima dos seus usuários
8. Clique em **Create** ou **Add**

## ⚙️ Passo 2: Configurar Variáveis de Ambiente

Após criar o Redis, o Vercel automaticamente adiciona as variáveis de ambiente:

### Para Upstash Redis (Recomendado):
- `UPSTASH_REDIS_REST_URL` - URL da API REST do Redis
- `UPSTASH_REDIS_REST_TOKEN` - Token de autenticação

### Para Vercel KV (Legacy - ainda funciona):
- `KV_REST_API_URL` - URL da API REST do KV
- `KV_REST_API_TOKEN` - Token de autenticação

### Verificar Variáveis

1. No dashboard do Vercel, vá em **Settings** → **Environment Variables**
2. Verifique se as variáveis estão presentes (Upstash ou KV)
3. Elas devem estar disponíveis para **Production**, **Preview** e **Development**

## 🔄 Passo 3: Redeploy

Após configurar o Redis:

1. Vá em **Deployments**
2. Clique nos três pontos (⋯) do último deploy
3. Selecione **Redeploy**
4. Aguarde o deploy completar

> **Nota**: Se você estava usando Vercel KV antigo, ele foi migrado automaticamente para Upstash Redis. As variáveis antigas (`KV_REST_API_URL`) ainda funcionam, mas novas integrações devem usar Upstash Redis.

## ✅ Verificação

Após o redeploy, o sistema automaticamente:

1. **Carregará dados do Redis** ao iniciar (se houver dados salvos)
2. **Salvará dados no Redis** sempre que uma carteira for adicionada/atualizada
3. **Fará fallback para arquivo local** se Redis não estiver disponível (desenvolvimento local)

## 📊 Como Funciona

### Prioridade de Carregamento:
1. **Upstash Redis / Vercel KV** (produção) - Fonte principal
2. **Arquivo local** (desenvolvimento) - Fallback
3. **globalThis** (memória) - Cache temporário

### Prioridade de Salvamento:
1. **Upstash Redis / Vercel KV** (produção) - Salva primeiro
2. **Arquivo local** (desenvolvimento) - Fallback se Redis não disponível
3. **globalThis** (memória) - Sempre atualizado

## 🔧 Desenvolvimento Local

Para desenvolvimento local, você pode:

1. **Usar arquivo local** (padrão) - Funciona sem configuração
2. **Usar Redis localmente** - Adicione as variáveis ao `.env.local`:
   ```
   # Para Upstash Redis (recomendado)
   UPSTASH_REDIS_REST_URL=https://...
   UPSTASH_REDIS_REST_TOKEN=...
   
   # Ou para Vercel KV (legacy)
   KV_REST_API_URL=https://...
   KV_REST_API_TOKEN=...
   ```

## 💰 Custos

Upstash Redis tem um plano gratuito generoso:
- **Plano Free**: 10.000 comandos/dia, 256 MB de armazenamento
- **Plano Pay-as-you-go**: Escalável conforme uso

Para o leaderboard, o plano gratuito é mais que suficiente.

## 🐛 Troubleshooting

### Dados não estão sendo salvos

1. Verifique se as variáveis estão configuradas (`UPSTASH_REDIS_REST_URL` ou `KV_REST_API_URL`)
2. Verifique os logs do Vercel para erros
3. Certifique-se de que fez redeploy após configurar o Redis

### Erro: "KV/Redis not available"

- Isso é normal se as variáveis não estiverem configuradas
- O sistema fará fallback para arquivo local automaticamente

### Dados antigos não aparecem

- Se você tinha dados no arquivo local, eles serão migrados automaticamente para Redis na primeira vez
- Verifique os logs para confirmação da migração

## 📝 Notas Importantes

- ✅ Dados são **persistentes** entre reinicializações
- ✅ Funciona em **ambientes serverless** (Vercel)
- ✅ **Fallback automático** para arquivo local se KV não disponível
- ✅ **Migração automática** de dados do arquivo para KV
