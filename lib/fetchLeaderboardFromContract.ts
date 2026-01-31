/**
 * @file fetchLeaderboardFromContract.ts
 * @description Busca o leaderboard diretamente do contrato ArcLeaderboard on-chain
 * Usa getUsersCount, getUserAt, getScore
 */

import { ethers } from 'ethers'
import { ARC_LEADERBOARD_ABI } from './abis/arc-leaderboard'

const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS ||
  process.env.REGISTRY_CONTRACT_ADDRESS ||
  '0x7461Fc5EAf38693e98B06B042e37b4adF1453AbD'

const RPC_URL =
  process.env.NEXT_PUBLIC_ARC_RPC ||
  process.env.ARC_RPC_URL ||
  'https://rpc.testnet.arc.network'

export interface LeaderboardEntry {
  address: string
  score: number
  rank?: number
}

export async function fetchLeaderboardFromContract(): Promise<LeaderboardEntry[]> {
  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ARC_LEADERBOARD_ABI, provider)

  const totalUsers = await contract.getUsersCount()

  const data: LeaderboardEntry[] = []

  for (let i = 0; i < Number(totalUsers); i++) {
    const user = await contract.getUserAt(i)
    const score = await contract.getScore(user)

    data.push({
      address: user,
      score: Number(score),
    })
  }

  data.sort((a, b) => b.score - a.score)

  return data.map((e, i) => ({ ...e, rank: i + 1 }))
}
