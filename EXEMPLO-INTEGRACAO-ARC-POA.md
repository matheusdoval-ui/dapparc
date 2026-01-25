# 🔌 Exemplo de Integração: Arc Proof of Activity

Este documento mostra como integrar o Arc PoA no seu dApp.

## 📦 Instalação

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variável de ambiente:**
```env
NEXT_PUBLIC_ARC_POA_ADDRESS=0x... (endereço do contrato após deploy)
```

## 🎯 Integração no WalletCard

### Opção 1: Integração Automática (Recomendada)

Adicione ao `components/wallet-card.tsx`:

```typescript
'use client'

import { useArcPoA } from '@/hooks/useArcPoA'
// ... outros imports

export function WalletCard() {
  const { proveWalletConnection, canProve, userActivityCount } = useArcPoA()
  const [isConnected, setIsConnected] = useState(false)
  const [hasProvenThisSession, setHasProvenThisSession] = useState(false)

  // Quando conectar carteira, provar atividade automaticamente
  useEffect(() => {
    if (isConnected && canProve && !hasProvenThisSession) {
      // Provar silenciosamente (não bloquear UX)
      proveWalletConnection()
        .then(() => {
          setHasProvenThisSession(true)
          console.log('✅ Atividade provada on-chain!')
        })
        .catch((err) => {
          // Silencioso - não mostrar erro ao usuário
          console.warn('Não foi possível provar atividade:', err.message)
        })
    }
  }, [isConnected, canProve, hasProvenThisSession, proveWalletConnection])

  // ... resto do componente

  return (
    <div>
      {/* Mostrar contador de atividades (opcional) */}
      {userActivityCount > 0 && (
        <div className="text-xs text-muted-foreground">
          {userActivityCount} atividades provadas on-chain
        </div>
      )}
      {/* ... resto do UI */}
    </div>
  )
}
```

### Opção 2: Integração Manual (Botão)

```typescript
'use client'

import { useArcPoA } from '@/hooks/useArcPoA'

export function WalletCard() {
  const { 
    proveWalletConnection, 
    canProve, 
    isLoading,
    blocksRemaining,
    userActivityCount 
  } = useArcPoA()

  return (
    <div>
      {/* Botão para provar atividade manualmente */}
      {canProve ? (
        <button 
          onClick={proveWalletConnection}
          disabled={isLoading}
          className="..."
        >
          {isLoading ? 'Provando...' : 'Provar Atividade'}
        </button>
      ) : (
        <div className="text-xs text-muted-foreground">
          Aguarde {blocksRemaining} blocos para provar novamente
        </div>
      )}

      {/* Contador */}
      <div className="text-sm">
        Atividades: {userActivityCount}
      </div>
    </div>
  )
}
```

## 🎨 Exemplo Completo: Componente de Status

```typescript
'use client'

import { useArcPoA } from '@/hooks/useArcPoA'
import { CheckCircle2, Clock, Activity } from 'lucide-react'

export function ArcPoAStatus() {
  const { 
    canProve, 
    blocksRemaining, 
    userActivityCount,
    isLoading 
  } = useArcPoA()

  if (isLoading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="h-4 w-4 text-arc-accent" />
        <span className="font-semibold">Arc Proof of Activity</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Atividades provadas:</span>
          <span className="font-semibold">{userActivityCount}</span>
        </div>

        {canProve ? (
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Pronto para provar atividade</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <Clock className="h-4 w-4" />
            <span>Aguarde {blocksRemaining} blocos</span>
          </div>
        )}
      </div>
    </div>
  )
}
```

## 🔄 Integração com Outros Eventos

### Provar ao Visualizar Transações

```typescript
import { useArcPoA } from '@/hooks/useArcPoA'

function TransactionViewer() {
  const { proveViewTransactions, canProve } = useArcPoA()

  const handleViewTransactions = async () => {
    // Sua lógica de visualização
    await loadTransactions()

    // Provar atividade
    if (canProve) {
      await proveViewTransactions()
    }
  }

  return <button onClick={handleViewTransactions}>Ver Transações</button>
}
```

