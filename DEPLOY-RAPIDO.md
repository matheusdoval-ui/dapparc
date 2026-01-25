# ⚡ Deploy Rápido - Arc Proof of Activity

## 🎯 Método Mais Simples: Remix IDE

### 1. Abra Remix
https://remix.ethereum.org

### 2. Crie arquivo `ArcProofOfActivity.sol`
Cole TODO o código de `contracts/ArcProofOfActivity.sol`

### 3. Compile
- Aba "Solidity Compiler"
- Versão: **0.8.20**
- Clique "Compile"

### 4. Configure MetaMask
Adicione rede Arc Testnet:
- **Network Name:** Arc Testnet
- **RPC URL:** https://rpc.testnet.arc.network
- **Chain ID:** 5042002
- **Currency:** ETH
- **Explorer:** https://testnet.arcscan.app

### 5. Deploy
- Aba "Deploy & Run"
- Environment: **Injected Provider - MetaMask**
- Contract: **ArcProofOfActivity**
- Clique **"Deploy"**
- Confirme no MetaMask

### 6. Copie o endereço
Após deploy, copie o endereço do contrato

### 7. Configure no `.env`
```env
NEXT_PUBLIC_ARC_POA_ADDRESS=0x... (endereço copiado)
```

## ✅ Pronto!

O contrato está deployado e pronto para uso!

---

**Dúvidas?** Veja `DEPLOY-REMIX-IDE.md` para guia completo.
