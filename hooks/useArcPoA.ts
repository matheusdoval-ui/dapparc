/**
 * @file useArcPoA.ts
 * @description Hook React para interagir com o contrato ArcProofOfActivity
 * 
 * Uso:
 *   const { proveActivity, canProve, isLoading } = useArcPoA();
 *   
 *   // Quando conectar carteira
 *   useEffect(() => {
 *     if (isConnected && canProve) {
 *       proveActivity('wallet_connected');
 *     }
 *   }, [isConnected, canProve]);
 */

import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'

// Endereço do contrato (será preenchido após deploy)
const ARC_POA_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ARC_POA_ADDRESS || ''

// ABI mínimo do contrato (apenas funções necessárias)
const ARC_POA_ABI = [
  'function proveActivity(bytes32 context) external',
  'function proveWalletConnection() external',
  'function proveViewTransactions() external',
  'function proveUsedDApp() external',
  'function canProveActivity(address user) external view returns (bool canProve, uint256 blocksRemaining)',
  'function getUserInfo(address user) external view returns (uint64 lastBlock, uint32 count, bool isActive)',
  'function getGlobalStats() external view returns (uint256 totalWallets, uint256 totalActivities, uint256 minBlocksBetweenProofs)',
  'event ActivityProved(address indexed user, bytes32 indexed context, uint256 blockNumber, uint256 activityIndex, uint256 userActivityCount)',
  'event NewActiveWallet(address indexed user, uint256 totalWallets)',
] as const

// Contextos pré-computados
const CONTEXTS = {
  WALLET_CONNECTED: ethers.keccak256(ethers.toUtf8Bytes('wallet_connected')),
  VIEW_TRANSACTIONS: ethers.keccak256(ethers.toUtf8Bytes('view_transactions')),
  USED_DAPP: ethers.keccak256(ethers.toUtf8Bytes('used_dapp')),
} as const

type ActivityContext = 'wallet_connected' | 'view_transactions' | 'used_dapp'

interface UseArcPoAReturn {
  proveActivity: (context: ActivityContext) => Promise<void>
  proveWalletConnection: () => Promise<void>
  proveViewTransactions: () => Promise<void>
  proveUsedDApp: () => Promise<void>
  canProve: boolean
  blocksRemaining: number
  userActivityCount: number
  isLoading: boolean
  error: string | null
}

export function useArcPoA(): UseArcPoAReturn {
  const [canProve, setCanProve] = useState(false)
  const [blocksRemaining, setBlocksRemaining] = useState(0)
  const [userActivityCount, setUserActivityCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Obter provider e signer
  const getProviderAndSigner = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask ou carteira Web3 não encontrada')
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    return { provider, signer }
  }, [])

  // Verificar se pode provar atividade
  const checkCanProve = useCallback(async (address: string) => {
    if (!ARC_POA_CONTRACT_ADDRESS || !address) {
      setCanProve(false)
      return
    }

    try {
      const { provider } = await getProviderAndSigner()
      const contract = new ethers.Contract(ARC_POA_CONTRACT_ADDRESS, ARC_POA_ABI, provider)
      
      const [canProveResult, blocksRemainingResult] = await contract.canProveActivity(address)
      setCanProve(canProveResult)
      setBlocksRemaining(Number(blocksRemainingResult))

      // Obter contador de atividades do usuário
      const [lastBlock, count, isActive] = await contract.getUserInfo(address)
      setUserActivityCount(Number(count))
    } catch (err) {
      console.error('Erro ao verificar se pode provar atividade:', err)
      setCanProve(false)
    }
  }, [getProviderAndSigner])

  // Provar atividade genérica
  const proveActivity = useCallback(async (context: ActivityContext) => {
    if (!ARC_POA_CONTRACT_ADDRESS) {
      setError('Endereço do contrato não configurado')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { signer } = await getProviderAndSigner()
      const contract = new ethers.Contract(ARC_POA_CONTRACT_ADDRESS, ARC_POA_ABI, signer)
      
      let contextHash: string
      switch (context) {
        case 'wallet_connected':
          contextHash = CONTEXTS.WALLET_CONNECTED
          break
        case 'view_transactions':
          contextHash = CONTEXTS.VIEW_TRANSACTIONS
          break
        case 'used_dapp':
          contextHash = CONTEXTS.USED_DAPP
          break
        default:
          throw new Error(`Contexto inválido: ${context}`)
      }

      const tx = await contract.proveActivity(contextHash)
      console.log('📝 Transação enviada:', tx.hash)
      
      await tx.wait()
      console.log('✅ Atividade provada com sucesso!')

      // Atualizar estado após sucesso
      const address = await signer.getAddress()
      await checkCanProve(address)
    } catch (err: any) {
      console.error('Erro ao provar atividade:', err)
      setError(err.message || 'Erro ao provar atividade')
    } finally {
      setIsLoading(false)
    }
  }, [getProviderAndSigner, checkCanProve])

  // Funções de conveniência
  const proveWalletConnection = useCallback(() => proveActivity('wallet_connected'), [proveActivity])
  const proveViewTransactions = useCallback(() => proveActivity('view_transactions'), [proveActivity])
  const proveUsedDApp = useCallback(() => proveActivity('used_dapp'), [proveActivity])

  // Auto-verificar quando a carteira estiver conectada
  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const accounts = await provider.listAccounts()
          if (accounts.length > 0) {
            await checkCanProve(accounts[0].address)
          }
        } catch (err) {
          // Silencioso - carteira não conectada
        }
      }
    }

    checkWallet()
    
    // Verificar periodicamente
    const interval = setInterval(checkWallet, 30000) // A cada 30s
    return () => clearInterval(interval)
  }, [checkCanProve])

  return {
    proveActivity,
    proveWalletConnection,
    proveViewTransactions,
    proveUsedDApp,
    canProve,
    blocksRemaining,
    userActivityCount,
    isLoading,
    error,
  }
}