### Provar ao Usar dApp

```typescript
import { useArcPoA } from '@/hooks/useArcPoA'

function DAppFeature() {
  const { proveUsedDApp, canProve } = useArcPoA()

  const handleUseFeature = async () => {
    // Sua lógica do dApp
    await executeFeature()

    // Provar atividade
    if (canProve) {
      await proveUsedDApp()
    }
  }

  return <button onClick={handleUseFeature}>Usar Feature</button>
}
```

## 📊 Dashboard: Mostrar Estatísticas

```typescript
'use client'

import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ARC_POA_ADDRESS || ''
const ABI = [
  'function getGlobalStats() external view returns (uint256, uint256, uint256)',
  'event ActivityProved(address indexed user, bytes32 indexed context, uint256 blockNumber, uint256 activityIndex, uint256 userActivityCount)',
]

export function ArcPoADashboard() {
  const [stats, setStats] = useState({ totalWallets: 0, totalActivities: 0 })

  useEffect(() => {
    const loadStats = async () => {
      if (!CONTRACT_ADDRESS) return

      const provider = new ethers.JsonRpcProvider('https://rpc.testnet.arc.network')
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider)

      const [totalWallets, totalActivities] = await contract.getGlobalStats()
      setStats({
        totalWallets: Number(totalWallets),
        totalActivities: Number(totalActivities),
      })
    }

    loadStats()
    const interval = setInterval(loadStats, 60000) // Atualizar a cada minuto
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-lg border p-4">
        <div className="text-sm text-muted-foreground">Carteiras Ativas</div>
        <div className="text-2xl font-bold">{stats.totalWallets.toLocaleString()}</div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="text-sm text-muted-foreground">Total de Atividades</div>
        <div className="text-2xl font-bold">{stats.totalActivities.toLocaleString()}</div>
      </div>
    </div>
  )
}
```

## ⚡ Boas Práticas

### 1. UX Silenciosa

```typescript
// ✅ BOM: Provar silenciosamente
proveWalletConnection().catch(() => {
  // Não mostrar erro ao usuário
})

// ❌ RUIM: Bloquear UX com loading
const [isProving, setIsProving] = useState(false)
await proveWalletConnection() // Bloqueia UI
```

### 2. Uma Prova por Sessão

```typescript
const [hasProvenThisSession, setHasProvenThisSession] = useState(false)

useEffect(() => {
  if (isConnected && canProve && !hasProvenThisSession) {
    proveWalletConnection().then(() => {
      setHasProvenThisSession(true)
    })
  }
}, [isConnected, canProve, hasProvenThisSession])
```

### 3. Tratamento de Erros

```typescript
try {
  await proveWalletConnection()
} catch (error: any) {
  if (error.message.includes('Too soon')) {
    // Usuário tentou provar muito cedo - ignorar silenciosamente
    return
  }
  // Outros erros podem ser logados
  console.error('Erro ao provar atividade:', error)
}
```

### 4. Verificação Antes de Provar

```typescript
const { canProve, blocksRemaining } = useArcPoA()

if (!canProve) {
  // Não tentar provar - economiza gas
  console.log(`Aguarde ${blocksRemaining} blocos`)
  return
}

await proveWalletConnection()
```

## 🎯 Checklist de Integração

- [ ] Contrato deployado na Arc Testnet
- [ ] `NEXT_PUBLIC_ARC_POA_ADDRESS` configurado
- [ ] Hook `useArcPoA` importado
- [ ] Integração no `WalletCard` (automática ou manual)
- [ ] Tratamento de erros implementado
- [ ] UX silenciosa (não bloquear app)
- [ ] Uma prova por sessão (opcional, mas recomendado)

## 📝 Notas

- **Gas Cost:** ~45,000 gas por prova (muito barato!)
- **Anti-Spam:** 600 blocos entre provas (≈ 2 horas)
- **Event-Driven:** Dados via eventos, não storage
- **Preparado para:** Dashboards, métricas, programas de incentivos

---

**Arc Proof of Activity** - Integração simples e eficiente! 🚀
