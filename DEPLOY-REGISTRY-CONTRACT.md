# 📋 Guia de Deploy do Contrato de Registro

## 📄 Contrato: LeaderboardRegistry.sol

O contrato `LeaderboardRegistry.sol` foi criado para registrar carteiras no leaderboard através de uma ação on-chain simples.

## 🎯 Funcionalidades do Contrato

- ✅ Registro simples via função `register()`
- ✅ Gera evento `WalletRegistered` para rastreamento
- ✅ Muda estado mínimo (mapping `isRegistered`)
- ✅ Prova uso real através de transação on-chain
- ✅ Função `isRegistered(address)` para verificação rápida
- ✅ Sem necessidade de pagamento - apenas gas para transação

## 🚀 Como Fazer Deploy

### Opção 1: Usando Remix IDE (Recomendado)

1. **Acesse Remix IDE**: https://remix.ethereum.org

2. **Crie o arquivo do contrato**:
   - Crie um novo arquivo `LeaderboardRegistry.sol`
   - Cole o conteúdo de `contracts/LeaderboardRegistry.sol`

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

### Opção 2: Usando Hardhat ou Foundry

```bash
# Com Hardhat
npx hardhat compile
npx hardhat run scripts/deploy-registry.js --network arcTestnet

# Com Foundry
forge build
forge create LeaderboardRegistry --constructor-args 0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2 --rpc-url https://rpc.testnet.arc.network --private-key YOUR_PRIVATE_KEY
```

## ⚙️ Configuração Após Deploy

Após fazer o deploy do contrato, você precisa configurar a variável de ambiente:

1. **Adicione ao `.env.local`**:
   ```
   REGISTRY_CONTRACT_ADDRESS=0x... (endereço do contrato deployado)
   NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS=0x... (mesmo endereço, para uso no cliente)
   ```

2. **Ou configure na Vercel**:
   - Vá para Settings > Environment Variables
   - Adicione `REGISTRY_CONTRACT_ADDRESS` com o endereço do contrato
   - Adicione `NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS` com o mesmo endereço

## 💰 Como Usar o Contrato

### Para Usuários (Registrar no Leaderboard)

1. **Conecte sua carteira** (MetaMask ou Rabby)

2. **Chame a função de registro**:
   - No dApp, clique no botão "Register for Leaderboard"
   - Ou use Remix/Interface:
     - Conecte sua carteira
     - Chame `register()` no contrato

3. **Aguarde a confirmação**:
   - A transação será enviada
   - Após confirmação, sua carteira aparecerá no leaderboard

### Para Desenvolvedor (Verificar Registros)

```solidity
// Verificar se uma carteira está registrada
isRegistered(0x...)

// Obter informações de registro
getRegistrationInfo(0x...)

// Ver total de registros
totalRegistrations()
```

## 🔍 Verificação de Registro

O sistema verifica registros de duas formas:

1. **Via contrato (se deployado)**:
   - Chama `isRegistered(address)` no contrato
   - Verifica eventos `WalletRegistered`

2. **Sem contrato (backward compatibility)**:
   - Se o contrato não estiver deployado, todas as carteiras conectadas são elegíveis

## 📊 Vantagens do Sistema

- ✅ Ação on-chain simples (apenas gas, sem pagamento)
- ✅ Gera evento para rastreamento
- ✅ Muda estado mínimo no contrato
- ✅ Prova uso real através de transação
- ✅ Verificação rápida e eficiente
- ✅ Sem necessidade de aprovação de tokens

## ⚠️ Nota Importante

O sistema funciona **com ou sem** o contrato deployado:
- **Com contrato**: Verificação via `isRegistered()` - mais eficiente
- **Sem contrato**: Todas as carteiras conectadas são elegíveis (backward compatibility)

O contrato é recomendado para melhor rastreamento e prova de uso real.
