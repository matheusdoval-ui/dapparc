/**
 * Vercel KV storage adapter for leaderboard data
 * Provides persistent storage using Vercel KV (Redis-based)
 */

import { kv } from '@vercel/kv'

interface WalletStats {
  address: string
  transactions: number
  firstConsultedAt: number // timestamp
  lastConsultedAt: number // timestamp
  consultCount: number
  arcAge: number | null // days since first transaction
  hasPaidFee?: boolean // whether wallet has paid leaderboard fee
}

const KV_KEY_PREFIX = 'leaderboard:'
const KV_ALL_WALLETS_KEY = 'leaderboard:all_wallets'

/**
 * Check if Vercel KV is available
 */
function isKvAvailable(): boolean {
  try {
    // Check if KV environment variables are set
    return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
  } catch {
    return false
  }
}

/**
 * Load all wallet stats from KV
 */
export async function loadFromKv(): Promise<Map<string, WalletStats>> {
  if (!isKvAvailable()) {
    console.log('⚠️ Vercel KV not available - missing environment variables')
    return new Map<string, WalletStats>()
  }

  try {
    // Get list of all wallet addresses
    const walletAddresses = await kv.smembers(KV_ALL_WALLETS_KEY)
    
    if (!walletAddresses || walletAddresses.length === 0) {
      console.log('📂 No wallet data found in KV')
      return new Map<string, WalletStats>()
    }

    // Load all wallet stats in parallel
    const walletStatsPromises = walletAddresses.map(async (address: string) => {
      const key = `${KV_KEY_PREFIX}${address.toLowerCase()}`
      const stats = await kv.get<WalletStats>(key)
      return [address.toLowerCase(), stats] as [string, WalletStats | null]
    })

    const walletStatsArray = await Promise.all(walletStatsPromises)
    
    const map = new Map<string, WalletStats>()
    for (const [address, stats] of walletStatsArray) {
      if (stats) {
        map.set(address, stats)
      }
    }

    console.log(`📂 Loaded ${map.size} wallet stats from Vercel KV`)
    return map
  } catch (error: any) {
    console.error('❌ Error loading from KV:', error.message || error)
    return new Map<string, WalletStats>()
  }
}

/**
 * Save wallet stats to KV
 */
export async function saveToKv(walletStatsMap: Map<string, WalletStats>): Promise<void> {
  if (!isKvAvailable()) {
    console.log('⚠️ Vercel KV not available - skipping save')
    return
  }

  try {
    // Collect all wallet addresses
    const walletAddresses = Array.from(walletStatsMap.keys())
    
    // Update the set of all wallets
    if (walletAddresses.length > 0) {
      await kv.sadd(KV_ALL_WALLETS_KEY, ...walletAddresses)
    }

    // Save each wallet stat
    const savePromises = Array.from(walletStatsMap.entries()).map(async ([address, stats]) => {
      const key = `${KV_KEY_PREFIX}${address.toLowerCase()}`
      await kv.set(key, stats)
    })

    await Promise.all(savePromises)
    
    console.log(`💾 Saved ${walletStatsMap.size} wallet stats to Vercel KV`)
  } catch (error: any) {
    console.error('❌ Error saving to KV:', error.message || error)
    throw error
  }
}

/**
 * Save a single wallet stat to KV
 */
export async function saveWalletToKv(address: string, stats: WalletStats): Promise<void> {
  if (!isKvAvailable()) {
    return
  }

  try {
    const normalizedAddress = address.toLowerCase()
    const key = `${KV_KEY_PREFIX}${normalizedAddress}`
    
    // Save wallet stats
    await kv.set(key, stats)
    
    // Add to set of all wallets
    await kv.sadd(KV_ALL_WALLETS_KEY, normalizedAddress)
    
    console.log(`💾 Saved wallet ${normalizedAddress} to Vercel KV`)
  } catch (error: any) {
    console.error(`❌ Error saving wallet ${address} to KV:`, error.message || error)
    throw error
  }
}

/**
 * Delete a wallet from KV
 */
export async function deleteWalletFromKv(address: string): Promise<void> {
  if (!isKvAvailable()) {
    return
  }

  try {
    const normalizedAddress = address.toLowerCase()
    const key = `${KV_KEY_PREFIX}${normalizedAddress}`
    
    // Delete wallet stats
    await kv.del(key)
    
    // Remove from set of all wallets
    await kv.srem(KV_ALL_WALLETS_KEY, normalizedAddress)
    
    console.log(`🗑️ Deleted wallet ${normalizedAddress} from Vercel KV`)
  } catch (error: any) {
    console.error(`❌ Error deleting wallet ${address} from KV:`, error.message || error)
    throw error
  }
}
