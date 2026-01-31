# Deploy ArcLeaderboard (Auto-Register on addPoints)

O contrato foi atualizado para auto-registrar usuários quando recebem pontos.

## Mudança no contrato

- `addPoints` agora registra o usuário automaticamente se ainda não estiver em `users[]`
- Removido `require(registered[user])` — pontos podem ser adicionados a qualquer endereço

## Passos para deploy

### 1. Compilar

```bash
npx hardhat compile
```

### 2. Deploy (Arc Testnet)

```bash
npx hardhat run scripts/deploy-leaderboard.js --network arcTestnet
```

Ou:

```bash
npx hardhat run scripts/deploy-leaderboard.js --network arc_testnet
```

### 3. Atualizar frontend

Copie o novo endereço do contrato e configure no `.env.local` e na Vercel:

```
NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS=0x7461Fc5EAf38693e98B06B042e37b4adF1453AbD
REGISTRY_CONTRACT_ADDRESS=0x7461Fc5EAf38693e98B06B042e37b4adF1453AbD
```

### 4. Redeploy do frontend (Vercel)

```bash
git add .
git commit -m "fix: ArcLeaderboard auto-register on addPoints"
git push origin main
```

Depois, adicione as variáveis de ambiente no Vercel com o novo endereço.
