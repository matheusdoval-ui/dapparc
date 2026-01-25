# 🎯 Deploy via Remix IDE - Guia Completo

A forma **mais fácil** de fazer deploy do ArcProofOfActivity sem configurar Hardhat localmente.

## 📋 Passo a Passo

### 1. Acesse Remix IDE
- Abra: https://remix.ethereum.org
- Aguarde carregar completamente

### 2. Crie o Arquivo do Contrato

1. No painel esquerdo, clique em **"contracts"** (ou crie a pasta)
2. Clique no ícone **"+"** para criar novo arquivo
3. Nome: `ArcProofOfActivity.sol`
4. Cole o código completo do contrato (veja abaixo)

### 3. Código do Contrato

Copie TODO o conteúdo de `contracts/ArcProofOfActivity.sol` e cole no Remix.

### 4. Compile o Contrato

1. Vá na aba **"Solidity Compiler"** (ícone de engrenagem)
2. Selecione **Compiler: 0.8.20** ou superior
3. Clique em **"Compile ArcProofOfActivity.sol"**
4. Aguarde a mensagem verde: ✅ "Compilation successful"

### 5. Configure MetaMask para Arc Testnet

Se ainda não tiver a rede configurada:

1. Abra MetaMask
2. Clique no menu de redes (topo)
3. Clique em **"Add Network"** → **"Add a network manually"**
4. Preencha:
   ```
   Network Name: Arc Testnet
   RPC URL: https://rpc.testnet.arc.network
   Chain ID: 5042002
   Currency Symbol: ETH
   Block Explorer URL: https://testnet.arcscan.app
   ```
5. Clique em **"Save"**

### 6. Obtenha ETH na Arc Testnet

Você precisa de ETH para pagar o gas:

- Use um faucet da Arc Network (se disponível)
- Ou solicite em comunidades da Arc Network

### 7. Faça o Deploy

1. Vá na aba **"Deploy & Run Transactions"** (ícone de foguete)
2. **Environment:** Selecione **"Injected Provider - MetaMask"**
3. Certifique-se de estar na rede **"Arc Testnet"** (Chain ID: 5042002)
4. No campo **"Contract"**, selecione **"ArcProofOfActivity"**
5. Clique em **"Deploy"**
6. Confirme a transação no MetaMask
7. Aguarde confirmação (alguns segundos)

### 8. Copie o Endereço do Contrato

Após o deploy bem-sucedido:

1. No painel "Deployed Contracts", você verá o contrato
2. Clique para expandir
3. Copie o **endereço do contrato** (começa com `0x...`)

### 9. Configure no Frontend

1. Abra o arquivo `.env` na raiz do projeto
2. Adicione:
   ```env
   NEXT_PUBLIC_ARC_POA_ADDRESS=0x... (endereço copiado)
   ```
3. Salve o arquivo
4. Reinicie o servidor Next.js (`npm run dev`)

### 10. Verificar no ArcScan

1. Acesse: https://testnet.arcscan.app
2. Cole o endereço do contrato na busca
3. Você verá o contrato deployado

## ✅ Checklist

- [ ] Remix IDE aberto
- [ ] Contrato criado e código colado
- [ ] Contrato compilado com sucesso
- [ ] MetaMask configurado para Arc Testnet
- [ ] ETH na carteira (Arc Testnet)
- [ ] Deploy executado
- [ ] Endereço do contrato copiado
- [ ] `.env` configurado com `NEXT_PUBLIC_ARC_POA_ADDRESS`
- [ ] Servidor Next.js reiniciado

## 🆘 Problemas Comuns

### "Compilation failed"
- Verifique se selecionou Solidity 0.8.20 ou superior
- Verifique se copiou TODO o código do contrato

### "Insufficient funds"
- Obtenha ETH na Arc Testnet
- Verifique se está na rede correta

### "Network not found"
- Adicione a rede Arc Testnet manualmente no MetaMask
- Verifique Chain ID: 5042002

### "Transaction failed"
- Verifique se tem ETH suficiente
- Tente aumentar o gas limit no MetaMask

## 📝 Após Deploy

O contrato estará ativo e pronto para uso! Você pode:

1. **Testar no Remix:**
   - Use as funções `proveWalletConnection()`, etc.
   - Veja os eventos emitidos

2. **Usar no Frontend:**
   - O hook `useArcPoA` já está pronto
   - Configure `NEXT_PUBLIC_ARC_POA_ADDRESS` e use!

## 🔗 Links Úteis

- **Remix IDE:** https://remix.ethereum.org
- **Arc Testnet Explorer:** https://testnet.arcscan.app
- **RPC URL:** https://rpc.testnet.arc.network

---

**Dica:** Remix IDE é a forma mais simples e não requer instalação local! 🚀
