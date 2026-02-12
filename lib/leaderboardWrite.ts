/**
 * On-chain write to ArcLeaderboard via BrowserProvider (wallet).
 * DO NOT use JsonRpcProvider for writing — only BrowserProvider.
 */

import { ethers } from "ethers"

const CONTRACT_ADDRESS = "0x7461Fc5EAf38693e98B06B042e37b4adF1453AbD"
const ABI = ["function addPoints(address,uint256) external"]

declare global {
  interface Window {
    ethereum?: import("ethers").Eip1193Provider
  }
}

const ONLY_OWNER_MSG = "Only the contract owner can add scores."

function isOnlyOwnerError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  const lower = msg.toLowerCase()
  return (
    lower.includes("onlyowner") ||
    lower.includes("ownable") ||
    lower.includes("caller is not the owner") ||
    lower.includes("not the owner")
  )
}

/** Returns { hash, wait } so UI can show "Transaction sent" then "Saved to leaderboard!" */
export async function saveUserToLeaderboard(
  userAddress: string
): Promise<{ hash: string; wait: () => Promise<import("ethers").TransactionReceipt | null> }> {
  try {
    if (typeof window === "undefined") {
      throw new Error("Wallet not found")
    }
    if (!window.ethereum) {
      throw new Error("Wallet not found")
    }

    console.log("Connecting wallet...")

    const provider = new ethers.BrowserProvider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = await provider.getSigner()

    console.log("Wallet:", await signer.getAddress())

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)

    console.log("Sending addPoints transaction...")

    const tx = await contract.addPoints(userAddress, 1) // 1 point test
    const hash = tx.hash as string
    console.log("TX sent:", hash)

    return {
      hash,
      wait: () => tx.wait(),
    }
  } catch (err) {
    console.error("Leaderboard WRITE ERROR:", err)
    if (isOnlyOwnerError(err)) {
      throw new Error(ONLY_OWNER_MSG)
    }
    throw err
  }
}

/** @deprecated Use saveUserToLeaderboard. Kept for backwards compatibility. */
export async function saveUserScore(
  userAddress: string,
  score: number
): Promise<{ hash: string; wait: () => Promise<import("ethers").TransactionReceipt | null> }> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Wallet not found")
  }
  const provider = new ethers.BrowserProvider(window.ethereum)
  await provider.send("eth_requestAccounts", [])
  const signer = await provider.getSigner()
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
  const tx = await contract.addPoints(userAddress, score)
  const hash = tx.hash as string
  try {
    return { hash, wait: () => tx.wait() }
  } catch (err) {
    console.error("Leaderboard WRITE ERROR:", err)
    if (isOnlyOwnerError(err)) {
      throw new Error(ONLY_OWNER_MSG)
    }
    throw err
  }
}
