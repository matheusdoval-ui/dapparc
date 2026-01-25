# 🔐 Smart Account (ERC-4337) - Implementação Completa

Sistema completo para Smart Accounts com Paymaster USDC na Arc Testnet.

## ✅ O que foi implementado

### 1. **Detecção Automática de Smart Accounts**
- Função `checkIsSmartAccount()` verifica se endereço é contrato
- Hook `useUserOperation` detecta automaticamente ao conectar carteira

### 2. **User Operations (ERC-4337)**
- `sendUserOperationRPC()` - Envia User Operations via bundler
- `createCheckInUserOperation()` - Cria check-in (callData vazio)
- `createContractCallUserOperation()` - Cria chamada de contrato real
- `getSmartAccountNonce()` - Obtém nonce da Smart Account

### 3. **Paymaster USDC**
- `getPaymasterData()` - Obtém dados do Paymaster para pagar taxas em USDC
- Configurável via variáveis de ambiente

### 4. **Assinatura de User Operations**
- `signUserOperation()` - Assina via MetaMask
- Suporta `eth_sign` e `personal_sign`

### 5. **Integração Automática**
- `registerQueryAsTransaction()` atualizado para detectar Smart Accounts
- Usa User Operations automaticamente quando detectado

## 📦 Arquivos Criados

### Bibliotecas
- `lib/user-operation.ts` - Funções principais para User Operations
- `lib/user-operation-helpers.ts` - Helpers (hash, formatação)
- `lib/smart-account.ts` - Referência (para uso futuro com permissionless.js)

### Hooks React
- `hooks/useUserOperation.ts` - Hook principal para usar Smart Accounts
- `hooks/useSmartAccount.ts` - Referência (para uso futuro)

### Documentação
- `SMART-ACCOUNT-SETUP.md` - Guia de configuração
- `EXEMPLO-SMART-ACCOUNT.md` - Exemplos de uso
- `SMART-ACCOUNT-README.md` - Este arquivo

## 🚀 Como Usar

### 1. Instalar Dependências

```bash
npm install viem
```

### 2. Configurar Variáveis de Ambiente

```env
# Bundler (pode ser o RPC da Arc Testnet)
NEXT_PUBLIC_BUNDLER_URL=https://rpc.testnet.arc.network

# Paymaster USDC (opcional - obter endereço no ArcScan)
NEXT_PUBLIC_PAYMASTER_URL=https://...
NEXT_PUBLIC_PAYMASTER_ADDRESS=0x...

# EntryPoint (padrão ERC-4337)
NEXT_PUBLIC_ENTRY_POINT_ADDRESS=0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
```

### 3. Usar no Código

```typescript
import { useUserOperation } from '@/hooks/useUserOperation'

const { 
  isSmartAccount, 
  sendCheckIn, 
  sendContractCall,
  checkAccount 
} = useUserOperation()

// Verificar se é Smart Account
await checkAccount(address)

// Check-in simples (callData vazio)
if (isSmartAccount) {
  await sendCheckIn()
}
```

## 🎯 Funcionalidades

### Check-in Simples (callData vazio)

```typescript
// callData = "0x" = check-in
await sendCheckIn()
```

**Resultado:**
- User Operation enviada para próprio endereço
- callData vazio (0x)
- Taxas pagas em USDC via Paymaster

### Chamada de Contrato Real

```typescript
import { encodeFunctionData, parseAbi } from 'viem'

const abi = parseAbi(['function myFunction(uint256) external'])
const functionData = encodeFunctionData({
  abi,
  functionName: 'myFunction',
  args: [123],
})

await sendContractCall(contractAddress, functionData)
```

## 📊 Estrutura de User Operation

Baseado na imagem do explorador:

```typescript
{
  sender: "0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2", // Smart Account
  to: "0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2",     // Próprio endereço (check-in)
  callData: "0x",                                        // Vazio = check-in
  value: 0,
  paymasterAndData: "0x...",                             // Paymaster USDC
  // Taxas pagas em USDC: 0.004032047540577 USDC
}
```

## 🔧 Configuração do Paymaster

### Encontrar Paymaster na Arc Testnet

1. **ArcScan:**
   - https://testnet.arcscan.app
   - Procure por "Paymaster" ou contratos verificados

2. **Documentação Arc Network:**
   - Verifique se há Paymaster padrão

3. **Deploy próprio (opcional):**
   - Se necessário, faça deploy de Paymaster customizado

### Paymaster é Opcional

- Se não configurado, User Operations funcionam sem Paymaster
- Taxas serão pagas em ETH normalmente
- Sistema detecta e funciona em ambos os casos

## ⚡ Integração Automática

A função `registerQueryAsTransaction()` foi atualizada:

```typescript
// Automaticamente detecta Smart Account e usa User Operation
await registerQueryAsTransaction()
```

**Comportamento:**
- **Smart Account detectada:** Usa User Operation (check-in)
- **Conta tradicional:** Usa transação normal (self-transfer)

## 🎨 Exemplo: Componente Completo

```typescript
'use client'

import { useUserOperation } from '@/hooks/useUserOperation'
import { useEffect, useState } from 'react'
import { getAccounts } from '@/lib/wallet'

export function SmartAccountIntegration() {
  const { 
    isSmartAccount, 
    sendCheckIn, 
    isLoading,
    checkAccount 
  } = useUserOperation()
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const accounts = await getAccounts()
      if (accounts && accounts.length > 0) {
        const addr = accounts[0]
        setAddress(addr)
        await checkAccount(addr as `0x${string}`)
      }
    }
    load()
  }, [checkAccount])

  // Check-in automático quando detectar Smart Account
  useEffect(() => {
    if (isSmartAccount && address) {
      sendCheckIn()
        .then((hash) => console.log('✅ Check-in:', hash))
        .catch((err) => console.warn('⚠️ Check-in não enviado:', err))
    }
  }, [isSmartAccount, address, sendCheckIn])

  return (
    <div>
      {isSmartAccount ? (
        <div className="text-emerald-600">
          ✅ Smart Account - Taxas em USDC
        </div>
      ) : (
        <div className="text-muted-foreground">
          ℹ️ Conta tradicional - Taxas em ETH
        </div>
      )}
    </div>
  )
}
```

## 📝 Notas Importantes

1. **Assinatura:**
   - User Operations precisam ser assinadas
   - Atualmente usa `eth_sign` ou `personal_sign` via MetaMask
   - Em produção, considere usar um serviço de gerenciamento de chaves

2. **Bundler:**
   - Pode usar o RPC da Arc Testnet como bundler
   - Ou configurar um bundler dedicado

3. **Paymaster:**
   - Opcional mas recomendado para taxas em USDC
   - Configure `NEXT_PUBLIC_PAYMASTER_URL` e `NEXT_PUBLIC_PAYMASTER_ADDRESS`

4. **callData vazio:**
   - `0x` = check-in simples
   - Qualquer outro valor = chamada de contrato real

## 🔗 Links Úteis

- **Arc Testnet Explorer:** https://testnet.arcscan.app
- **RPC URL:** https://rpc.testnet.arc.network
- **Chain ID:** 5042002
- **ERC-4337 Spec:** https://eips.ethereum.org/EIPS/eip-4337

---

**Smart Accounts** - Taxas em USDC, experiência melhorada! 🚀
