/**
 * Reads bestScore(address) directly from the leaderboard contract.
 */

import { createPublicClient, http } from 'viem'
import { LEADERBOARD_ABI } from './abis/leaderboard'
import { LEADERBOARD_CONTRACT_ADDRESS } from './leaderboard-contract-address'
import { ARC_TESTNET } from './game-config'

const RPC_URL = process.env.RPC_URL || ARC_TESTNET.rpcUrls.default.http[0]

export async function readBestScoreOnChain(walletAddress: string): Promise<number | null> {
  const CONTRACT_ADDRESS = LEADERBOARD_CONTRACT_ADDRESS
  if (!CONTRACT_ADDRESS || !CONTRACT_ADDRESS.startsWith('0x')) {
    return null
  }

  const address = walletAddress.trim()
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return null
  }

  const client = createPublicClient({
    chain: {
      id: ARC_TESTNET.id,
      name: ARC_TESTNET.name,
      nativeCurrency: ARC_TESTNET.nativeCurrency,
      rpcUrls: { default: { http: [RPC_URL] } },
    },
    transport: http(RPC_URL),
  })

  try {
    const score = await client.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: LEADERBOARD_ABI,
      functionName: 'bestScore',
      args: [address as `0x${string}`],
    })
    return Number(score)
  } catch {
    return null
  }
}
