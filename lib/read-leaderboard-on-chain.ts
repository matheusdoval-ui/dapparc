/**
 * Reads leaderboard directly from chain using getAllPlayers() + scores(addr).
 * No events, no Supabase required.
 */

import { createPublicClient, http } from 'viem'
import { LEADERBOARD_CONTRACT_ADDRESS } from './leaderboard-contract-address'
import { ARC_TESTNET } from './game-config'
import { LEADERBOARD_ABI } from './abis/leaderboard'

const RPC_URL = process.env.RPC_URL || ARC_TESTNET.rpcUrls.default.http[0]
const TOP_N = 50

export interface OnChainLeaderboardEntry {
  wallet: string
  bestScore: number
}

export interface LeaderboardOnChainResult {
  entries: OnChainLeaderboardEntry[]
  totalPlayers: number
}

export async function readLeaderboardOnChain(): Promise<LeaderboardOnChainResult> {
  const CONTRACT_ADDRESS = LEADERBOARD_CONTRACT_ADDRESS
  if (!CONTRACT_ADDRESS || !CONTRACT_ADDRESS.startsWith('0x')) {
    console.error('read-leaderboard-on-chain: NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS not set')
    return { entries: [], totalPlayers: 0 }
  }

  const address = CONTRACT_ADDRESS as `0x${string}`
  const client = createPublicClient({
    chain: {
      id: ARC_TESTNET.id,
      name: ARC_TESTNET.name,
      nativeCurrency: ARC_TESTNET.nativeCurrency,
      rpcUrls: { default: { http: [RPC_URL] } },
    },
    transport: http(RPC_URL),
  })

  let addresses: `0x${string}`[]
  try {
    addresses = await client.readContract({
      address,
      abi: LEADERBOARD_ABI,
      functionName: 'getAllPlayers',
    }) as `0x${string}`[]
  } catch (err) {
    console.error('read-leaderboard-on-chain getAllPlayers error:', err)
    return { entries: [], totalPlayers: 0 }
  }

  if (!addresses?.length) {
    return { entries: [], totalPlayers: 0 }
  }

  const players = await Promise.all(
    addresses.map(async (addr) => {
      const score = await client.readContract({
        address,
        abi: LEADERBOARD_ABI,
        functionName: 'scores',
        args: [addr],
      })
      return { address: addr, score: Number(score) }
    }),
  )

  const entries = players
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N)
    .map((p) => ({ wallet: p.address, bestScore: p.score }))

  return {
    entries,
    totalPlayers: addresses.length,
  }
}
