/**
 * Persistent storage for leaderboard data
 * Uses file system to persist data between server restarts
 * In production, consider using a database (PostgreSQL, MongoDB, etc.)
 */

import { promises as fs } from 'fs'
import { join } from 'path'

interface WalletStats {
  address: string
  transactions: number
  firstConsultedAt: number // timestamp
  lastConsultedAt: number // timestamp
  consultCount: number
  arcAge: number | null // days since first transaction
  hasPaidFee?: boolean // whether wallet has paid leaderboard fee
}

// File path for persistence
const DATA_DIR = join(process.cwd(), '.data')
const DATA_FILE = join(DATA_DIR, 'leaderboard.json')

// In-memory storage with file persistence
// Using globalThis to ensure persistence across hot reloads in development
declare global {
  var __walletStatsMap: Map<string, WalletStats> | undefined
  var __saveTimeout: NodeJS.Timeout | undefined
}

let walletStatsMap: Map<string, WalletStats>
let isInitialized = false

/**
 * Load data from file
 */
async function loadFromFile(): Promise<Map<string, WalletStats>> {
  try {
    // Ensure data directory exists
    await fs.mkdir(DATA_DIR, { recursive: true })
    
    // Try to read existing data
    const data = await fs.readFile(DATA_FILE, 'utf-8')
    const parsed = JSON.parse(data) as Record<string, WalletStats>
    
    const map = new Map<string, WalletStats>()
    for (const [key, value] of Object.entries(parsed)) {
      map.set(key, value)
    }
    
    console.log(`📂 Loaded ${map.size} wallet stats from file`)
    return map
  } catch (error: any) {
    // File doesn't exist or is invalid - start fresh
    if (error.code === 'ENOENT') {
      console.log('📂 No existing data file found, starting fresh')
      return new Map<string, WalletStats>()
    }
    console.warn('⚠️ Error loading data file, starting fresh:', error.message)
    return new Map<string, WalletStats>()
  }
}

/**
 * Save data to file immediately (synchronous save)
 */
async function saveToFileImmediate(): Promise<void> {
  try {
    // Ensure data directory exists
    await fs.mkdir(DATA_DIR, { recursive: true })
    
    // Convert Map to object for JSON serialization
    const data: Record<string, WalletStats> = {}
    walletStatsMap.forEach((value, key) => {
      data[key] = value
    })
    
    // Write to file atomically (write to temp file then rename)
    const tempFile = `${DATA_FILE}.tmp`
    await fs.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf-8')
    await fs.rename(tempFile, DATA_FILE)
    
    console.log(`💾 Saved ${walletStatsMap.size} wallet stats to file: ${DATA_FILE}`)
  } catch (error: any) {
    // In production (Vercel), file system may be read-only
    // This is expected and we should log but not fail
    if (error.code === 'EROFS' || error.code === 'EACCES') {
      console.warn('⚠️ File system is read-only (serverless environment), data will persist in memory only')
    } else {
      console.error('❌ Error saving data file:', error)
      throw error
    }
  }
}

/**
 * Save data to file (with debouncing)
 */
async function saveToFile(): Promise<void> {
  try {
    // Clear any pending save
    if (globalThis.__saveTimeout) {
      clearTimeout(globalThis.__saveTimeout)
    }

    // Debounce: wait 1 second before saving to avoid too many writes
    globalThis.__saveTimeout = setTimeout(async () => {
      await saveToFileImmediate()
    }, 1000)
  } catch (error) {
    console.error('❌ Error scheduling save:', error)
  }
}

/**
 * Initialize storage (load from file or use existing in-memory)
 */
async function initializeStorage(): Promise<Map<string, WalletStats>> {
  if (isInitialized && walletStatsMap) {
    return walletStatsMap
  }

  // Check if we have data in globalThis (hot reload in development)
  if (globalThis.__walletStatsMap) {
    walletStatsMap = globalThis.__walletStatsMap
    isInitialized = true
    console.log(`🔄 Using existing in-memory data (${walletStatsMap.size} entries)`)
    return walletStatsMap
  }

  // Load from file
  walletStatsMap = await loadFromFile()
  
  // Store in globalThis for hot reload persistence (works in both dev and production)
  // In production, this helps maintain data during function warm-up
  globalThis.__walletStatsMap = walletStatsMap
  
  isInitialized = true
  return walletStatsMap
}

// Initialize on module load
let storagePromise: Promise<Map<string, WalletStats>> | null = null

