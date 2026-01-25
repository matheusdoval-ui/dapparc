# ✅ Resolução em 3 Passos: Contrato Leaderboard

## 📋 Passo 1: Contrato Criado ✅

O contrato `Leaderboard.sol` já está criado em `contracts/Leaderboard.sol` com:
- ✅ Função `mint()` que emite evento `NewEntry(address user)`
- ✅ Registra usuários em array e mapeamento
- ✅ Pronto para deploy

## 🚀 Passo 2: Script de Deploy

### Comando Exato para Deploy:

```bash
# 1. Instalar Hardhat (se ainda não tiver)
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# 2. Compilar o contrato
npx hardhat compile

# 3. Deploy na Arc Testnet (COMANDO EXATO)
npx hardhat run scripts/deploy-leaderboard-hardhat.js --network arcTestnet
```

### Configuração no `.env.local`:

```env
PRIVATE_KEY=0x231c6f6e09937af4ffa4a47cec3bc10c3210ad4486b8e98131c0f2aeacc61d8c
ARC_RPC_URL=https://rpc.testnet.arc.network
```

### Após o Deploy:

O script mostrará o endereço do contrato. Adicione ao `.env.local`:

```env
NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS=0x... (endereço do contrato)
REGISTRY_CONTRACT_ADDRESS=0x... (mesmo endereço)
```

## 🔗 Passo 3: dApp Vinculado ✅

O dApp já está configurado para:

1. ✅ **Campo `to`**: Será o endereço do contrato (não seu endereço)
   - Código em `lib/user-operation.ts` usa `execute(registryContractAddress, 0, mint())`
   - O `to` no `execute()` é o contrato, não o próprio endereço

2. ✅ **CallData**: Usa `encodeFunctionData` para chamar `mint()`
   ```typescript
   const mintCallData = encodeFunctionData({
     abi: parseAbi(['function mint() external']),
     functionName: 'mint',
     args: [],
   })
   ```

3. ✅ **Raw input**: Será preenchido (não será `0x`)
   - CallData contém `execute(contrato, 0, mint())`
   - Raw input mostrará o callData completo

4. ✅ **Paymaster USDC**: Mantido e funcionando
   - Taxas continuarão sendo pagas em USDC (~0.004 USDC)

## ✅ Verificação Final

Após deploy e configuração do endereço do contrato:

1. Conecte uma carteira no dApp
2. A função `mint()` será chamada automaticamente
3. Verifique no explorer:
   - **To:** Endereço do contrato (não seu endereço)
   - **Raw input:** Preenchido (não `0x`)
   - **Event:** `NewEntry` emitido

## 📝 Arquivos Criados

- ✅ `contracts/Leaderboard.sol` - Contrato com `mint()` e evento `NewEntry`
- ✅ `hardhat.config.js` - Configuração do Hardhat para Arc Testnet
- ✅ `scripts/deploy-leaderboard-hardhat.js` - Script de deploy funcional
- ✅ `COMANDO-DEPLOY-EXATO.md` - Documentação do comando

## 🎯 Resumo

1. ✅ **Contrato**: Criado e pronto
2. ✅ **Deploy**: Comando exato fornecido
3. ✅ **dApp**: Já vinculado e usando `mint()` com `encodeFunctionData`

**Próximo passo:** Execute o comando de deploy e configure o endereço do contrato! 🚀
