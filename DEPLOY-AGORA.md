# 🚀 Deploy Agora - Comandos Simples

## ✅ Erro Corrigido!

O erro de compilação foi corrigido. Agora execute:

## 📋 Comandos (Copie e Cole):

```bash
npx hardhat compile
```

Se compilar com sucesso, execute:

```bash
npx hardhat run scripts/deploy-leaderboard-hardhat.js --network arcTestnet
```

## 📝 Após o Deploy

O script mostrará o endereço do contrato. Adicione ao `.env.local`:

```env
NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS=0x... (endereço mostrado)
REGISTRY_CONTRACT_ADDRESS=0x... (mesmo endereço)
```

## ✅ Pronto!

Após configurar o endereço, o dApp funcionará:
- ✅ Transações para o contrato
- ✅ Raw input preenchido
- ✅ Função `mint()` chamada
- ✅ Evento `NewEntry` emitido

---

**Execute:** `npx hardhat compile` e depois `npx hardhat run scripts/deploy-leaderboard-hardhat.js --network arcTestnet` 🚀
