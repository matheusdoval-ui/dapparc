# 🚀 Comando Exato para Deploy do Contrato Leaderboard

## 📋 Passo 1: Instalar Hardhat (se ainda não tiver)

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

## 📋 Passo 2: Compilar o Contrato

```bash
npx hardhat compile
```

## 📋 Passo 3: Deploy na Arc Testnet

**COMANDO EXATO:**

```bash
npx hardhat run scripts/deploy-leaderboard-hardhat.js --network arcTestnet
```

## ⚙️ Configuração Necessária

### No `.env.local`:

```env
# Private Key para deploy
PRIVATE_KEY=0x231c6f6e09937af4ffa4a47cec3bc10c3210ad4486b8e98131c0f2aeacc61d8c

# RPC URL (opcional, já tem padrão)
ARC_RPC_URL=https://rpc.testnet.arc.network
```

## 📝 Após o Deploy

O script mostrará o endereço do contrato. Adicione ao `.env.local`:

```env
NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS=0x... (endereço do contrato)
REGISTRY_CONTRACT_ADDRESS=0x... (mesmo endereço)
```

## ✅ Verificação

Após deploy e configuração:

1. ✅ Conecte uma carteira no dApp
2. ✅ A função `mint()` será chamada automaticamente
3. ✅ Raw input será preenchido (não será `0x`)
4. ✅ Transação será enviada para o contrato (não para próprio endereço)
5. ✅ Evento `NewEntry` será emitido

---

**Comando exato:** `npx hardhat run scripts/deploy-leaderboard-hardhat.js --network arcTestnet` 🚀
