# 💡 Exemplo de Integração: Smart Account (ERC-4337)

## 🎯 Integração no WalletCard

Adicione ao `components/wallet-card.tsx`:

```typescript
'use client'

import { useUserOperation } from '@/hooks/useUserOperation'
// ... outros imports

export function WalletCard() {
  const { 
    isSmartAccount, 
    sendCheckIn, 
    isLoading: isUOLoading,
    checkAccount 
  } = useUserOperation()
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  // Verificar se é Smart Account ao conectar
  useEffect(() => {
    if (isConnected && walletAddress) {
      checkAccount(walletAddress as `0x${string}`)
    }
  }, [isConnected, walletAddress, checkAccount])

  // Ao conectar carteira, fazer check-in se for Smart Account
  useEffect(() => {
    if (isConnected && isSmartAccount && walletAddress) {
      // Check-in silencioso (não bloquear UX)
      sendCheckIn().catch((err) => {
        console.warn('Check-in não enviado:', err.message)
      })
    }
  }, [isConnected, isSmartAccount, walletAddress, sendCheckIn])

  return (
    <div>
      {/* Indicador de Smart Account */}
      {isSmartAccount && (
        <div className="mb-2 rounded-lg border border-arc-accent/20 bg-arc-accent/5 p-2 text-xs">
          <span className="text-arc-accent">✅ Smart Account</span>
          <span className="text-muted-foreground ml-2">Taxas em USDC</span>
        </div>
      )}

      {/* ... resto do componente */}
    </div>
  )
}
```

## 🔧 Configuração do Paymaster

### Variáveis de Ambiente

```env
# Bundler (pode ser o RPC da Arc Testnet)
NEXT_PUBLIC_BUNDLER_URL=https://rpc.testnet.arc.network

# Paymaster USDC (obter endereço no ArcScan)
NEXT_PUBLIC_PAYMASTER_URL=https://... (URL do Paymaster)
NEXT_PUBLIC_PAYMASTER_ADDRESS=0x... (Endereço do Paymaster)

# EntryPoint (padrão ERC-4337)
NEXT_PUBLIC_ENTRY_POINT_ADDRESS=0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
```

### Encontrar Paymaster na Arc Testnet

1. **ArcScan:**
   - Acesse https://testnet.arcscan.app
   - Procure por "Paymaster" ou "USDC Paymaster"
   - Verifique contratos verificados

2. **Documentação:**
   - Consulte documentação oficial da Arc Network
   - Verifique se há Paymaster padrão

## 📝 Exemplo: Check-in Automático

```typescript
import { useUserOperation } from '@/hooks/useUserOperation'

function AutoCheckIn() {
  const { isSmartAccount, sendCheckIn, checkAccount } = useUserOperation()
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    // Obter endereço conectado
    const loadAddress = async () => {
      const accounts = await getAccounts()
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0])
        await checkAccount(accounts[0] as `0x${string}`)
      }
    }
    loadAddress()
  }, [checkAccount])

  useEffect(() => {
    // Check-in automático quando detectar Smart Account
    if (isSmartAccount && address) {
      sendCheckIn()
        .then((hash) => console.log('Check-in:', hash))
        .catch((err) => console.warn('Erro:', err))
    }
  }, [isSmartAccount, address, sendCheckIn])

  return null // Componente silencioso
}
```

## 🎨 Exemplo: Componente de Status

```typescript
'use client'

import { useUserOperation } from '@/hooks/useUserOperation'
import { CheckCircle2, Wallet } from 'lucide-react'

export function SmartAccountStatus() {
  const { isSmartAccount, isLoading, checkAccount } = useUserOperation()
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const accounts = await getAccounts()
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0])
        await checkAccount(accounts[0] as `0x${string}`)
      }
    }
    load()
  }, [checkAccount])

  if (!address) return null

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <Wallet className="h-4 w-4" />
        <span className="text-sm font-semibold">Tipo de Conta</span>
      </div>
      
      {isLoading ? (
        <p className="text-xs text-muted-foreground mt-1">Verificando...</p>
      ) : isSmartAccount ? (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-emerald-600">Smart Account</span>
          <span className="text-muted-foreground">(Taxas em USDC)</span>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground mt-1">
          Conta tradicional (Taxas em ETH)
        </p>
      )}
    </div>
  )
}
```

## 🔄 Integração com Arc PoA

```typescript
import { useUserOperation } from '@/hooks/useUserOperation'
import { useArcPoA } from '@/hooks/useArcPoA'

function CombinedActivity() {
  const { isSmartAccount, sendCheckIn } = useUserOperation()
  const { proveWalletConnection } = useArcPoA()

  const handleActivity = async () => {
    if (isSmartAccount) {
      // Smart Account: User Operation
      await sendCheckIn()
    } else {
      // Conta tradicional: Arc PoA
      await proveWalletConnection()
    }
  }

  return <button onClick={handleActivity}>Provar Atividade</button>
}
```

## ⚡ Uso Rápido

### 1. Verificar se é Smart Account

```typescript
const { isSmartAccount, checkAccount } = useUserOperation()

await checkAccount('0x...')
console.log('É Smart Account?', isSmartAccount)
```

### 2. Enviar Check-in

```typescript
const { sendCheckIn } = useUserOperation()

const userOpHash = await sendCheckIn()
console.log('User Operation Hash:', userOpHash)
```

### 3. Chamar Contrato

```typescript
const { sendContractCall } = useUserOperation()
const { encodeFunctionData } = require('viem')

// Encodar função
const functionData = encodeFunctionData({
  abi: [...],
  functionName: 'myFunction',
  args: [...],
})

// Enviar
await sendContractCall(contractAddress, functionData)
```

## 📊 Estrutura de Dados

Baseado na imagem do explorador:

```typescript
{
  // User Operation
  sender: "0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2", // Smart Account
  to: "0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2",     // Próprio endereço
  callData: "0x",                                        // Vazio = check-in
  value: 0,
  
  // Paymaster
  paymasterAndData: "0x...", // Dados do Paymaster USDC
  
  // Taxas
  transactionFee: "0.004032047540577 USDC", // Taxa paga em USDC
}
```

## ✅ Checklist

- [ ] `viem` instalado (`npm install viem`)
- [ ] Variáveis de ambiente configuradas
- [ ] Paymaster encontrado/configurado (opcional)
- [ ] Hook `useUserOperation` importado
- [ ] Verificação de Smart Account implementada
- [ ] Check-in ou chamadas de contrato funcionando

---

**Smart Accounts** - Experiência melhorada com taxas em USDC! 🚀
