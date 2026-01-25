# Leaderboard em banco de dados (Neon Postgres)

O leaderboard pode persistir **rank e número de transações** em um banco Postgres (Neon). Quando `DATABASE_URL` está configurado, ele usa o DB como fonte primária; caso contrário, usa KV/arquivo/memória.

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

1. Configure `DATABASE_URL` e suba o app.
2. Conecte uma carteira na home e consulte as stats.
3. Abra `/leaderboard` e confira se a carteira aparece, ordenada por transações.
4. Atualize a página: o rank e os dados devem vir do banco e persistir.
