/**
 * On-chain submitScore to Leaderboard contract (primary protocol action).
 * No tokens, no balance checks — user submits a score; contract updates bestScore.
 *
 * IMPORTANT: Must use the Leaderboard contract that has submitScore(), NOT ArcLeaderboard (addPoints).
 * Use NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS (new contract that emits ScoreSubmitted).
 */

import { ethers } from "ethers"
import { LEADERBOARD_ABI } from "@/lib/abis/leaderboard"

import { LEADERBOARD_CONTRACT_ADDRESS } from './leaderboard-contract-address'

declare global {
  interface Window {
    ethereum?: import("ethers").Eip1193Provider
  }
}

/**
 * Submit a score to the leaderboard (main protocol action).
 * Calls contract.submitScore(score). No token transfer.
 */
export async function submitScoreToLeaderboard(
  score: number
): Promise<{ hash: string; wait: () => Promise<import("ethers").TransactionReceipt | null> }> {
  if (!LEADERBOARD_CONTRACT_ADDRESS) {
    throw new Error("Leaderboard contract not configured")
  }
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Wallet not found")
  }
  if (score <= 0 || !Number.isInteger(score)) {
    throw new Error("Score must be a positive integer")
  }

  console.log('Contract address:', LEADERBOARD_CONTRACT_ADDRESS)

  const provider = new ethers.BrowserProvider(window.ethereum)
  await provider.send("eth_requestAccounts", [])
  const signer = await provider.getSigner()
  const contract = new ethers.Contract(LEADERBOARD_CONTRACT_ADDRESS, LEADERBOARD_ABI, signer)

  const tx = await contract.submitScore(score)
  const hash = tx.hash as string
  return { hash, wait: () => tx.wait() }
}
