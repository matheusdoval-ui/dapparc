# 🎯 Arc Proof of Activity (PoA)

Sistema on-chain nativo e diferenciado para provar atividade de usuários na **Arc Network Testnet**.

## 📋 Conceito

O **Arc Proof of Activity (PoA)** é um sistema leve, gas-otimizado e event-driven que permite:

- ✅ **Prova pública on-chain** de cada interação do usuário
- ✅ **Verificável** por qualquer um (via eventos)
- ✅ **Barato** (sem NFTs, sem storage pesado)
- ✅ **Anti-spam** (1 prova por endereço a cada 600 blocos)
- ✅ **Preparado para dashboards** e programas de incentivos

### Por que não NFTs?

- NFTs são caros em gas (ERC721/ERC1155)
- Não precisamos de transferibilidade
- Eventos são suficientes para tracking
- Mais eficiente para métricas e analytics

## 🏗️ Arquitetura

### Smart Contract: `ArcProofOfActivity.sol`

**Características:**
- Solidity ^0.8.20
- Event-driven (eventos são a fonte de verdade)
- Gas otimizado (uint32/uint64, sem strings, sem loops)
- Anti-spam (600 blocos ≈ 2 horas entre provas)

**Storage:**
```solidity
mapping(address => uint64) lastActivityBlock;  // Último bloco de atividade
mapping(address => uint32) activityCount;      // Contador por usuário
uint256 totalActiveWallets;                    // Total de carteiras únicas
uint256 totalActivities;                      // Total de atividades
```

**Função Principal:**
```solidity
function proveActivity(bytes32 context) external
```

**Contextos Suportados:**
- `keccak256("wallet_connected")` - Carteira conectada
- `keccak256("view_transactions")` - Visualizou transações
- `keccak256("used_dapp")` - Usou o dApp

**Eventos:**
```solidity
event ActivityProved(
    address indexed user,
    bytes32 indexed context,
    uint256 blockNumber,
    uint256 activityIndex,
    uint256 userActivityCount
);

event NewActiveWallet(
    address indexed user,
    uint256 totalWallets
);
```

## 🚀 Deploy

### Pré-requisitos

1. **Instalar dependências:**
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install dotenv
```

2. **Configurar `.env`:**
```env
PRIVATE_KEY=sua_chave_privada
ARC_RPC_URL=https://rpc.testnet.arc.network
```

3. **Compilar:**
```bash
npx hardhat compile
```

4. **Deploy:**
```bash
npx hardhat run scripts/deploy-arc-poa.js --network arcTestnet
```

### Após Deploy

1. **Salvar endereço do contrato**
2. **Configurar no frontend:**
```env
NEXT_PUBLIC_ARC_POA_ADDRESS=0x... (endereço do contrato)
```

3. **Verificar no ArcScan (opcional):**
```bash
npx hardhat verify --network arcTestnet <CONTRACT_ADDRESS>
```

## 💻 Uso no Frontend

### Hook React: `useArcPoA`

```typescript
import { useArcPoA } from '@/hooks/useArcPoA'

function MyComponent() {
  const { 
    proveWalletConnection, 
    canProve, 
    isLoading,
    userActivityCount 
  } = useArcPoA()

  // Quando conectar carteira
  useEffect(() => {
    if (isConnected && canProve) {
      proveWalletConnection()
    }
  }, [isConnected, canProve])

  return (
    <div>
      <p>Atividades provadas: {userActivityCount}</p>
      {canProve && (
        <button onClick={proveWalletConnection} disabled={isLoading}>
          Provar Atividade
        </button>
      )}
    </div>
  )
}
```

### Integração com Wallet Card

No componente `WalletCard`, adicione:

```typescript
import { useArcPoA } from '@/hooks/useArcPoA'

export function WalletCard() {
  const { proveWalletConnection, canProve } = useArcPoA()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (isConnected && canProve) {
      // Provar silenciosamente (não bloquear UX)
      proveWalletConnection().catch(console.error)
    }
  }, [isConnected, canProve, proveWalletConnection])

  // ... resto do componente
}
```

## 📊 Leitura de Dados

### Via Eventos (Recomendado)

```typescript
import { ethers } from 'ethers'

const provider = new ethers.JsonRpcProvider('https://rpc.testnet.arc.network')
const contract = new ethers.Contract(contractAddress, ABI, provider)

// Filtrar eventos
const filter = contract.filters.ActivityProved()
const events = await contract.queryFilter(filter, fromBlock, toBlock)

