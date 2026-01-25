# 📋 Setup Completo: Contrato Leaderboard com mint()

## ✅ O Que Foi Criado

### 1. **Contrato Solidity: `Leaderboard.sol`**
- ✅ Função `mint()` para registrar usuários
- ✅ Evento `NewEntry` emitido a cada registro
- ✅ Array de usuários registrados
- ✅ Mapeamento para verificação rápida
- ✅ Timestamp de registro armazenado

### 2. **Scripts de Deploy**
- ✅ `scripts/deploy-leaderboard.js` - Script de deploy
- ✅ `DEPLOY-LEADERBOARD.md` - Guia completo de deploy

### 3. **ABI e Integração**
- ✅ `lib/abis/leaderboard.ts` - ABI completo do contrato
- ✅ `lib/user-operation.ts` - Atualizado para usar `mint()` em vez de `register()`
- ✅ `lib/user-operation-direct.ts` - Atualizado para usar `mint()`

### 4. **API para Frontend**
- ✅ `app/api/leaderboard-users/route.ts` - API que lista usuários do contrato
- ✅ Filtra eventos `NewEntry` do contrato
- ✅ Retorna lista de usuários registrados

### 5. **Frontend Atualizado**
- ✅ `app/leaderboard/page.tsx` - Atualizado para buscar usuários do contrato
- ✅ Combina dados do leaderboard com dados do contrato
- ✅ Mostra usuários registrados on-chain

## 🚀 Como Fazer Deploy

### Opção 1: Remix IDE (Recomendado)

1. Acesse: https://remix.ethereum.org
2. Crie arquivo `Leaderboard.sol`
3. Cole o código de `contracts/Leaderboard.sol`
4. Compile com Solidity 0.8.20+
5. Deploy na Arc Testnet com owner: `0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2`
6. Copie o endereço do contrato

### Opção 2: Hardhat

```bash
# Compile
npx hardhat compile

# Deploy
npx hardhat run scripts/deploy-leaderboard.js --network arcTestnet
```

## ⚙️ Configuração Após Deploy

Após fazer o deploy, configure no `.env.local`:

```env
# Endereço do contrato Leaderboard deployado
NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS=0x... (endereço do contrato)
REGISTRY_CONTRACT_ADDRESS=0x... (mesmo endereço)
```

## 🔍 Como Funciona

### 1. **Registro de Usuário**

Quando uma carteira é conectada:
1. O dApp detecta se é Smart Account
2. Cria UserOperation com `execute(contrato, 0, mint())`
3. CallData contém `mint()` codificado via `encodeFunctionData`
4. Transação é enviada para o contrato (não para próprio endereço)
5. Raw input será preenchido (não será `0x`)

### 2. **Evento NewEntry**

O contrato emite evento a cada registro:

```solidity
event NewEntry(
    address indexed user,
    uint256 timestamp,
    uint256 blockNumber,
    uint256 index
);
```

### 3. **Listagem no Frontend**

A API `/api/leaderboard-users`:
- Busca todos os usuários do array do contrato
- Ou filtra eventos `NewEntry` (fallback)
- Retorna lista ordenada por timestamp/index

O frontend:
- Busca dados do leaderboard tradicional
- Busca usuários do contrato
- Combina ambos e mostra no leaderboard

## 📊 Estrutura do CallData

```typescript
// 1. Encodar mint() do contrato
const mintAbi = parseAbi(['function mint() external'])
const mintCallData = encodeFunctionData({
  abi: mintAbi,
  functionName: 'mint',
  args: [],
})

// 2. Encodar execute() da Smart Account
const executeAbi = parseAbi([
  'function execute(address to, uint256 value, bytes calldata data) external',
])
const callData = encodeFunctionData({
  abi: executeAbi,
  functionName: 'execute',
  args: [
    REGISTRY_CONTRACT_ADDRESS, // to = contrato
    0n,                        // value = 0
    mintCallData              // data = mint() codificado
  ],
})
```

## 🎯 Resultado Esperado

Após deploy e configuração:

1. ✅ CallData será preenchido com `execute(contrato, 0, mint())`
2. ✅ Raw input não será mais `0x`
3. ✅ Transação será enviada para o contrato
4. ✅ Evento `NewEntry` será emitido
5. ✅ Usuários aparecerão no leaderboard via API

## 📝 Arquivos Criados/Modificados

### Criados:
- `contracts/Leaderboard.sol` - Contrato Solidity
- `scripts/deploy-leaderboard.js` - Script de deploy
- `DEPLOY-LEADERBOARD.md` - Guia de deploy
- `lib/abis/leaderboard.ts` - ABI do contrato
- `app/api/leaderboard-users/route.ts` - API de usuários

### Modificados:
- `lib/user-operation.ts` - Usa `mint()` em vez de `register()`
- `lib/user-operation-direct.ts` - Usa `mint()` em vez de `register()`
- `app/leaderboard/page.tsx` - Busca usuários do contrato

## ⚠️ Importante

- O contrato armazena todos os usuários em um array
- Para muitos usuários, considere usar paginação no frontend
- O evento `NewEntry` permite filtrar sem ler o array completo
- Configure `NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS` após deploy

---

**Pronto para deploy e uso!** 🚀
