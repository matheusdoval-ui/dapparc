# 🚀 Deploy do Contrato Leaderboard na Arc Testnet

## 📄 Contrato: Leaderboard.sol

Contrato simples que emite evento `NewEntry(address user)` quando `mint()` é chamado.

## 🎯 Funcionalidades

- ✅ Função `mint()` para registrar usuários
- ✅ Evento `NewEntry(address user)` emitido a cada registro
- ✅ Array de usuários registrados
- ✅ Mapeamento para verificação rápida

## 🚀 Deploy na Arc Testnet

### Opção 1: Remix IDE (Mais Fácil - Recomendado)

1. **Acesse Remix IDE**: https://remix.ethereum.org

2. **Crie o arquivo**:
   - Clique em "File Explorer" (ícone de pasta)
   - Clique em "Create New File"
   - Nome: `Leaderboard.sol`
   - Cole o código completo de `contracts/Leaderboard.sol`

3. **Compile**:
   - Vá na aba "Solidity Compiler"
   - Selecione versão: **0.8.20** ou superior
   - Clique em "Compile Leaderboard.sol"
   - Aguarde a compilação (deve aparecer um check verde)

4. **Configure a rede Arc Testnet**:
   - Vá na aba "Deploy & Run Transactions"
   - Em "Environment", selecione: **"Injected Provider - MetaMask"** (ou Rabby)
   - **IMPORTANTE**: Certifique-se de estar na **Arc Testnet**
     - Se não estiver, adicione a rede no MetaMask:
       - Network Name: `Arc Testnet`
       - RPC URL: `https://rpc.testnet.arc.network`
       - Chain ID: `5042002`
       - Currency Symbol: `ETH`
       - Block Explorer: `https://testnet.arcscan.app`

5. **Deploy o contrato**:
   - No campo "Deploy" (abaixo do nome do contrato)
   - Você verá um campo para parâmetros do construtor
   - Insira o endereço do owner:
     ```
     0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2
     ```
   - Clique no botão **"Deploy"** (ou "transact")
   - Confirme a transação no MetaMask/Rabby
   - Aguarde a confirmação

6. **Copie o endereço do contrato**:
   - Após o deploy, o contrato aparecerá na seção "Deployed Contracts"
   - Clique na seta para expandir
   - O endereço do contrato estará visível (ex: `0x1234...5678`)
   - **COPIE ESTE ENDEREÇO** - você precisará dele!

### Opção 2: Hardhat (Avançado)

1. **Instale Hardhat** (se ainda não tiver):
   ```bash
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   ```

2. **Crie `hardhat.config.js`** na raiz do projeto:
   ```javascript
   require("@nomicfoundation/hardhat-toolbox");
   require("dotenv").config({ path: ".env.local" });
   
   module.exports = {
     solidity: "0.8.20",
     networks: {
       arcTestnet: {
         url: "https://rpc.testnet.arc.network",
         chainId: 5042002,
         accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
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

Após fazer o deploy e copiar o endereço do contrato:

1. **Adicione ao `.env.local`**:
   ```env
   # Endereço do contrato Leaderboard deployado
   NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS=0x... (cole o endereço aqui)
   REGISTRY_CONTRACT_ADDRESS=0x... (mesmo endereço)
   ```

2. **Ou configure na Vercel**:
   - Vá para o Dashboard do Vercel
   - Selecione seu projeto
   - Vá em **Settings** → **Environment Variables**
   - Adicione:
     - `NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS` = `0x...` (endereço do contrato)
     - `REGISTRY_CONTRACT_ADDRESS` = `0x...` (mesmo endereço)
   - Faça um novo deploy

## ✅ Verificação

Após deploy e configuração:

1. ✅ Conecte uma carteira no dApp
2. ✅ A função `mint()` será chamada automaticamente
3. ✅ Raw input será preenchido (não será `0x`)
4. ✅ Transação será enviada para o contrato (não para próprio endereço)
5. ✅ Evento `NewEntry` será emitido
6. ✅ Usuário aparecerá no leaderboard

## 🔍 Verificar no Explorer

Após fazer uma transação, verifique no Arc Explorer:
- Acesse: https://testnet.arcscan.app
- Cole o hash da transação
- Verifique:
  - **To:** Deve ser o endereço do contrato (não seu endereço)
  - **Raw input:** Deve estar preenchido (não `0x`)
  - **Events:** Deve mostrar evento `NewEntry`

---

**Pronto para deploy!** 🚀
