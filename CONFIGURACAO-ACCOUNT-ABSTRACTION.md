# 🔐 Configuração de Account Abstraction (ERC-4337) - Arc Testnet

Guia completo para configurar o ambiente de desenvolvimento com Account Abstraction para registro automático no leaderboard.

## 📋 Pré-requisitos

### 1. Instalar Dependências

```bash
npm install viem ethers
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Arc Testnet Configuration
ARC_RPC_URL=https://rpc.testnet.arc.network

# Private Key para Account Abstraction
# IMPORTANTE: Nunca commite este arquivo com chaves reais!
# Use apenas para desenvolvimento. Em produção, use gerenciamento seguro de chaves.
PRIVATE_KEY=sua_private_key_aqui

# Leaderboard Registry Contract
REGISTRY_CONTRACT_ADDRESS=0x... (endereço do contrato deployado)
NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS=0x... (mesmo endereço, para uso no cliente)

# ERC-4337 Configuration
NEXT_PUBLIC_BUNDLER_URL=https://rpc.testnet.arc.network
NEXT_PUBLIC_PAYMASTER_URL=https://... (URL do Paymaster - opcional)
NEXT_PUBLIC_PAYMASTER_ADDRESS=0x... (Endereço do Paymaster - opcional)
NEXT_PUBLIC_ENTRY_POINT_ADDRESS=0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
```

## 🎯 Funcionalidades Implementadas

### 1. **Detecção Automática de Endereço Específico**
- Detecta quando o endereço `0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2` está conectado
- Verifica automaticamente se é Smart Account
- Verifica se já está registrado no leaderboard

### 2. **Registro Automático via UserOperation**
- Se não estiver registrado, cria automaticamente uma UserOperation
- Chama a função `register()` do contrato LeaderboardRegistry
- Usa Paymaster para pagar taxas em USDC (0.004 USDC aproximadamente)
- Salva status no estado global do app

### 3. **Estado Global de Registro**
- Context `RegistrationProvider` gerencia estado global
- Persiste status de registro após sucesso
- Exibe status no site

## 🔧 Como Funciona

### Fluxo de Registro Automático

1. **Usuário conecta carteira** → `handleConnect()`
2. **Sistema detecta endereço específico** → `isTargetAddressConnected()`
3. **Verifica se é Smart Account** → `checkAccount()`
4. **Verifica se está registrado** → `checkLeaderboardRegistration()`
5. **Se não estiver registrado:**
   - Cria UserOperation com `callData` da função `register()`
   - Obtém dados do Paymaster (USDC)
   - Assina UserOperation via MetaMask
   - Envia para bundler
   - Aguarda confirmação
   - Atualiza estado global

### Estrutura de UserOperation

```typescript
{
  sender: "0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2", // Smart Account
  to: "0x...", // Endereço do contrato LeaderboardRegistry
  callData: "0x4a39e2d1", // Função register() encoded
  value: 0,
  paymasterAndData: "0x...", // Paymaster USDC
  // Taxas pagas em USDC: ~0.004 USDC
}
```

## 📝 Arquivos Criados/Modificados

### Novos Arquivos

1. **`lib/leaderboard-registration.ts`**
   - `checkLeaderboardRegistration()` - Verifica registro
   - `registerLeaderboardViaUserOperation()` - Registra via UserOperation
   - `isTargetAddressConnected()` - Detecta endereço específico

2. **`contexts/registration-context.tsx`**
   - `RegistrationProvider` - Context para estado global
   - `useRegistration()` - Hook para usar estado de registro

3. **`.env.example`**
   - Template de variáveis de ambiente

### Arquivos Modificados

1. **`app/layout.tsx`**
   - Adicionado `RegistrationProvider` para estado global

2. **`components/wallet-card.tsx`**
   - Adicionado `useEffect` para detecção e registro automático
   - Integração com `useRegistration()` e `useUserOperation()`

## 🚀 Uso no Código

### Verificar Status de Registro

