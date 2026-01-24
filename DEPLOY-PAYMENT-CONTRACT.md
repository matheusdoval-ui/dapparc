# 📋 Guia de Deploy do Contrato de Pagamento

## 📄 Contrato: LeaderboardPayment.sol

O contrato `LeaderboardPayment.sol` foi criado para receber pagamentos de taxa do leaderboard de forma estruturada.

## 🎯 Funcionalidades do Contrato

- ✅ Aceita pagamentos em USDC e EURC
- ✅ Valida valor mínimo (0.5 USDC/EURC = 500000)
- ✅ Rastreia quais endereços pagaram
- ✅ Emite eventos `PaymentReceived` para verificação
- ✅ Permite que o owner retire os fundos
- ✅ Função `hasPaid(address)` para verificação rápida

## 🚀 Como Fazer Deploy

### Opção 1: Usando Remix IDE (Recomendado)

1. **Acesse Remix IDE**: https://remix.ethereum.org

2. **Crie o arquivo do contrato**:
   - Crie um novo arquivo `LeaderboardPayment.sol`
   - Cole o conteúdo de `contracts/LeaderboardPayment.sol`

3. **Configure o compilador**:
   - Selecione Solidity 0.8.20 ou superior
   - Compile o contrato

4. **Configure o deploy**:
   - Vá para a aba "Deploy & Run"
   - Selecione "Injected Provider" (MetaMask/Rabby)
   - Certifique-se de estar na ARC Testnet (Chain ID: 5042002)

5. **Deploy o contrato**:
   - No campo "Deploy", insira os parâmetros do construtor:
     ```
     _usdc: 0x3910B7cbb3341f1F4bF4cEB66e4A2C8f204FE2b8
     _eurc: 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a
     _owner: 0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2
     ```
   - Clique em "Deploy"

6. **Copie o endereço do contrato** após o deploy

### Opção 2: Usando Hardhat ou Foundry

```bash
# Com Hardhat
npx hardhat compile
npx hardhat run scripts/deploy-payment.js --network arcTestnet

# Com Foundry
forge build
forge create LeaderboardPayment --constructor-args 0x3910B7cbb3341f1F4bF4cEB66e4A2C8f204FE2b8 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a 0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2 --rpc-url https://rpc.testnet.arc.network --private-key YOUR_PRIVATE_KEY
```

## ⚙️ Configuração Após Deploy

Após fazer o deploy do contrato, você precisa configurar a variável de ambiente:

1. **Adicione ao `.env.local`**:
   ```
   PAYMENT_CONTRACT_ADDRESS=0x... (endereço do contrato deployado)
   ```

2. **Ou configure na Vercel**:
   - Vá para Settings > Environment Variables
   - Adicione `PAYMENT_CONTRACT_ADDRESS` com o endereço do contrato

## 💰 Como Usar o Contrato

### Para Usuários (Pagar Taxa)

1. **Aprovar o contrato para gastar tokens**:
   - No MetaMask/Rabby, vá para o token (USDC ou EURC)
   - Aprove o contrato para gastar pelo menos 0.5 tokens

2. **Chamar a função de pagamento**:
   - **Para USDC**: `payWithUSDC(500000)` (0.5 USDC)
   - **Para EURC**: `payWithEURC(500000)` (0.5 EURC)

3. **Ou usar Remix/Interface**:
   - Conecte sua carteira
   - Chame `payWithUSDC` ou `payWithEURC` com valor `500000`

### Para Desenvolvedor (Retirar Fundos)

```solidity
// Retirar todo USDC
withdrawUSDC(0)

// Retirar todo EURC
withdrawEURC(0)

// Retirar valor específico
withdrawUSDC(1000000) // 1 USDC
```

## 🔍 Verificação de Pagamento

O sistema verifica pagamentos de duas formas:

1. **Via contrato (se deployado)**:
   - Chama `hasPaid(address)` no contrato
   - Verifica eventos `PaymentReceived`

2. **Via transferências diretas (fallback)**:
   - Verifica eventos `Transfer` dos tokens USDC/EURC
   - Para a carteira do desenvolvedor

## 📊 Vantagens do Contrato

- ✅ Verificação mais rápida e eficiente
- ✅ Eventos específicos para pagamentos
- ✅ Validação de valor mínimo no contrato
- ✅ Rastreamento centralizado
- ✅ Possibilidade de funcionalidades futuras

## ⚠️ Nota Importante

O sistema funciona **com ou sem** o contrato deployado:
- **Com contrato**: Verificação mais eficiente via `hasPaid()`
- **Sem contrato**: Verificação via eventos `Transfer` (funciona atualmente)

O contrato é opcional mas recomendado para melhor performance e funcionalidades futuras.
