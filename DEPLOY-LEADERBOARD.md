# 📋 Guia de Deploy do Contrato Leaderboard

## 📄 Contrato: Leaderboard.sol

O contrato `Leaderboard.sol` foi criado para registrar usuários no leaderboard através da função `mint()`.

## 🎯 Funcionalidades do Contrato

- ✅ Função `mint()` para registrar usuários
- ✅ Evento `NewEntry` emitido a cada registro
- ✅ Array de usuários registrados
- ✅ Mapeamento para verificação rápida
- ✅ Timestamp de registro armazenado

## 🚀 Como Fazer Deploy

### Opção 1: Usando Remix IDE (Recomendado - Mais Fácil)

1. **Acesse Remix IDE**: https://remix.ethereum.org

2. **Crie o arquivo do contrato**:
   - Crie um novo arquivo `Leaderboard.sol`
   - Cole o conteúdo de `contracts/Leaderboard.sol`

3. **Configure o compilador**:
   - Selecione Solidity 0.8.20 ou superior
   - Compile o contrato

4. **Configure o deploy**:
   - Vá para a aba "Deploy & Run"
   - Selecione "Injected Provider" (MetaMask/Rabby)
   - Certifique-se de estar na ARC Testnet (Chain ID: 5042002)

5. **Deploy o contrato**:
   - No campo "Deploy", insira o parâmetro do construtor:
     ```
     _owner: 0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2
     ```
   - Clique em "Deploy"

6. **Copie o endereço do contrato** após o deploy

### Opção 2: Usando Hardhat

1. **Instale dependências** (se ainda não tiver):
   ```bash
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   ```

2. **Crie hardhat.config.js**:
   ```javascript
   require("@nomicfoundation/hardhat-toolbox");
   
   module.exports = {
     solidity: "0.8.20",
     networks: {
       arcTestnet: {
         url: "https://rpc.testnet.arc.network",
         chainId: 5042002,
         accounts: [process.env.PRIVATE_KEY]
       }
     }
   };
   ```

3. **Compile o contrato**:
   ```bash
   npx hardhat compile
   ```

4. **Crie script de deploy** (ou use o existente):
   ```bash
   npx hardhat run scripts/deploy-leaderboard.js --network arcTestnet
   ```

### Opção 3: Usando Foundry

```bash
# Compile
forge build

# Deploy
forge create Leaderboard \
  --constructor-args 0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2 \
  --rpc-url https://rpc.testnet.arc.network \
  --private-key YOUR_PRIVATE_KEY
```

## ⚙️ Configuração Após Deploy

Após fazer o deploy do contrato, você precisa configurar a variável de ambiente:

1. **Adicione ao `.env.local`**:
   ```env
   # Endereço do contrato Leaderboard deployado
   NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS=0x... (endereço do contrato)
   REGISTRY_CONTRACT_ADDRESS=0x... (mesmo endereço)
   ```

2. **Ou configure na Vercel**:
   - Vá para Settings > Environment Variables
   - Adicione `NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS` com o endereço do contrato
   - Adicione `REGISTRY_CONTRACT_ADDRESS` com o mesmo endereço

## 💰 Como Usar o Contrato

### Para Usuários (Registrar no Leaderboard)

1. **Conecte sua carteira** (MetaMask ou Rabby)

2. **Chame a função `mint()`**:
   - No dApp, a função será chamada automaticamente ao conectar
   - Ou use Remix/Interface:
     - Conecte sua carteira
     - Chame `mint()` no contrato

3. **Aguarde a confirmação**:
   - A transação será enviada
   - Evento `NewEntry` será emitido
   - Após confirmação, sua carteira aparecerá no leaderboard

### Para Desenvolvedor (Verificar Registros)

```solidity
// Verificar se uma carteira está registrada
isRegistered(0x...)

// Obter todos os usuários registrados
getAllRegisteredUsers()

// Obter total de usuários
getTotalUsers()

// Obter informações de registro
getRegistrationInfo(0x...)
```

## 🔍 Eventos do Contrato

O contrato emite o evento `NewEntry` a cada registro:

```solidity
event NewEntry(
    address indexed user,
    uint256 timestamp,
    uint256 blockNumber,
    uint256 index
);
```

Este evento pode ser usado no frontend para:
- Listar usuários registrados
- Filtrar por timestamp
- Mostrar ordem de registro (index)

## 📊 Vantagens do Sistema

- ✅ Função simples `mint()` para registro
- ✅ Evento emitido para rastreamento
- ✅ Array de usuários para listagem
- ✅ Mapeamento para verificação rápida
- ✅ Timestamp armazenado para ordenação

## ⚠️ Nota Importante

- O contrato armazena todos os usuários em um array
- Para muitos usuários, considere usar paginação no frontend
- O evento `NewEntry` permite filtrar sem ler o array completo

---

**Pronto para deploy!** 🚀
