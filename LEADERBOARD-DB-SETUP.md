# Leaderboard em banco de dados (Neon Postgres)

O leaderboard persiste **rank e número de transações** em um banco Postgres (Neon). Quando `DATABASE_URL` está configurado, o DB é a **única fonte de verdade**: os dados ficam salvos, **nunca são apagados** e sobrevivem a deploys e cold starts.

**Na Vercel, sem `DATABASE_URL` ou Vercel KV, os ranks não são persistidos** (só memória; perde tudo ao redeploy). Configure pelo menos um dos dois.

## Tabela `arc_leaderboard`

| Coluna              | Tipo     | Descrição                          |
|---------------------|----------|------------------------------------|
| `address`           | VARCHAR(42) PK | Endereço da carteira (lowercase) |
| `transactions`      | INTEGER  | Número de transações               |
| `first_consulted_at`| BIGINT   | Primeira consulta (ms)             |
| `last_consulted_at` | BIGINT   | Última consulta (ms)               |
| `consult_count`     | INTEGER  | Quantidade de consultas            |

O **rank** é calculado na leitura: `ORDER BY transactions DESC`. Quem tem mais transações fica no topo.

## 1. Criar projeto no Neon

1. Acesse [Neon](https://neon.tech) e crie uma conta (ou use GitHub).
2. Crie um novo projeto (ex.: `arc-leaderboard`).
3. Copie a **connection string** (Connection pooling), algo como:
   ```
   postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

## 2. Configurar variável de ambiente

### Local (`.env.local`)

```env
DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

### Vercel

1. Dashboard do projeto → **Settings** → **Environment Variables**.
2. Adicione `DATABASE_URL` com a connection string do Neon.
3. Ambiente: **Production** (e **Preview** se quiser).
4. Faça um novo deploy.

## 3. Tabela

A tabela `arc_leaderboard` é criada automaticamente na primeira uso (`CREATE TABLE IF NOT EXISTS`). Não é preciso rodar migrations manualmente.

## 4. Comportamento

- **Com `DATABASE_URL`**:  
  - Gravação: `recordWalletConsultation` faz upsert no Postgres.  
  - Leitura: `getLeaderboard`, `getWalletRank`, `getWalletStats` leem do Postgres.  
  - Rank sempre por `transactions` (maior primeiro).

- **Sem `DATABASE_URL`**:  
  - Continua usando Vercel KV, arquivo (`.data/leaderboard.json`) ou memória, como antes.

## 5. Dependência

Foi adicionado `@neondatabase/serverless`. O módulo do Neon só é carregado quando `DATABASE_URL` existe; se não estiver configurado, o app segue sem DB.

## 6. Verificar

1. Configure `DATABASE_URL` e faça deploy (ou rode localmente).
2. Acesse **`/api/leaderboard/status`** (ou `https://seu-dominio.vercel.app/api/leaderboard/status`).  
   - `storage: "database"` e `databaseReady: true` → persistência ativa.  
   - `storage: "memory"` → nada configurado; ranks não serão salvos.
3. Conecte uma carteira na home e consulte as stats.
4. Abra `/leaderboard`: a carteira deve aparecer ordenada por transações.
5. Atualize a página ou faça novo deploy: os ranks continuam no banco e **não são apagados**.