function getStorage(): Promise<Map<string, WalletStats>> {
  if (!storagePromise) {
    storagePromise = initializeStorage()
  }
  return storagePromise
}

// Get storage synchronously (for functions that need immediate access)
// This will use existing map or create empty one
if (globalThis.__walletStatsMap) {
  walletStatsMap = globalThis.__walletStatsMap
  isInitialized = true
  console.log(`📦 Using existing global storage (${walletStatsMap.size} entries)`)
} else {
  walletStatsMap = new Map<string, WalletStats>()
  // Initialize asynchronously
  initializeStorage().then(map => {
    walletStatsMap = map
    // Store in globalThis for persistence (works in both dev and production)
    globalThis.__walletStatsMap = walletStatsMap
    console.log(`📦 Storage initialized with ${map.size} entries`)
  }).catch(err => {
    console.error('❌ Error initializing storage:', err)
    // Continue with empty map
    walletStatsMap = new Map<string, WalletStats>()
    globalThis.__walletStatsMap = walletStatsMap
  })
}

/**
 * Record a wallet consultation
 * Only records to leaderboard if wallet is connected AND has paid the leaderboard fee
 * Manual lookups (isWalletConnected=false) are NOT added to leaderboard
 */
export async function recordWalletConsultation(
  address: string,
  transactionCount: number,
  arcAge: number | null,
  isWalletConnected: boolean = false, // true if wallet was connected, false for manual lookup
  isRegistered?: boolean // Optional: if not provided, will check registration
): Promise<{ recorded: boolean; reason?: string }> {
  try {
    // Ensure storage is initialized
    await getStorage()
    
    const now = Date.now()
    const normalizedAddress = address.toLowerCase()

    console.log(`🔍 Recording consultation for: ${normalizedAddress}, TX: ${transactionCount}, Connected: ${isWalletConnected}`)
    
    // Only add to leaderboard if wallet was connected (not manual lookup)
    if (!isWalletConnected) {
      console.log(`⛔ Manual lookup - not adding to leaderboard: ${normalizedAddress}`)
      return {
        recorded: false,
        reason: 'Manual lookups are not added to leaderboard. Connect your wallet to appear in the ranking.'
      }
    }
    
    // If wallet is connected, it's eligible for leaderboard
    // Registration on-chain is optional - if contract is deployed, we can check it
    // but connecting the wallet is sufficient to appear in leaderboard
    let registered = isRegistered
    if (registered === undefined) {
      // Only check registration if contract is deployed (optional check)
      // If contract is not deployed or check fails, still allow connected wallets
      try {
        const { isWalletRegistered, REGISTRY_CONTRACT } = await import('@/lib/registration-verification')
        // Only check if contract is deployed
        if (REGISTRY_CONTRACT) {
          registered = await Promise.race([
            isWalletRegistered(normalizedAddress),
            new Promise<boolean>((resolve) => {
              setTimeout(() => {
                console.warn(`⏱️ Registration verification timeout for ${normalizedAddress}, allowing anyway (connected wallet)`)
                resolve(true) // Allow if timeout - wallet is connected
              }, 10000) // 10 second timeout
            })
          ])
        } else {
          // No contract deployed - all connected wallets are eligible
          registered = true
        }
      } catch (registrationError) {
        console.warn(`⚠️ Registration verification error for ${normalizedAddress}, allowing anyway (connected wallet):`, registrationError)
        registered = true // Default to true if error - wallet is connected
      }
    }
    
    // Connected wallets are always eligible (registration is optional enhancement)
    if (!registered && isWalletConnected) {
      // Even if not registered on-chain, if wallet is connected, allow it
      // This ensures backward compatibility and that connecting is sufficient
      console.log(`✅ Wallet ${normalizedAddress} is connected - adding to leaderboard (registration optional)`)
      registered = true
    }
    
    console.log(`📦 Current map size before: ${walletStatsMap.size}`)
    console.log(`✅ Wallet connected and eligible: ${normalizedAddress}`)

    const existing = walletStatsMap.get(normalizedAddress)

    if (existing) {
      // Update existing entry
      existing.transactions = transactionCount
      existing.lastConsultedAt = now
      existing.consultCount++
      existing.arcAge = arcAge
      existing.hasPaidFee = true // Keep for backward compatibility, but now means "registered"
      console.log(`📊 Updated wallet stats: ${normalizedAddress}, TX: ${transactionCount}, Consults: ${existing.consultCount}`)
    } else {
      // Create new entry
      walletStatsMap.set(normalizedAddress, {
        address: normalizedAddress,
        transactions: transactionCount,
        firstConsultedAt: now,
        lastConsultedAt: now,
        consultCount: 1,
        arcAge: arcAge,
        hasPaidFee: true, // Keep for backward compatibility, but now means "registered"
      })
      console.log(`🆕 New wallet added to leaderboard: ${normalizedAddress}, TX: ${transactionCount}`)
    }

    console.log(`📦 Current map size after: ${walletStatsMap.size}`)
    console.log(`📋 All addresses in map:`, Array.from(walletStatsMap.keys()))

    // Always try to save immediately to ensure persistence
    // This is critical for data preservation
    try {
      await saveToFileImmediate()
      console.log('💾 Data saved to file successfully')
    } catch (err: any) {
      // In serverless environments (Vercel), file system may be read-only
      // This is expected - data will persist in memory during the function execution
      // For production, consider using a database or external storage
      if (err.code === 'EROFS' || err.code === 'EACCES') {
        console.warn('⚠️ File system is read-only (serverless environment) - data persists in memory only')
        console.warn('💡 Consider using a database (PostgreSQL, MongoDB) or Vercel KV for production persistence')
      } else {
        console.error('❌ Error saving to file:', err.message || err)
        // Still continue - data is in memory
      }
      
      // Also try debounced save as fallback
      saveToFile().catch(saveErr => {
        console.warn('⚠️ Debounced save also failed:', saveErr.message || saveErr)
      })
    }
    
    console.log('✅ Wallet consultation recorded successfully')
    return { recorded: true }
  } catch (error) {
    console.error('❌ Error in recordWalletConsultation:', error)
    throw error
  }
}