```typescript
import { useRegistration } from '@/contexts/registration-context'

function MyComponent() {
  const { isRegistered, isChecking, checkRegistration } = useRegistration()

  useEffect(() => {
    if (address) {
      checkRegistration(address)
    }
  }, [address, checkRegistration])

  return (
    <div>
      {isChecking ? (
        <p>Verificando...</p>
      ) : isRegistered ? (
        <p>✅ Registrado no leaderboard</p>
      ) : (
        <p>❌ Não registrado</p>
      )}
    </div>
  )
}
```

### Registrar Manualmente

```typescript
import { useRegistration } from '@/contexts/registration-context'

function RegisterButton() {
  const { registerViaUserOperation, isRegistering } = useRegistration()

  const handleRegister = async () => {
    try {
      const userOpHash = await registerViaUserOperation(address)
      console.log('UserOperation Hash:', userOpHash)
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  return (
    <button onClick={handleRegister} disabled={isRegistering}>
      {isRegistering ? 'Registrando...' : 'Registrar no Leaderboard'}
    </button>
  )
}
```

## 🔍 Verificação de Registro

### Via Contrato

```typescript
import { checkLeaderboardRegistration } from '@/lib/leaderboard-registration'

const isRegistered = await checkLeaderboardRegistration('0x...')
console.log('Registrado?', isRegistered)
```

### Via API

```typescript
const response = await fetch(`/api/check-registration?address=${address}`)
const data = await response.json()
console.log('Registrado?', data.isRegistered)
```

## ⚙️ Configuração do Paymaster

### Encontrar Paymaster na Arc Testnet

1. **ArcScan:**
   - Acesse https://testnet.arcscan.app
   - Procure por "Paymaster" ou contratos verificados
   - Verifique contratos que aceitam USDC

2. **Documentação:**
   - Consulte documentação oficial da Arc Network
   - Verifique se há Paymaster padrão

### Paymaster é Opcional

- Se não configurado, UserOperations funcionam sem Paymaster
- Taxas serão pagas em ETH normalmente
- Sistema detecta e funciona em ambos os casos

## 📊 Estrutura de Dados

### Estado Global (Context)

```typescript
{
  isRegistered: boolean | null,      // Status de registro
  isChecking: boolean,                 // Verificando registro
  isRegistering: boolean,             // Registrando via UserOperation
  registrationHash: string | null,    // Hash da UserOperation
  error: string | null,               // Erro (se houver)
}
```

## ✅ Checklist de Configuração

- [ ] `viem` e `ethers` instalados
- [ ] Arquivo `.env.local` criado com `PRIVATE_KEY`
- [ ] `REGISTRY_CONTRACT_ADDRESS` configurado
- [ ] `NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS` configurado
- [ ] `NEXT_PUBLIC_BUNDLER_URL` configurado
- [ ] `NEXT_PUBLIC_PAYMASTER_URL` configurado (opcional)
- [ ] `NEXT_PUBLIC_PAYMASTER_ADDRESS` configurado (opcional)
- [ ] Contrato LeaderboardRegistry deployado
- [ ] Smart Account criada para endereço `0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2`

## 🆘 Troubleshooting

### "Private Key not found"
- Verifique se `PRIVATE_KEY` está no `.env.local`
- Certifique-se de que o arquivo não está sendo commitado

### "Registry contract address not configured"
- Configure `REGISTRY_CONTRACT_ADDRESS` no `.env.local`
- Verifique se o contrato foi deployado

### "Address is not a Smart Account"
- Verifique se o endereço é realmente uma Smart Account
- Use `checkIsSmartAccount()` para verificar

### "UserOperation failed"
- Verifique se tem saldo suficiente
- Verifique se está na rede correta (Arc Testnet)
- Verifique logs do console para mais detalhes

### "Paymaster error"
- Verifique `NEXT_PUBLIC_PAYMASTER_URL` e `NEXT_PUBLIC_PAYMASTER_ADDRESS`
- Paymaster é opcional - sistema funciona sem ele

## 🔗 Links Úteis

- **Arc Testnet Explorer:** https://testnet.arcscan.app
- **RPC URL:** https://rpc.testnet.arc.network
- **Chain ID:** 5042002
- **ERC-4337 Spec:** https://eips.ethereum.org/EIPS/eip-4337

---

**Account Abstraction** - Registro automático com taxas em USDC! 🚀
