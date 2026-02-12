/**
 * @file leaderboard-add-points.ts
 * @description Server-side only. Signs addPoints via owner private key.
 * Never expose OWNER_PRIVATE_KEY to client.
 */

import { ethers } from 'ethers'
import { ARC_LEADERBOARD_ABI } from './abis/arc-leaderboard'

const RPC_URL =
  process.env.ARC_RPC_URL ||
  process.env.NEXT_PUBLIC_ARC_RPC ||
  'https://rpc.testnet.arc.network'

const CONTRACT_ADDRESS =
  process.env.REGISTRY_CONTRACT_ADDRESS ||
  process.env.NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS ||
  '0x7461Fc5EAf38693e98B06B042e37b4adF1453AbD'

const ARC_NETWORK = {
  name: 'arc' as const,
  chainId: 5042002,
  ensAddress: null as string | null,
}

function getSigner(): ethers.Wallet {
  const pk =
    process.env.LEADERBOARD_OWNER_PRIVATE_KEY ||
    process.env.OWNER_PRIVATE_KEY ||
    process.env.PRIVATE_KEY

  if (!pk || typeof pk !== 'string' || !pk.startsWith('0x')) {
    throw new Error(
      'LEADERBOARD_OWNER_PRIVATE_KEY (or OWNER_PRIVATE_KEY) is required for addPoints. Set in .env.local'
    )
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL, ARC_NETWORK)
  return new ethers.Wallet(pk, provider)
}

/**
 * Calls addPoints(user, amount) on ArcLeaderboard as owner.
 * Server-side only.
 */
export async function addPointsOnChain(
  user: string,
  amount: bigint | number
): Promise<string> {
  if (!ethers.isAddress(user)) {
    throw new Error('Invalid user address')
  }
  const amt = typeof amount === 'number' ? BigInt(amount) : amount
  if (amt <= 0n) {
    throw new Error('Amount must be positive')
  }

  const signer = getSigner()
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    ARC_LEADERBOARD_ABI,
    signer
  )

  const tx = await contract.addPoints(user, amt)
  await tx.wait()
  return tx.hash
}
