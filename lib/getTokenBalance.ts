/**
 * Reusable ERC20 balance fetcher for Arc Testnet.
 */

import { ethers } from "ethers"
import { ERC20_ABI } from "@/lib/abis/erc20"

export async function getTokenBalance(
  tokenAddress: string,
  wallet: string,
  provider: ethers.Provider,
  decimals: number
): Promise<number> {
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
  const balance = await contract.balanceOf(wallet)
  return Number(ethers.formatUnits(balance, decimals))
}
