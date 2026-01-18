# 🔍 Guia Completo: Erro NOT_FOUND no Vercel

## 📋 Sumário

Este documento explica o erro `NOT_FOUND` (404) que ocorre ao fazer deploy de aplicações Next.js no Vercel, incluindo causas, soluções, conceitos fundamentais e como evitar problemas similares no futuro.

---

## 1️⃣ SUGESTÃO DE CORREÇÃO

### ✅ Soluções Imediatas (Ordem de Prioridade)

#### **Solução 1: Verificar Framework Preset no Vercel** (Mais Comum)

1. Acesse o [Dashboard do Vercel](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** → **General**
4. Verifique o campo **"Framework Preset"**
5. Se não estiver como **"Next.js"**, altere e salve
6. Faça um novo deploy

**Por quê funciona?** O Vercel precisa saber que está lidando com Next.js para aplicar as regras de roteamento corretas do App Router.

#### **Solução 2: Verificar Diretório Raiz do Projeto**

1. No Dashboard do Vercel → **Settings** → **General**
2. Verifique o campo **"Root Directory"**
3. Se seu projeto Next.js está na raiz do repositório, deixe vazio
4. Se está em um subdiretório (ex: `app/` ou `frontend/`), configure o caminho correto
5. Faça um novo deploy

#### **Solução 3: Criar arquivo `vercel.json` (Se necessário)**

Crie um arquivo `vercel.json` na raiz do projeto com:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

**⚠️ Importante:** Geralmente isso NÃO é necessário para projetos Next.js padrão, pois o Vercel detecta automaticamente. Use apenas se outras soluções não funcionarem.

#### **Solução 4: Verificar Estrutura de Arquivos**

Confirme que sua estrutura está assim:

```
projeto/
├── app/
│   ├── layout.tsx          ✅ OBRIGATÓRIO
│   ├── page.tsx            ✅ OBRIGATÓRIO para rota "/"
│   ├── api/
│   │   ├── register-query/
│   │   │   └── route.ts    ✅ OBRIGATÓRIO para "/api/register-query"
│   │   └── wallet-stats/
│   │       └── route.ts    ✅ OBRIGATÓRIO para "/api/wallet-stats"
│   └── globals.css
├── next.config.mjs         ✅ OBRIGATÓRIO
├── package.json            ✅ OBRIGATÓRIO
└── tsconfig.json           ✅ OBRIGATÓRIO
```

---

## 2️⃣ EXPLICAÇÃO DA CAUSA RAIZ

### O Que Estava Acontecendo vs. O Que Deveria Acontecer

#### ❌ **O Que Estava Acontecendo (Errado):**

1. **Vercel não reconhecia Next.js**
   - Sem o Framework Preset correto, o Vercel tratava o projeto como um site estático genérico
   - Rotas do App Router (`app/page.tsx`, `app/api/*/route.ts`) não eram processadas corretamente
   - O Vercel tentava servir arquivos estáticos diretamente, em vez de usar o sistema de roteamento do Next.js

2. **Roteamento quebrado**
   - Requisições para `/` ou `/api/wallet-stats` eram interceptadas pelo sistema de arquivos estáticos
   - Como não existem arquivos físicos nesses caminhos, o Vercel retornava 404 (NOT_FOUND)
   - As funções serverless (API routes) não eram geradas porque o framework não foi detectado

#### ✅ **O Que Deveria Acontecer (Correto):**

1. **Next.js detectado automaticamente**
   - O Vercel identifica `package.json` com dependência `next`
   - Configura o build system corretamente
   - Processa o App Router (`app/` directory) conforme a convenção do Next.js

2. **Roteamento funcionando**
   - `/` → renderiza `app/page.tsx` através do servidor Next.js
   - `/api/wallet-stats` → executa `app/api/wallet-stats/route.ts` como função serverless
   - Arquivos estáticos em `public/` → servidos diretamente pelo CDN

### Condições que Desencadearam o Erro

1. **Deploy sem configuração explícita**
   - Primeiro deploy do projeto
   - Framework Preset não foi definido manualmente
   - Vercel não conseguiu detectar automaticamente (pode acontecer em casos específicos)

2. **Mudança de estrutura**
   - Migração de Pages Router para App Router
   - Mudança no diretório raiz do projeto
   - Atualização de versão do Next.js que muda o comportamento de detecção

3. **Configuração de monorepo**
   - Projeto dentro de monorepo (ex: turborepo, yarn workspaces)
   - Diretório raiz configurado incorretamente

### Conceito Errado ou Omissão

**Conceito errado:** "Se o build passou, o deploy deve funcionar automaticamente"

**Realidade:** 
- Build passar não garante que o Vercel esteja configurado corretamente
- O Vercel precisa saber **como** servir a aplicação, não apenas que ela compila
- Next.js tem convenções específicas (App Router vs Pages Router) que precisam ser reconhecidas

**Omissão comum:** 
- Assumir que o Vercel sempre detecta Next.js automaticamente (geralmente funciona, mas não é garantido)
- Não verificar as configurações do projeto no Dashboard após o primeiro deploy

---

## 3️⃣ ENSINO DO CONCEITO

### Por Que Este Erro Existe e O Que Ele Protege

#### **Proteção contra configurações incorretas**

O erro `NOT_FOUND` protege você de:
1. **Deploys silenciosamente quebrados** - É melhor receber um 404 claro do que servir conteúdo errado
2. **Rotas que não existem** - Se você tenta acessar `/rota-inexistente`, o servidor deve retornar 404, não tentar servir algo aleatório
3. **Recursos não encontrados** - Arquivos estáticos referenciados mas não presentes resultam em 404 (ex: imagens quebradas)

#### **Modelo Mental Correto: Camadas de Roteamento**

No Next.js com Vercel, existem **3 camadas** de roteamento:

```
1. CDN Edge (Arquivos Estáticos)
   ↓ Se não encontrar
   
2. Vercel Functions (API Routes/Server Actions)
   ↓ Se não encontrar
   
3. Next.js Server (Pages/App Router)
   ↓ Se não encontrar
   
   404 NOT_FOUND
```

**O que acontece no seu caso:**

1. ✅ **CDN Edge** procura por `app/page.tsx` como arquivo estático → Não encontra
2. ✅ **Vercel Functions** procura por função serverless para `/` → Não encontra (porque Next.js não foi detectado)
3. ❌ **Next.js Server** deveria processar `app/page.tsx`, mas não está ativo → 404

### Como Isso Se Encaixa no Framework/Linguagem

#### **Next.js App Router: Sistema de Arquivos = Roteamento**

No App Router, o Next.js usa **convenções de arquivos** para definir rotas:

| Arquivo | Rota | Tipo |
|---------|------|------|
| `app/page.tsx` | `/` | Página |
| `app/about/page.tsx` | `/about` | Página |
| `app/api/users/route.ts` | `/api/users` | API Route |
| `app/layout.tsx` | (Todos os layouts) | Layout |

**Princípio fundamental:** "A estrutura de pastas define as rotas"

#### **Vercel: Detecção de Framework**

O Vercel usa heurísticas para detectar o framework:

1. **Análise de `package.json`**
   ```json
   {
     "dependencies": {
       "next": "^16.0.10"  // ✅ Detecta Next.js
     }
   }
   ```

2. **Presença de arquivos de configuração**
   - `next.config.mjs` → ✅ Next.js
   - `vercel.json` → Pode sobrescrever detecção automática

3. **Estrutura de diretórios**
   - `app/` → App Router (Next.js 13+)
   - `pages/` → Pages Router (Next.js 12 e anterior)

**Quando a detecção falha:**
- Build tools personalizados
- Configurações não padronizadas
- Primeiro deploy sem histórico

---

## 4️⃣ SINAIS DE ALERTA

### O Que Procurar Para Evitar Este Erro Novamente

#### **🔴 Sinais de Alerta (Red Flags)**

1. **Deploy bem-sucedido, mas 404 em todas as rotas**
   ```
   ✓ Build completed successfully
   ✗ Acessando site → 404 NOT_FOUND
   ```
   **Ação:** Verificar Framework Preset imediatamente

2. **Logs do Vercel mostram "Static files only"**
   ```
   [Vercel Logs]
   Serving static files from /out
   ```
   **Ação:** Isso indica que Next.js não foi detectado (Next.js serve de `.next`, não `/out`)

3. **Rotas de API retornam 404, mas existem**
   ```
   GET /api/wallet-stats → 404
   Mas arquivo existe: app/api/wallet-stats/route.ts
   ```
   **Ação:** Verificar se `route.ts` está no caminho correto e se o método exportado está correto (`GET`, `POST`, etc.)

4. **Build passa localmente, falha no Vercel**
   ```bash
   npm run build  # ✅ Sucesso local
   vercel deploy  # ❌ Erro ou 404 no deploy
   ```
   **Ação:** Verificar diferenças de configuração entre ambiente local e Vercel

#### **🟡 Padrões Suspeitos (Yellow Flags)**

1. **Primeiro deploy após migração de framework**
   - Migrou de Create React App para Next.js
   - Migrou de Pages Router para App Router
   - **Prevenção:** Verificar configurações no Dashboard após migração

2. **Monorepo com múltiplos projetos**
   - Projeto está dentro de `packages/frontend/`
   - **Prevenção:** Configurar "Root Directory" corretamente

3. **Arquivos `page.tsx` ou `route.ts` renomeados incorretamente**
   ```typescript
   // ❌ ERRADO
   app/home.tsx          // Não funciona como rota
   app/api/users/api.ts  // Não funciona
   
   // ✅ CORRETO
   app/home/page.tsx           // Rota: /home
   app/api/users/route.ts      // Rota: /api/users
   ```

#### **🔵 Code Smells Relacionados**

1. **Importação de componentes que não existem**
   ```typescript
   // Se o build passar mas o arquivo não existir em runtime
   import { Component } from '@/components/inexistente'
   ```
   **Resultado:** Erro em runtime, possivelmente 404 se for uma rota dinâmica

2. **Rotas dinâmicas mal estruturadas**
   ```typescript
   // ❌ ERRADO
   app/users/[id]/page.tsx  // Falta pasta "users"
   
   // ✅ CORRETO
   app/users/[id]/page.tsx  // Estrutura completa
   ```

3. **API Routes sem exportações corretas**
   ```typescript
   // ❌ ERRADO - não exporta métodos HTTP
   export default function handler() { }
   
   // ✅ CORRETO
   export async function GET() { }
   export async function POST() { }
   ```

---

## 5️⃣ ALTERNATIVAS E TRADE-OFFS

### Abordagens Alternativas para Deploy

#### **Opção 1: Vercel (Recomendado para Next.js)**

✅ **Vantagens:**
- Integração nativa com Next.js
- Zero configuração na maioria dos casos
- Edge Functions, ISR, otimizações automáticas
- Deploy automático via Git

❌ **Desvantagens:**
- Vendor lock-in (específico do Vercel)
- Pode ter custos em uso intenso
- Menos controle sobre infraestrutura

**Quando usar:** Projetos Next.js que se beneficiam de features do Vercel (Edge Functions, ISR, Analytics)

---

#### **Opção 2: Self-hosted (VPS/Docker)**

✅ **Vantagens:**
- Controle total sobre infraestrutura
- Sem vendor lock-in
- Custo previsível para tráfego alto

❌ **Desvantagens:**
- Configuração manual complexa
- Necessita gerenciar servidor, SSL, CDN separadamente
- Sem otimizações automáticas do Vercel

**Exemplo de configuração:**
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

**Quando usar:** Quando precisa de controle total ou tem restrições de compliance

---

#### **Opção 3: Outras Plataformas (Netlify, Railway, Render)**

**Netlify:**
- Similar ao Vercel
- Boa integração com Next.js
- Pode precisar de configuração em `netlify.toml`

**Railway/Render:**
- Mais flexível, menos otimizado para Next.js
- Funciona bem, mas requer mais configuração
- Boa para projetos que não são Next.js puro

**Quando usar:** Se já tem experiência com essas plataformas ou necessidades específicas

---

#### **Opção 4: Build Estático (Next.js Static Export)**

Se você não precisa de funcionalidades server-side:

```javascript
// next.config.mjs
export default {
  output: 'export',  // Gera site estático
}
```

✅ **Vantagens:**
- Pode hospedar em qualquer CDN (Cloudflare, S3, etc.)
- Sem servidor necessário
- Extremamente rápido

❌ **Desvantagens:**
- Sem API Routes
- Sem Server Components dinâmicos
- Sem ISR, SSR

**Quando usar:** Sites completamente estáticos, blogs, landing pages

---

### Comparação Rápida

| Plataforma | Configuração | Custo | Performance | Melhor Para |
|------------|--------------|-------|-------------|-------------|
| **Vercel** | ⭐⭐⭐⭐⭐ Mínima | Variável | ⭐⭐⭐⭐⭐ Excelente | Next.js apps |
| **Self-hosted** | ⭐⭐ Média-Alta | Fixo | ⭐⭐⭐⭐ Boa | Controle total |
| **Netlify** | ⭐⭐⭐⭐ Baixa | Variável | ⭐⭐⭐⭐ Muito Boa | JAMstack |
| **Railway** | ⭐⭐⭐ Média | Variável | ⭐⭐⭐ Boa | Flexibilidade |
| **Static Export** | ⭐⭐⭐⭐ Baixa | Muito Baixo | ⭐⭐⭐⭐⭐ Excelente | Sites estáticos |

---

## 📚 CHECKLIST DE VERIFICAÇÃO

Use este checklist ao fazer deploy no Vercel:

- [ ] Framework Preset está configurado como "Next.js"
- [ ] Diretório raiz está correto (vazio se projeto na raiz)
- [ ] `package.json` contém `"next"` nas dependências
- [ ] `next.config.mjs` existe e está válido
- [ ] Estrutura `app/` está correta:
  - [ ] `app/layout.tsx` existe
  - [ ] `app/page.tsx` existe (para rota "/")
  - [ ] API routes têm `route.ts` no caminho correto
- [ ] Arquivos estáticos em `public/` estão sendo referenciados corretamente
- [ ] Variáveis de ambiente configuradas no Vercel (se necessário)
- [ ] Build passa localmente: `npm run build`
- [ ] Testado localmente: `npm run dev`

---

## 🎓 RESUMO EXECUTIVO

### O Problema
O Vercel não reconheceu seu projeto como Next.js, então tratou como site estático e retornou 404 para rotas que deveriam ser processadas pelo Next.js.

### A Solução
1. Configurar Framework Preset como "Next.js" no Dashboard
2. Verificar diretório raiz
3. Garantir estrutura de arquivos correta

### O Conceito Chave
**Next.js App Router = Sistema de arquivos = Roteamento**. O Vercel precisa saber que está lidando com Next.js para processar essas convenções corretamente.

### Para Evitar no Futuro
- Sempre verificar configurações no Dashboard após primeiro deploy
- Validar estrutura de arquivos antes de fazer deploy
- Usar checklist de verificação

---

## 🔗 Recursos Adicionais

- [Documentação Vercel - Erros NOT_FOUND](https://vercel.com/docs/errors/NOT_FOUND)
- [Next.js App Router - Routing](https://nextjs.org/docs/app/building-your-application/routing)
- [Vercel - Framework Detection](https://vercel.com/docs/frameworks/overview)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Última atualização:** Dezembro 2024
