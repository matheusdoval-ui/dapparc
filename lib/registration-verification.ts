/**
 * Registration verification for leaderboard access
 * Checks if a wallet has registered on-chain via the LeaderboardRegistry contract
 */

import { JsonRpcProvider, Contract } from 'ethers'

// ARC Testnet Configuration
const ARC_RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network'

// Registry contract address (set after deployment)
export const REGISTRY_CONTRACT = process.env.REGISTRY_CONTRACT_ADDRESS?.toLowerCase()

// Cache for registration verification (to avoid repeated RPC calls)
const registrationCache = new Map<string, { registered: boolean; timestamp: number }>()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

/**
 * Check if a wallet is registered in the LeaderboardRegistry contract
 * This verifies that the wallet has performed an on-chain action (called register())
 */
export async function isWalletRegistered(walletAddress: string): Promise<boolean> {
  const normalizedAddress = walletAddress.toLowerCase()
  
  // Check cache first
  const cached = registrationCache.get(normalizedAddress)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`💾 Using cached registration status for ${normalizedAddress}: ${cached.registered}`)
    return cached.registered
  }

  // If no contract is deployed, allow all connected wallets (backward compatibility)
  if (!REGISTRY_CONTRACT) {
    console.log(`⚠️ Registry contract not deployed - allowing all wallets (backward compatibility)`)
    return true
  }

  try {
    const provider = new JsonRpcProvider(ARC_RPC_URL)
    
    console.log(`🔍 Checking registration via contract: ${REGISTRY_CONTRACT}`)
    const contract = new Contract(
      REGISTRY_CONTRACT,
      ['function isRegistered(address) view returns (bool)'],
      provider
    )
    
    const isRegistered = await contract.isRegistered(normalizedAddress)
    
    // Cache the result
    registrationCache.set(normalizedAddress, { registered: isRegistered, timestamp: Date.now() })
    
    if (isRegistered) {
      console.log(`✅ Wallet registered: ${normalizedAddress}`)
    } else {
      console.log(`❌ Wallet not registered: ${normalizedAddress}`)
    }
    
    return isRegistered
  } catch (error) {
    console.error(`❌ Error checking registration for ${normalizedAddress}:`, error)
    // On error, assume not registered (fail secure)
    registrationCache.set(normalizedAddress, { registered: false, timestamp: Date.now() })
    return false
  }
}

/**
 * Clear registration cache (useful for testing or forced refresh)
 */
export function clearRegistrationCache(): void {
  registrationCache.clear()
  console.log('🗑️ Registration cache cleared')
}
