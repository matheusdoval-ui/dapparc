'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  type Address,
  type Hash,
} from 'viem'
import { LEADERBOARD_ABI } from '@/lib/abis/leaderboard'
import { LEADERBOARD_GAME_CONTRACT, ARC_TESTNET } from '@/lib/game-config'

const chain = {
  id: ARC_TESTNET.id,
  name: ARC_TESTNET.name,
  nativeCurrency: ARC_TESTNET.nativeCurrency,
  rpcUrls: { default: { url: ARC_TESTNET.rpcUrls.default.http[0] } },
} as const

export type RecordGameStatus = 'idle' | 'pending' | 'confirming' | 'success' | 'error'

export function useRecordGame() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [status, setStatus] = useState<RecordGameStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [lastTxHash, setLastTxHash] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setIsConnected(false)
      setAddress(null)
      return
    }
    const check = async () => {
      try {
        const accounts = (await window.ethereum!.request({ method: 'eth_accounts' })) as string[]
        const ok = Array.isArray(accounts) && accounts.length > 0
        setIsConnected(ok)
        setAddress(ok && accounts[0] ? accounts[0].toLowerCase() : null)
      } catch {
        setIsConnected(false)
        setAddress(null)
      }
    }
    check()
    const onAccounts = () => check()
    window.ethereum?.on?.('accountsChanged', onAccounts)
    return () => {
      window.ethereum?.removeListener?.('accountsChanged', onAccounts)
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
    setLastTxHash(null)
  }, [])

  const recordGame = useCallback(
    async (score: number) => {
      if (typeof window === 'undefined' || !window.ethereum) {
        setError('Wallet or contract not available')
        setStatus('error')
        return
      }
      if (!LEADERBOARD_GAME_CONTRACT) {
        setError(
          'Leaderboard contract not configured. Set NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS in .env.local (local) and in Vercel → Settings → Environment Variables, then redeploy.',
        )
        setStatus('error')
        return
      }
      if (score <= 0 || !Number.isInteger(score)) {
        setError('Invalid score')
        setStatus('error')
        return
      }
      setError(null)
      setStatus('pending')
      console.log('Contract address:', LEADERBOARD_GAME_CONTRACT)
      try {
        const client = createWalletClient({
          chain,
          transport: custom(window.ethereum),
        })
        const [account] = await client.getAddresses()
        if (!account) {
          await client.requestAddresses()
          const [acc] = await client.getAddresses()
          if (!acc) {
            setError('No wallet account')
            setStatus('error')
            return
          }
        }
        const hash = await client.writeContract({
          address: LEADERBOARD_GAME_CONTRACT as Address,
          abi: LEADERBOARD_ABI,
          functionName: 'submitScore',
          args: [BigInt(score)],
          account: (await client.getAddresses())[0]!,
        })
        setStatus('confirming')
        const publicClient = createPublicClient({
          chain,
          transport: http(ARC_TESTNET.rpcUrls.default.http[0]),
        })
        await publicClient.waitForTransactionReceipt({ hash: hash as Hash })
        setStatus('success')
        setLastTxHash(hash as string)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('leaderboard-updated'))
        }
      } catch (err: unknown) {
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Failed to submit score')
      }
    },
    [],
  )

  return { isConnected, address, recordGame, status, error, lastTxHash, reset }
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      on?: (event: string, cb: () => void) => void
      removeListener?: (event: string, cb: () => void) => void
    }
  }
}