// Processar eventos
events.forEach(event => {
  console.log('Usuário:', event.args.user)
  console.log('Contexto:', event.args.context)
  console.log('Bloco:', event.args.blockNumber)
})
```

### Via Funções View

```typescript
// Estatísticas globais
const stats = await contract.getGlobalStats()
console.log('Total Wallets:', stats.totalWallets)
console.log('Total Activities:', stats.totalActivities)

// Info do usuário
const userInfo = await contract.getUserInfo(userAddress)
console.log('Atividades do usuário:', userInfo.count)
```

## 🎯 Casos de Uso

### 1. Dashboard de Métricas

```typescript
// Contar atividades por contexto
const walletConnectedEvents = await contract.queryFilter(
  contract.filters.ActivityProved(null, CONTEXT_WALLET_CONNECTED)
)

console.log('Conexões de carteira:', walletConnectedEvents.length)
```

### 2. Programa de Incentivos

```typescript
// Verificar elegibilidade baseado em atividades
const userInfo = await contract.getUserInfo(userAddress)
if (userInfo.count >= 10) {
  // Usuário elegível para recompensa
}
```

### 3. Analytics

```typescript
// Calcular taxa de retenção
const newWallets = await contract.queryFilter(
  contract.filters.NewActiveWallet()
)

const totalWallets = await contract.totalActiveWallets()
const retentionRate = (totalWallets / newWallets.length) * 100
```

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# Deploy
PRIVATE_KEY=sua_chave_privada
ARC_RPC_URL=https://rpc.testnet.arc.network

# Frontend
NEXT_PUBLIC_ARC_POA_ADDRESS=0x... (endereço do contrato deployado)
```

### Hardhat Config

Já configurado em `hardhat.config.js`:
- Network: `arcTestnet`
- Chain ID: `5042002`
- RPC: `https://rpc.testnet.arc.network`

## 📈 Gas Costs

**Estimativas (Arc Testnet):**

- `proveActivity()`: ~45,000 gas
- `proveWalletConnection()`: ~45,000 gas
- `canProveActivity()`: ~2,000 gas (view)
- `getUserInfo()`: ~2,000 gas (view)

**Otimizações aplicadas:**
- ✅ uint32/uint64 em vez de uint256
- ✅ Sem strings (apenas bytes32)
- ✅ Sem loops
- ✅ Storage mínimo

## 🔒 Segurança

### Anti-Spam

- **600 blocos** entre provas (≈ 2 horas)
- Previne spam de transações
- Mantém gas costs baixos

### Validações

- Verifica se passou tempo suficiente desde última prova
- Primeira atividade sempre permitida
- Eventos indexados para queries eficientes

## 📝 ABI do Contrato

O ABI completo está disponível após compilação em:
```
artifacts/contracts/ArcProofOfActivity.sol/ArcProofOfActivity.json
```

Ou use o ABI mínimo em `hooks/useArcPoA.ts`.

## 🔗 Links Úteis

- **Arc Network Testnet Explorer:** https://testnet.arcscan.app
- **RPC URL:** https://rpc.testnet.arc.network
- **Chain ID:** 5042002
- **Documentação Hardhat:** https://hardhat.org/docs

## 🎓 Conceito Técnico

### Por que Event-Driven?

1. **Eficiência:** Eventos são logs, não storage
2. **Escalabilidade:** Queries por índice são rápidas
3. **Transparência:** Qualquer um pode verificar
4. **Flexibilidade:** Dashboards podem processar eventos

### Por que não ERC721?

- ERC721 adiciona ~50k+ gas por mint
- Não precisamos de transferibilidade
- Eventos são suficientes para tracking
- Mais barato e eficiente

### Preparado para o Futuro

O contrato está preparado para:
- ✅ Dashboards de métricas (ArcTX, etc)
- ✅ Programas de incentivos da Arc
- ✅ Analytics e analytics
- ✅ Integração com outros dApps

## 🆘 Troubleshooting

### Erro: "Too soon to prove activity again"
- Aguarde 600 blocos (≈ 2 horas)
- Ou use outro endereço para testes

### Erro: "Contract address not configured"
- Configure `NEXT_PUBLIC_ARC_POA_ADDRESS` no `.env`
- Reinicie o servidor Next.js

### Eventos não aparecem
- Verifique se a transação foi confirmada
- Use `queryFilter` com range de blocos correto
- Verifique se está na rede correta (Arc Testnet)

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do contrato no ArcScan
2. Consulte a documentação da Arc Network
3. Revise os eventos emitidos

---

**Arc Proof of Activity** - Prova pública, verificável e barata de atividade on-chain na Arc Network 🚀
