/**
 * @file useUserOperation.ts
 * @description Hook React simplificado para User Operations (ERC-4337)
 * 
 * Funciona com carteiras conectadas (MetaMask) e detecta Smart Accounts automaticamente
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { type Address, type Hex, isAddress } from 'viem'
import {
  sendUserOperationRPC,
  createCheckInUserOperation,
  createContractCallUserOperation,
  checkIsSmartAccount,
  getSmartAccountNonce,
} from '@/lib/user-operation'
import { getAccounts } from '@/lib/wallet'

interface UseUserOperationReturn {
  // Estado
  isSmartAccount: boolean
  isLoading: boolean
  error: string | null

  // Funções
  sendCheckIn: () => Promise<Hex>
  sendTransaction: (to: Address, callData?: Hex, value?: bigint) => Promise<Hex>
  sendContractCall: (contractAddress: Address, functionData: Hex, value?: bigint) => Promise<Hex>
  checkAccount: (address: Address) => Promise<void>
}

/**
 * Hook para usar User Operations (ERC-4337) com Smart Accounts
 * 
 * Uso:
 *   const { sendCheckIn, isSmartAccount, isLoading } = useUserOperation();
 *   
 *   // Verificar se é Smart Account
 *   useEffect(() => {
 *     checkAccount(address);
 *   }, [address]);
 *   
 *   // Check-in simples
 *   if (isSmartAccount) {
 *     await sendCheckIn();
 *   }
 */
export function useUserOperation(): UseUserOperationReturn {
  const [isSmartAccount, setIsSmartAccount] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null)

  // Verificar se endereço é Smart Account
  const checkAccount = useCallback(async (address: Address) => {
    if (!isAddress(address)) {
      setIsSmartAccount(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const isSA = await checkIsSmartAccount(address)
      setIsSmartAccount(isSA)
      setCurrentAddress(address)
      
      if (isSA) {
        console.log('✅ Smart Account detectada:', address)
      } else {
        console.log('ℹ️ Conta tradicional (não é Smart Account):', address)
      }
    } catch (err: any) {
      console.error('Erro ao verificar Smart Account:', err)
      setError(err.message)
      setIsSmartAccount(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Enviar check-in (callData vazio)
  const sendCheckIn = useCallback(async (): Promise<Hex> => {
    if (!currentAddress) {
      throw new Error('Nenhum endereço conectado')
    }

    if (!isSmartAccount) {
      throw new Error('Endereço não é uma Smart Account')
    }

    setIsLoading(true)
    setError(null)

    try {
      // Obter nonce
      const nonce = await getSmartAccountNonce(currentAddress)

      // Criar User Operation de check-in (com assinatura)
      const userOp = await createCheckInUserOperation(currentAddress, nonce, currentAddress)

      // Enviar User Operation
      const userOpHash = await sendUserOperationRPC(userOp)

      console.log('✅ Check-in enviado:', userOpHash)
      return userOpHash
    } catch (err: any) {
      console.error('Erro ao enviar check-in:', err)
      setError(err.message || 'Erro ao enviar check-in')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [currentAddress, isSmartAccount])

  // Enviar transação genérica
  const sendTransaction = useCallback(
    async (to: Address, callData: Hex = '0x' as Hex, value: bigint = 0n): Promise<Hex> => {
      if (!currentAddress) {
        throw new Error('Nenhum endereço conectado')
      }

      if (!isSmartAccount) {
        throw new Error('Endereço não é uma Smart Account')
      }

      setIsLoading(true)
      setError(null)

      try {
        const nonce = await getSmartAccountNonce(currentAddress)

        // Se callData vazio, usar check-in
        if (callData === '0x' || callData === '') {
          const userOp = await createCheckInUserOperation(currentAddress, nonce)
          const userOpHash = await sendUserOperationRPC(userOp)
          return userOpHash
        }

        // Caso contrário, criar User Operation para chamada de contrato
        const userOp = await createContractCallUserOperation(
          currentAddress,
          to,
          callData,
          nonce,
          value,
          currentAddress // Assinar com endereço atual
        )

        const userOpHash = await sendUserOperationRPC(userOp)
        return userOpHash
      } catch (err: any) {
        console.error('Erro ao enviar transação:', err)
        setError(err.message || 'Erro ao enviar transação')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [currentAddress, isSmartAccount]
  )

  // Enviar chamada de contrato
  const sendContractCall = useCallback(
    async (contractAddress: Address, functionData: Hex, value: bigint = 0n): Promise<Hex> => {
      if (!currentAddress) {
        throw new Error('Nenhum endereço conectado')
      }

      if (!isSmartAccount) {
        throw new Error('Endereço não é uma Smart Account')
      }

      setIsLoading(true)
      setError(null)

      try {
        const nonce = await getSmartAccountNonce(currentAddress)

        const userOp = await createContractCallUserOperation(
          currentAddress,
          contractAddress,
          functionData,
          nonce,
          value,
          currentAddress // Assinar com endereço atual
        )

        const userOpHash = await sendUserOperationRPC(userOp)
        
        console.log('✅ Chamada de contrato enviada:', userOpHash)
        return userOpHash
      } catch (err: any) {
        console.error('Erro ao chamar contrato:', err)
        setError(err.message || 'Erro ao chamar contrato')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [currentAddress, isSmartAccount]
  )

  // Auto-verificar quando carteira conecta
  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await getAccounts()
          if (accounts && accounts.length > 0) {
            await checkAccount(accounts[0] as Address)
          }
        } catch (err) {
          // Silencioso - carteira não conectada
        }
      }
    }

    checkWallet()
    
    // Verificar quando conta mudar
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', checkWallet)
      return () => {
        window.ethereum?.removeListener('accountsChanged', checkWallet)
      }
    }
  }, [checkAccount])

  return {
    isSmartAccount,
    isLoading,
    error,
    sendCheckIn,
    sendTransaction,
    sendContractCall,
    checkAccount,
  }
}
