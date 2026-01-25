# 📋 Deploy do Contrato Leaderboard Simples

## 📄 Contrato: Leaderboard.sol

Contrato simples que emite evento `Registered(address user)` quando `mint()` é chamado.

## 🚀 Deploy na Arc Testnet

### Opção 1: Remix IDE (Mais Fácil)

1. **Acesse Remix IDE**: https://remix.ethereum.org

2. **Crie o arquivo**:
   - Crie `Leaderboard.sol`
   - Cole o código de `contracts/Leaderboard.sol`

3. **Compile**:
   - Selecione Solidity 0.8.20+
   - Compile o contrato

4. **Configure a rede**:
   - Vá em "Deploy & Run"
   - Selecione "Injected Provider" (MetaMask/Rabby)
   - Certifique-se de estar na **Arc Testnet** (Chain ID: 5042002)
   - Se não estiver, adicione a rede:
     - Network Name: Arc Testnet
     - RPC URL: https://rpc.testnet.arc.network
     - Chain ID: 5042002
     - Currency Symbol: ETH

5. **Deploy**:
   - No campo "Deploy", insira:
     ```
     _owner: 0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2
     ```
   - Clique em "Deploy"
   - Confirme a transação na carteira

6. **Copie o endereço do contrato** após o deploy

### Opção 2: Hardhat

1. **Instale Hardhat** (se ainda não tiver):
   ```bash
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   ```

2. **Crie `hardhat.config.js`**:
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

3. **Compile**:
   ```bash
   npx hardhat compile
   ```

4. **Deploy**:
   ```bash
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

### 1. Função mint()

Quando `mint()` é chamado:
- Verifica se o usuário já está registrado
- Registra o `msg.sender` no array
- Emite evento `Registered(msg.sender)`
- Emite evento `NewEntry` (compatibilidade)

### 2. Evento Registered

```solidity
event Registered(address indexed user);
```

Este evento é filtrado no frontend para listar usuários.

### 3. Integração no dApp

O dApp já está configurado para:
- Usar `encodeFunctionData` com `mint()`
- Enviar transação para o contrato (não para próprio endereço)
- Raw input será preenchido (não será `0x`)

## 📊 Listagem no Frontend

A API `/api/leaderboard-users`:
- Filtra eventos `Registered` do contrato
- Retorna lista de usuários registrados
- O frontend exibe automaticamente

## ✅ Verificação

Após deploy e configuração:

1. ✅ Conecte uma carteira
2. ✅ A função `mint()` será chamada automaticamente
3. ✅ Raw input será preenchido (não será `0x`)
4. ✅ Transação será enviada para o contrato
5. ✅ Evento `Registered` será emitido
6. ✅ Usuário aparecerá no leaderboard

---

**Pronto para deploy!** 🚀
