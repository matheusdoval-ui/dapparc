/**
 * Vercel KV storage adapter for leaderboard data
 * Provides persistent storage using Vercel KV (Redis-based)
 */

// Dynamic import to avoid errors when KV is not configured
let kv: any = null
let kvModule: any = null
let kvImportFailed = false

async function getKv() {
  if (kv) return kv
  if (kvImportFailed) return null
  
  try {
    // Only try to import if KV env vars are set
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      kvImportFailed = true
      return null
    }
    
    // Try to import @vercel/kv dynamically
    kvModule = await import('@vercel/kv')
    if (kvModule && kvModule.kv) {
      kv = kvModule.kv
      return kv
    }
    kvImportFailed = true
    return null
  } catch (error: any) {
    // If import fails (package not installed or not available), mark as failed
    kvImportFailed = true
    console.warn('⚠️ Could not import @vercel/kv (package may not be installed):', error?.message || error)
    return null
  }
}

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
    const kvInstance = await getKv()
    if (!kvInstance) {
      return new Map<string, WalletStats>()
    }

    // Get list of all wallet addresses
    const walletAddresses = await kvInstance.smembers(KV_ALL_WALLETS_KEY)
    
    if (!walletAddresses || walletAddresses.length === 0) {
      console.log('📂 No wallet data found in KV')
      return new Map<string, WalletStats>()
    }

    // Load all wallet stats in parallel
    const walletStatsPromises = walletAddresses.map(async (address: string) => {
      const key = `${KV_KEY_PREFIX}${address.toLowerCase()}`
      const stats = await kvInstance.get<WalletStats>(key)
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
 * Save wallet stats to KV.
 * Never overwrite with fewer entries: load current count first, refuse to shrink (rank preserved).
 */
export async function saveToKv(walletStatsMap: Map<string, WalletStats>): Promise<void> {
  if (!isKvAvailable()) {
    console.log('⚠️ Vercel KV not available - skipping save')
    return
  }

  try {
    const kvInstance = await getKv()
    if (!kvInstance) {
      console.warn('⚠️ KV instance not available')
      return
    }

    const toSave = walletStatsMap.size
    const existing = await kvInstance.smembers(KV_ALL_WALLETS_KEY)
    const currentCount = Array.isArray(existing) ? existing.length : 0
    if (currentCount > toSave) {
      console.warn(
        `⚠️ Refusing to overwrite KV: would shrink from ${currentCount} to ${toSave} entries. Rank preserved.`
      )
      return
    }

    const walletAddresses = Array.from(walletStatsMap.keys())
    if (walletAddresses.length > 0) {
      await kvInstance.sadd(KV_ALL_WALLETS_KEY, ...walletAddresses)
    }

    const savePromises = Array.from(walletStatsMap.entries()).map(async ([address, stats]) => {
      const key = `${KV_KEY_PREFIX}${address.toLowerCase()}`
      await kvInstance.set(key, stats)
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
    const kvInstance = await getKv()
    if (!kvInstance) {
      console.warn('⚠️ KV instance not available')
      return
    }

    const normalizedAddress = address.toLowerCase()
    const key = `${KV_KEY_PREFIX}${normalizedAddress}`
    
    // Save wallet stats
    await kvInstance.set(key, stats)
    
    // Add to set of all wallets
    await kvInstance.sadd(KV_ALL_WALLETS_KEY, normalizedAddress)
    
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
    const kvInstance = await getKv()
    if (!kvInstance) {
      console.warn('⚠️ KV instance not available')
      return
    }

    const normalizedAddress = address.toLowerCase()
    const key = `${KV_KEY_PREFIX}${normalizedAddress}`
    
    // Delete wallet stats
    await kvInstance.del(key)
    
    // Remove from set of all wallets
    await kvInstance.srem(KV_ALL_WALLETS_KEY, normalizedAddress)
    
    console.log(`🗑️ Deleted wallet ${normalizedAddress} from Vercel KV`)
  } catch (error: any) {
    console.error(`❌ Error deleting wallet ${address} from KV:`, error.message || error)
    throw error
  }
}
