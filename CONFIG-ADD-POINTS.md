# Configuração addPoints (ArcLeaderboard)

## 1. Criar/editar `.env.local`

Na raiz do projeto, crie ou edite o arquivo `.env.local`:

```env
# Chave privada da carteira que é OWNER do contrato ArcLeaderboard
# O contrato foi deployado por essa carteira (constructor Ownable(msg.sender))
LEADERBOARD_OWNER_PRIVATE_KEY=0xSUA_CHAVE_PRIVADA_AQUI
```

## 2. Obter a chave privada

- A carteira que deployou o contrato ArcLeaderboard (`0x7461Fc5EAf38693e98B06B042e37b4adF1453AbD`) é o owner.
- Exporte a chave privada dessa carteira (MetaMask: Account Details → Export Private Key).
- Cole no `.env.local` sem aspas.

## 3. Vercel

Em **Settings → Environment Variables**, adicione:

| Nome | Valor |
|------|-------|
| `LEADERBOARD_OWNER_PRIVATE_KEY` | `0x...` (sua chave privada) |

⚠️ **Segurança:** Nunca faça commit do `.env.local` nem exponha a chave no código.

## 4. Testar

```bash
curl -X POST http://localhost:3000/api/leaderboard/add-points \
  -H "Content-Type: application/json" \
  -d '{"user":"0x742d35Cc6634C0532925a3b844Bc9e7595f8dE21","points":1}'
```

Resposta esperada: `{"success":true,"txHash":"0x...","user":"0x...","points":1}`