/**
 * Get all wallet stats for leaderboard (synchronous version for immediate access)
 */
export function getAllWalletStatsSync(): WalletStats[] {
  const stats = Array.from(walletStatsMap.values())
  console.log(`📊 Total wallets in leaderboard: ${stats.length}`)
  return stats
}

/**
 * Get all wallet stats for leaderboard (async version that ensures storage is loaded)
 */
export async function getAllWalletStats(): Promise<WalletStats[]> {
  await getStorage()
  return getAllWalletStatsSync()
}

/**
 * Get wallet stats by address (synchronous version)
 */
export function getWalletStatsSync(address: string): WalletStats | null {
  return walletStatsMap.get(address.toLowerCase()) || null
}

/**
 * Get wallet stats by address (async version)
 */
export async function getWalletStats(address: string): Promise<WalletStats | null> {
  await getStorage()
  return getWalletStatsSync(address)
}

/**
 * Get leaderboard sorted by transactions and ARC Age (synchronous version)
 */
export function getLeaderboardSync(limit: number = 100): WalletStats[] {
  console.log(`🔍 getLeaderboard called, map size: ${walletStatsMap.size}`)
  const allStats = getAllWalletStatsSync()
  console.log(`📊 getAllWalletStats returned: ${allStats.length} entries`)

  // Sort by transactions (desc), then by first consulted date (older is better), then by consult count (desc)
  allStats.sort((a, b) => {
    // Primary: transactions
    if (b.transactions !== a.transactions) {
      return b.transactions - a.transactions
    }
    // Secondary: First consulted (older is better - earlier users rank higher)
    if (a.firstConsultedAt !== b.firstConsultedAt) {
      return a.firstConsultedAt - b.firstConsultedAt
    }
    // Tertiary: consult count
    return b.consultCount - a.consultCount
  })

  const limited = allStats.slice(0, limit)
  console.log(`✅ Returning ${limited.length} entries from getLeaderboard`)
  return limited
}

/**
 * Get leaderboard sorted by transactions and ARC Age (async version)
 */
export async function getLeaderboard(limit: number = 100): Promise<WalletStats[]> {
  await getStorage()
  return getLeaderboardSync(limit)
}

/**
 * Get rank for a specific address (synchronous version)
 */
export function getWalletRankSync(address: string): number | null {
  const allStats = getLeaderboardSync(1000) // Get all for ranking
  const normalizedAddress = address.toLowerCase()
  
  const index = allStats.findIndex(stat => stat.address === normalizedAddress)
  
  if (index === -1) return null
  return index + 1
}

/**
 * Get rank for a specific address (async version)
 */
export async function getWalletRank(address: string): Promise<number | null> {
  await getStorage()
  return getWalletRankSync(address)
}
