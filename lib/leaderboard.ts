/**
 * @file leaderboard.ts
 * @description Dedicated leaderboard fetcher — uses JsonRpcProvider ONLY (never BrowserProvider).
 * Arc network does NOT support ENS. Provider is configured with ensAddress: null.
 * Only raw 0x addresses are used.
 */

import { ethers } from 'ethers'
import { ARC_LEADERBOARD_ABI } from './abis/arc-leaderboard'

const RPC_URL =
  process.env.NEXT_PUBLIC_ARC_RPC ||
  process.env.ARC_RPC_URL ||
  'https://rpc.testnet.arc.network'

/** Arc network does not support ENS — disable it entirely */
const ARC_NETWORK = {
  name: 'arc',
  chainId: 5042002,
  ensAddress: null as string | null,
}

function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(RPC_URL, ARC_NETWORK)
}

function getLeaderboardAddress(): string {
  const address =
    process.env.NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS ||
    process.env.REGISTRY_CONTRACT_ADDRESS ||
    '0x7461Fc5EAf38693e98B06B042e37b4adF1453AbD'

  if (!address || typeof address !== 'string' || !address.startsWith('0x')) {
    throw new Error(
      'Invalid leaderboard contract address. Set NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS to a valid 0x address. Arc network does not support ENS.'
    )
  }

  return address
}

export interface LeaderboardEntry {
  address: string
  score: number
  rank?: number
}

export async function loadLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const leaderboardAddress = getLeaderboardAddress()
    const provider = getProvider()
    const contract = new ethers.Contract(
      leaderboardAddress,
      ARC_LEADERBOARD_ABI,
      provider
    )

    const totalUsers = await contract.getUsersCount()
    const data: LeaderboardEntry[] = []

    for (let i = 0; i < Number(totalUsers); i++) {
      const user = await contract.getUserAt(i)
      const score = await contract.getScore(user)
      data.push({ address: user, score: Number(score) })
    }

    const sorted = data.sort((a, b) => b.score - a.score)
    return sorted.map((e, i) => ({ ...e, rank: i + 1 }))
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (/ENS|ens|resolveName|lookupAddress/i.test(msg)) {
      throw new Error(
        'Arc network does not support ENS. Ensure NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS is a raw 0x address.'
      )
    }
    throw err
  }
}
