# 🔐 Configuração Smart Account (ERC-4337) - Arc Testnet

Guia para configurar Smart Accounts com Paymaster USDC na Arc Testnet.

## 📋 Pré-requisitos

### 1. Instalar Dependências

```bash
npm install permissionless pimlico-permissionless viem
```

### 2. Configurar Variáveis de Ambiente

Adicione ao `.env`:

```env
# Arc Testnet
ARC_RPC_URL=https://rpc.testnet.arc.network

# Bundler (pode ser o mesmo RPC ou um bundler dedicado)
NEXT_PUBLIC_BUNDLER_URL=https://rpc.testnet.arc.network

# Paymaster (USDC)
NEXT_PUBLIC_PAYMASTER_URL=https://... (URL do Paymaster)
NEXT_PUBLIC_PAYMASTER_ADDRESS=0x... (Endereço do Paymaster)

# EntryPoint (ERC-4337 padrão)
NEXT_PUBLIC_ENTRY_POINT_ADDRESS=0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
```

## 🎯 Como Funciona

### Detecção Automática

O sistema detecta automaticamente se o endereço conectado é uma Smart Account:

- **Smart Account detectada:** Usa User Operations (ERC-4337)
- **Conta tradicional:** Usa transações normais

### Check-in Simples

Quando `callData` é vazio (`0x`), o sistema trata como check-in:

```typescript
// Check-in automático (callData vazio)
await sendCheckIn()
```

### Chamadas de Contrato

Para chamadas reais de contrato:

```typescript
// Chamar função de contrato
await sendContractCall(contractAddress, functionData)
```

## 💻 Uso no Código

### Hook: `useUserOperation`

```typescript
import { useUserOperation } from '@/hooks/useUserOperation'

function MyComponent() {
  const { 
    isSmartAccount, 
    sendCheckIn, 
    sendContractCall,
    isLoading 
  } = useUserOperation()

  // Verificar se é Smart Account ao conectar
  useEffect(() => {
    if (address) {
      checkAccount(address)
    }
  }, [address])

  // Check-in quando necessário
  const handleCheckIn = async () => {
    if (isSmartAccount) {
      await sendCheckIn()
    }
  }

  return (
    <div>
      {isSmartAccount ? (
        <p>✅ Smart Account detectada - Taxas em USDC</p>
      ) : (
        <p>ℹ️ Conta tradicional - Taxas em ETH</p>
      )}
    </div>
  )
}
```

### Integração Automática

A função `registerQueryAsTransaction` já foi atualizada para detectar Smart Accounts automaticamente:

```typescript
// Automaticamente usa User Operation se for Smart Account
await registerQueryAsTransaction()
```

## 🔧 Configuração do Paymaster

### Encontrar Paymaster na Arc Testnet

1. **Verificar no ArcScan:**
   - Acesse https://testnet.arcscan.app
   - Procure por contratos Paymaster
   - Verifique contratos verificados

2. **Verificar na documentação:**
   - Consulte documentação oficial da Arc Network
   - Verifique se há Paymaster padrão na testnet

3. **Deploy próprio (opcional):**
   - Se necessário, faça deploy de um Paymaster customizado
   - Configure para aceitar USDC como pagamento de gas

### Exemplo de Paymaster

Um Paymaster típico na Arc Testnet pode ter:
- **Endereço:** `0x...` (verificar no ArcScan)
- **URL:** Endpoint RPC do Paymaster
- **Token:** USDC (para pagamento de taxas)

## 📊 Estrutura de User Operation

Baseado na imagem do explorador:

```typescript
{
  sender: "0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2", // Smart Account
  to: "0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2",     // Próprio endereço
  callData: "0x",                                        // Vazio = check-in
  value: 0,
  // Paymaster paga taxas em USDC
  paymasterAndData: "0x...", // Dados do Paymaster
}
```

## 🎨 Exemplo Completo

```typescript
'use client'

import { useUserOperation } from '@/hooks/useUserOperation'
import { useEffect, useState } from 'react'
import { getAccounts } from '@/lib/wallet'

export function SmartAccountCard() {
  const { 
    isSmartAccount, 
    sendCheckIn, 
    isLoading,
    checkAccount 
  } = useUserOperation()
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    const loadAccount = async () => {
      const accounts = await getAccounts()
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0])
        await checkAccount(accounts[0] as `0x${string}`)
      }
    }
    loadAccount()
  }, [checkAccount])

  const handleCheckIn = async () => {
    try {
      const userOpHash = await sendCheckIn()
      console.log('Check-in enviado:', userOpHash)
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold mb-2">Smart Account</h3>
      
      {isSmartAccount ? (
        <div className="space-y-2">
          <p className="text-sm text-emerald-600">✅ Smart Account detectada</p>
          <p className="text-xs text-muted-foreground">
            Taxas pagas em USDC via Paymaster
          </p>
          <button 
            onClick={handleCheckIn}
            disabled={isLoading}
            className="..."
          >
            {isLoading ? 'Enviando...' : 'Check-in'}
          </button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Conta tradicional (não é Smart Account)
        </p>
      )}
    </div>
  )
}
```

## ⚙️ Configuração Avançada

### Customizar Gas Limits

```typescript
// Em user-operation.ts, ajuste os valores:
callGasLimit: 21000n,        // Gas para execução
verificationGasLimit: 100000n, // Gas para verificação
preVerificationGas: 21000n,   // Gas pré-verificação
```

### Customizar Paymaster

```typescript
// Em user-operation.ts, função getPaymasterData:
// Customize a lógica de obtenção de dados do Paymaster
```

## 🔍 Debugging

### Verificar se é Smart Account

```typescript
import { checkIsSmartAccount } from '@/lib/user-operation'

const isSA = await checkIsSmartAccount('0x...')
console.log('É Smart Account?', isSA)
```

### Verificar Nonce

```typescript
import { getSmartAccountNonce } from '@/lib/user-operation'

const nonce = await getSmartAccountNonce('0x...')
console.log('Nonce:', nonce.toString())
```

### Ver User Operation no Explorer

Após enviar uma User Operation, você pode verificar no ArcScan:
- Acesse: https://testnet.arcscan.app
- Procure pelo hash da User Operation
- Veja detalhes: taxas em USDC, callData, etc.

## 📝 Notas Importantes

1. **Paymaster é opcional:**
   - Se não configurado, User Operations funcionam sem Paymaster
   - Taxas serão pagas em ETH normalmente

2. **Detecção automática:**
   - O sistema detecta Smart Accounts automaticamente
   - Não precisa configurar manualmente

3. **Compatibilidade:**
   - Funciona com contas tradicionais (fallback)
   - Funciona com Smart Accounts (User Operations)

4. **callData vazio:**
   - `0x` = check-in simples
   - Qualquer outro valor = chamada de contrato real

## 🆘 Troubleshooting

### "Bundler not found"
- Verifique `NEXT_PUBLIC_BUNDLER_URL`
- Pode usar o RPC da Arc Testnet como bundler

### "Paymaster error"
- Verifique `NEXT_PUBLIC_PAYMASTER_URL` e `NEXT_PUBLIC_PAYMASTER_ADDRESS`
- Paymaster é opcional - sistema funciona sem ele

### "User Operation failed"
- Verifique se tem saldo suficiente
- Verifique se está na rede correta (Arc Testnet)
- Verifique logs do console para mais detalhes

---

**Smart Accounts** - Taxas em USDC, experiência melhorada! 🚀
