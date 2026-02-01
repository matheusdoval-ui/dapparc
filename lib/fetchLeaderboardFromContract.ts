/**
 * @file fetchLeaderboardFromContract.ts
 * @description Fetches leaderboard directly from ArcLeaderboard contract.
 * Arc network does NOT support ENS. Provider uses ensAddress: null; only raw 0x addresses.
 */

import { ethers } from 'ethers'
import { ARC_LEADERBOARD_ABI } from './abis/arc-leaderboard'

const RPC_URL =
  process.env.NEXT_PUBLIC_ARC_RPC ||
  process.env.ARC_RPC_URL ||
  'https://rpc.testnet.arc.network'

/** Arc network does not support ENS — disable entirely */
const ARC_NETWORK = {
  name: 'arc',
  chainId: 5042002,
  ensAddress: null as string | null,
}

export interface LeaderboardEntry {
  address: string
  score: number
  rank?: number
}

export async function fetchLeaderboardFromContract(): Promise<LeaderboardEntry[]> {
  const leaderboardAddress =
    process.env.NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS ||
    process.env.REGISTRY_CONTRACT_ADDRESS ||
    '0x7461Fc5EAf38693e98B06B042e37b4adF1453AbD'

  if (!leaderboardAddress || !leaderboardAddress.startsWith('0x')) {
    throw new Error(
      'Invalid leaderboard contract address. Set NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS. Arc network does not support ENS.'
    )
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL, ARC_NETWORK)
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

  data.sort((a, b) => b.score - a.score)
  return data.map((e, i) => ({ ...e, rank: i + 1 }))
}
