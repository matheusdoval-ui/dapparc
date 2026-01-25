# 🚀 Guia Simples: Deploy do Contrato Leaderboard

## ✅ Tudo Pronto!

O contrato e o código já estão criados. Siga estes 3 passos:

## 📋 Passo 1: Instalar Hardhat

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

## 📋 Passo 2: Compilar

```bash
npx hardhat compile
```

## 📋 Passo 3: Deploy (COMANDO EXATO)

```bash
npx hardhat run scripts/deploy-leaderboard-hardhat.js --network arcTestnet
```

## ⚙️ Configuração

Certifique-se de que o `.env.local` tem:

```env
PRIVATE_KEY=0x231c6f6e09937af4ffa4a47cec3bc10c3210ad4486b8e98131c0f2aeacc61d8c
```

## 📝 Após o Deploy

O script mostrará o endereço do contrato. Adicione ao `.env.local`:

```env
NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS=0x... (endereço mostrado)
REGISTRY_CONTRACT_ADDRESS=0x... (mesmo endereço)
```

## ✅ Pronto!

Após configurar o endereço, o dApp funcionará automaticamente:
- ✅ Transações irão para o contrato (não para você)
- ✅ Raw input será preenchido (não será `0x`)
- ✅ Função `mint()` será chamada
- ✅ Evento `NewEntry` será emitido

---

**Comando exato:** `npx hardhat run scripts/deploy-leaderboard-hardhat.js --network arcTestnet` 🚀
