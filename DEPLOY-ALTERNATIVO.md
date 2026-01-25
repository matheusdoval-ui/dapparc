# 🚀 Deploy Alternativo: Arc Proof of Activity

Se o Hardhat não estiver funcionando, use uma destas alternativas:

## Opção 1: Remix IDE (Mais Fácil) ⭐

### Passo a passo:

1. **Acesse Remix IDE:**
   - https://remix.ethereum.org

2. **Crie o arquivo:**
   - Clique em "Create new file"
   - Nome: `ArcProofOfActivity.sol`
   - Cole o conteúdo de `contracts/ArcProofOfActivity.sol`

3. **Compile:**
   - Vá na aba "Solidity Compiler"
   - Versão: `0.8.20` ou superior
   - Clique em "Compile ArcProofOfActivity.sol"

4. **Configure a rede:**
   - Vá na aba "Deploy & Run Transactions"
   - Environment: "Injected Provider - MetaMask"
   - Certifique-se de estar na **Arc Testnet** (Chain ID: 5042002)

5. **Adicione a rede Arc Testnet no MetaMask:**
   ```
   Network Name: Arc Testnet
   RPC URL: https://rpc.testnet.arc.network
   Chain ID: 5042002
   Currency Symbol: ETH
   Block Explorer: https://testnet.arcscan.app
   ```

6. **Deploy:**
   - Clique em "Deploy"
   - Confirme a transação no MetaMask
   - Aguarde confirmação

7. **Copie o endereço:**
   - Após deploy, copie o endereço do contrato
   - Configure no `.env`:
     ```
     NEXT_PUBLIC_ARC_POA_ADDRESS=0x... (endereço copiado)
     ```

## Opção 2: Script Simples (Node.js)

### Pré-requisitos:
```bash
npm install ethers
```

### Executar:
```bash
node scripts/deploy-arc-poa-simple.js
```

**Nota:** Este script precisa que o contrato já esteja compilado pelo Hardhat.

## Opção 3: Hardhat (Se funcionar)

### 1. Instalar dependências:
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install dotenv
```

### 2. Compilar:
```bash
npx hardhat compile
```

### 3. Deploy:
```bash
npx hardhat run scripts/deploy-arc-poa.js --network arcTestnet
```

## ⚠️ Problemas Comuns

### "PRIVATE_KEY não encontrada"
- Crie arquivo `.env` na raiz do projeto
- Adicione: `PRIVATE_KEY=sua_chave_privada`

### "Saldo insuficiente"
- Obtenha ETH na Arc Testnet via faucet
- Verifique se está na rede correta

### "Hardhat não encontrado"
- Execute: `npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox`

### "EPERM" ou erros de permissão
- Execute no terminal local (não no Cursor)
- Ou use Remix IDE (Opção 1 - mais fácil)

## ✅ Recomendação

**Use Remix IDE (Opção 1)** - É a forma mais simples e não requer instalação local do Hardhat.
