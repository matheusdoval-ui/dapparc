# ⚡ Guia Rápido - Deploy e Teste

## 🚀 Passos Rápidos

### 1️⃣ Gerar Nova Carteira

```bash
node scripts/generate-wallet.js
```

**Guarde as informações geradas!** Você precisará da chave privada.

### 2️⃣ Obter ETH de Teste

Você precisa de ETH na ARC Testnet. Opções:
- Use um faucet da ARC Network
- Transfira ETH de teste de outra carteira

### 3️⃣ Fazer Deploy do Contrato

```bash
node scripts/full-deploy.js <SUA_CHAVE_PRIVADA>
```

Isso irá:
- ✅ Compilar o contrato
- ✅ Fazer deploy na ARC Testnet
- ✅ Salvar o ABI em `contract-abi.json`
- ✅ Mostrar o endereço do contrato

### 4️⃣ Criar Interações (Opcional)

Para testar e aumentar o número de transações:

```bash
node scripts/test-interactions.js <SUA_CHAVE_PRIVADA> <ENDEREÇO_DO_CONTRATO> [NUMERO]
```

Exemplo para criar 5 interações:
```bash
node scripts/test-interactions.js 0x123... 0xabc... 5
```

### 5️⃣ Testar na Aplicação

1. **Importar carteira no MetaMask/Rabby:**
   - Abra MetaMask/Rabby
   - Importar conta → Cole a chave privada ou frase mnemônica

2. **Conectar à ARC Testnet:**
   - Adicione a rede manualmente se necessário:
     - Nome: Arc Testnet
     - RPC: https://rpc.testnet.arc.network
     - Chain ID: 5042002
     - Explorer: https://testnet.arcscan.app

3. **Usar a aplicação:**
   - Acesse: http://localhost:3000
   - Clique em "Connect Wallet"
   - Veja suas estatísticas!

## 📋 Exemplo Completo

```bash
# 1. Gerar carteira
node scripts/generate-wallet.js

# 2. Copiar a chave privada gerada
# Exemplo: 0x1234567890abcdef...

# 3. Fazer deploy
node scripts/full-deploy.js 0x1234567890abcdef...

# 4. Copiar o endereço do contrato retornado
# Exemplo: 0xabcdef1234567890...

# 5. Criar algumas interações
node scripts/test-interactions.js 0x1234567890abcdef... 0xabcdef1234567890... 3

# 6. Importar carteira no MetaMask e testar!
```

## 🔍 Verificar no Explorer

Após o deploy, você pode verificar no explorer:
```
https://testnet.arcscan.app/address/<ENDEREÇO_DO_CONTRATO>
```

## ⚠️ Importante

- **NUNCA** compartilhe sua chave privada
- Use apenas para testes
- Faça backup da frase mnemônica
- Certifique-se de estar na ARC Testnet (não Mainnet!)

## 🆘 Problemas?

- **Saldo insuficiente:** Você precisa de ETH na ARC Testnet
- **Rede incorreta:** Certifique-se de estar na ARC Testnet (Chain ID: 5042002)
- **Erro de compilação:** Verifique se o Solidity está instalado (`npm install solc`)
