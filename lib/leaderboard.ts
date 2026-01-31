/**
 * @file leaderboard.ts
 * @description Dedicated leaderboard fetcher — uses JsonRpcProvider ONLY (never BrowserProvider).
 * Immune to wallet connection state. Reads directly from ArcLeaderboard contract.
 */

import { ethers } from 'ethers'
import { ARC_LEADERBOARD_ABI } from './abis/arc-leaderboard'

// JsonRpcProvider only — never BrowserProvider (immune to wallet state)
const provider = new ethers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_ARC_RPC || 'https://rpc.testnet.arc.network'
)

const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS ||
  process.env.REGISTRY_CONTRACT_ADDRESS ||
  '0x7461Fc5EAf38693e98B06B042e37b4adF1453AbD'

const contract = new ethers.Contract(CONTRACT_ADDRESS, ARC_LEADERBOARD_ABI, provider)

export interface LeaderboardEntry {
  address: string
  score: number
  rank?: number
}

export async function loadLeaderboard(): Promise<LeaderboardEntry[]> {
  const totalUsers = await contract.getUsersCount()

  const data: LeaderboardEntry[] = []

  for (let i = 0; i < Number(totalUsers); i++) {
    const user = await contract.getUserAt(i)
    const score = await contract.getScore(user)

    data.push({ address: user, score: Number(score) })
  }

  const sorted = data.sort((a, b) => b.score - a.score)

  return sorted.map((e, i) => ({ ...e, rank: i + 1 }))
}
