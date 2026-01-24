# 🗄️ Configuração do Vercel KV para Persistência do Leaderboard

## 📋 O que é Vercel KV?

Vercel KV é um banco de dados Redis gerenciado pela Vercel, perfeito para armazenar dados do leaderboard de forma persistente em ambientes serverless.

## 🚀 Passo 1: Criar Vercel KV no Dashboard

1. Acesse o [Dashboard da Vercel](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Storage** → **Create Database**
4. Selecione **KV** (Redis)
5. Escolha um nome para o banco (ex: `leaderboard-kv`)
6. Selecione a região mais próxima dos seus usuários
7. Clique em **Create**

## ⚙️ Passo 2: Configurar Variáveis de Ambiente

Após criar o KV, o Vercel automaticamente adiciona as seguintes variáveis de ambiente:

- `KV_REST_API_URL` - URL da API REST do KV
- `KV_REST_API_TOKEN` - Token de autenticação

### Verificar Variáveis

1. No dashboard do Vercel, vá em **Settings** → **Environment Variables**
2. Verifique se as variáveis `KV_REST_API_URL` e `KV_REST_API_TOKEN` estão presentes
3. Elas devem estar disponíveis para **Production**, **Preview** e **Development**

## 🔄 Passo 3: Redeploy

Após configurar o KV:

1. Vá em **Deployments**
2. Clique nos três pontos (⋯) do último deploy
3. Selecione **Redeploy**
4. Aguarde o deploy completar

## ✅ Verificação

Após o redeploy, o sistema automaticamente:

1. **Carregará dados do KV** ao iniciar (se houver dados salvos)
2. **Salvará dados no KV** sempre que uma carteira for adicionada/atualizada
3. **Fará fallback para arquivo local** se KV não estiver disponível (desenvolvimento local)

## 📊 Como Funciona

### Prioridade de Carregamento:
1. **Vercel KV** (produção) - Fonte principal
2. **Arquivo local** (desenvolvimento) - Fallback
3. **globalThis** (memória) - Cache temporário

### Prioridade de Salvamento:
1. **Vercel KV** (produção) - Salva primeiro
2. **Arquivo local** (desenvolvimento) - Fallback se KV não disponível
3. **globalThis** (memória) - Sempre atualizado

## 🔧 Desenvolvimento Local

Para desenvolvimento local, você pode:

1. **Usar arquivo local** (padrão) - Funciona sem configuração
2. **Usar Vercel KV localmente** - Adicione as variáveis ao `.env.local`:
   ```
   KV_REST_API_URL=https://...
   KV_REST_API_TOKEN=...
   ```

## 💰 Custos

Vercel KV tem um plano gratuito generoso:
- **Plano Hobby**: 256 MB de armazenamento, 30.000 comandos/dia
- **Plano Pro**: Mais armazenamento e comandos

Para o leaderboard, o plano gratuito é mais que suficiente.

## 🐛 Troubleshooting

### Dados não estão sendo salvos

1. Verifique se as variáveis `KV_REST_API_URL` e `KV_REST_API_TOKEN` estão configuradas
2. Verifique os logs do Vercel para erros
3. Certifique-se de que fez redeploy após configurar o KV

### Erro: "KV not available"

- Isso é normal se as variáveis não estiverem configuradas
- O sistema fará fallback para arquivo local automaticamente

### Dados antigos não aparecem

- Se você tinha dados no arquivo local, eles serão migrados automaticamente para KV na primeira vez
- Verifique os logs para confirmação da migração

## 📝 Notas Importantes

- ✅ Dados são **persistentes** entre reinicializações
- ✅ Funciona em **ambientes serverless** (Vercel)
- ✅ **Fallback automático** para arquivo local se KV não disponível
- ✅ **Migração automática** de dados do arquivo para KV
