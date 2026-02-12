/**
 * Faucet transfer: ERC20 token transfers on Arc Testnet (USDC / EUR).
 * Uses ethers v6 + BrowserProvider (user signs the transfer).
 * Token addresses are configurable via env.
 */

import { ethers } from "ethers"

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
]

declare global {
  interface Window {
    ethereum?: import("ethers").Eip1193Provider
  }
}

/** USDC on Arc Testnet (official) — override with NEXT_PUBLIC_USDC_FAUCET_ADDRESS */
export const USDC_FAUCET_ADDRESS =
  process.env.NEXT_PUBLIC_USDC_FAUCET_ADDRESS ||
  "0x3910B7cbb3341f1F4bF4cEB66e4A2C8f204FE2b8"

/** EURC on Arc Testnet (official) — override with NEXT_PUBLIC_EUR_FAUCET_ADDRESS ou NEXT_PUBLIC_EURC_FAUCET_ADDRESS */
export const EUR_FAUCET_ADDRESS =
  process.env.NEXT_PUBLIC_EUR_FAUCET_ADDRESS ||
  process.env.NEXT_PUBLIC_EURC_FAUCET_ADDRESS ||
  "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a"

/**
 * Sends ERC20 tokens from the connected wallet to `to`.
 * Amount is in human units (e.g. 10 for 10 USDC); decimals are applied via the contract.
 */
export async function sendFaucetToken(
  tokenAddress: string,
  to: string,
  amount: number
): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Wallet not found")
  }
  if (!window.ethereum) {
    throw new Error("Wallet not found")
  }
  if (!tokenAddress || !/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
    throw new Error("Invalid token address")
  }
  if (!to || !/^0x[a-fA-F0-9]{40}$/.test(to)) {
    throw new Error("Invalid recipient address")
  }
  if (amount <= 0 || !Number.isFinite(amount)) {
    throw new Error("Invalid amount")
  }

  const provider = new ethers.BrowserProvider(window.ethereum)
  await provider.send("eth_requestAccounts", [])
  const signer = await provider.getSigner()

  const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer)

  const decimals = await token.decimals()
  const parsedAmount = ethers.parseUnits(amount.toString(), decimals)

  const tx = await token.transfer(to, parsedAmount)
  await tx.wait()

  return tx.hash as string
}
