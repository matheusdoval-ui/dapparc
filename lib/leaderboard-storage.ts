/**
 * Persistent storage for leaderboard data
 * Uses Vercel KV (Redis) for production persistence
 * Falls back to file system for local development
 */

import { promises as fs } from 'fs'
import { join } from 'path'
import { loadFromKv, saveToKv, saveWalletToKv } from './leaderboard-storage-kv'

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
 * Initialize storage (load from KV, file, or use existing in-memory)
 */
async function initializeStorage(): Promise<Map<string, WalletStats>> {
  if (isInitialized && walletStatsMap && walletStatsMap.size > 0) {
    return walletStatsMap
  }

  // Priority 1: Try to load from Vercel KV (production)
  try {
    const kvData = await loadFromKv()
    if (kvData.size > 0) {
      walletStatsMap = kvData
      globalThis.__walletStatsMap = walletStatsMap
      isInitialized = true
      console.log(`📂 Loaded ${kvData.size} entries from Vercel KV`)
      return walletStatsMap
    }
  } catch (error: any) {
    console.warn('⚠️ Could not load from KV, trying file:', error.message)
  }

  // Priority 2: Try to load from file (local development)
  try {
    const fileData = await loadFromFile()
    if (fileData.size > 0) {
      walletStatsMap = fileData
      globalThis.__walletStatsMap = walletStatsMap
      isInitialized = true
      console.log(`📂 Loaded ${fileData.size} entries from file`)
      
      // Sync to KV if available (migrate from file to KV)
      try {
        await saveToKv(walletStatsMap)
        console.log('✅ Synced file data to Vercel KV')
      } catch (kvError) {
        console.warn('⚠️ Could not sync to KV:', kvError)
      }
      
      return walletStatsMap
    }
  } catch (error: any) {
    console.warn('⚠️ Could not load from file, trying globalThis:', error.message)
  }

  // Priority 3: Check if we have data in globalThis (hot reload in development or warm-up)
  if (globalThis.__walletStatsMap && globalThis.__walletStatsMap.size > 0) {
    walletStatsMap = globalThis.__walletStatsMap
    isInitialized = true
    console.log(`🔄 Using existing in-memory data from globalThis (${walletStatsMap.size} entries)`)
    return walletStatsMap
  }

  // Last resort: start with empty map
  walletStatsMap = new Map<string, WalletStats>()
  globalThis.__walletStatsMap = walletStatsMap
  isInitialized = true
  console.log('📦 Starting with empty storage')
  return walletStatsMap
}

// Initialize on module load
let storagePromise: Promise<Map<string, WalletStats>> | null = null

function getStorage(): Promise<Map<string, WalletStats>> {
  // Don't force reinitialize if already initialized - this causes issues
  // Only initialize if not initialized yet
  if (!storagePromise) {
    storagePromise = initializeStorage()
  }
  return storagePromise
}

// Get storage synchronously (for functions that need immediate access)
// This will use existing map or create empty one
if (globalThis.__walletStatsMap && globalThis.__walletStatsMap.size > 0) {
  walletStatsMap = globalThis.__walletStatsMap
  isInitialized = true
  console.log(`📦 Using existing global storage (${walletStatsMap.size} entries)`)
} else {
  walletStatsMap = new Map<string, WalletStats>()
  // Initialize asynchronously - always try to load from file
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
    let walletToSave: WalletStats

    if (existing) {
      // Update existing entry
      existing.transactions = transactionCount
      existing.lastConsultedAt = now
      existing.consultCount++
      existing.arcAge = arcAge
      existing.hasPaidFee = true // Keep for backward compatibility, but now means "registered"
      walletToSave = existing
      console.log(`📊 Updated wallet stats: ${normalizedAddress}, TX: ${transactionCount}, Consults: ${existing.consultCount}`)
    } else {
      // Create new entry
      walletToSave = {
        address: normalizedAddress,
        transactions: transactionCount,
        firstConsultedAt: now,
        lastConsultedAt: now,
        consultCount: 1,
        arcAge: arcAge,
        hasPaidFee: true, // Keep for backward compatibility, but now means "registered"
      }
      walletStatsMap.set(normalizedAddress, walletToSave)
      console.log(`🆕 New wallet added to leaderboard: ${normalizedAddress}, TX: ${transactionCount}`)
    }

    console.log(`📦 Current map size after: ${walletStatsMap.size}`)
    console.log(`📋 All addresses in map:`, Array.from(walletStatsMap.keys()))

    // Always try to save immediately to ensure persistence
    // Try both KV and file - don't fail if one doesn't work
    
    // Try to save to Vercel KV (non-blocking)
    try {
      await saveWalletToKv(normalizedAddress, walletToSave)
      console.log(`💾 Wallet saved to Vercel KV: ${normalizedAddress}`)
    } catch (kvError: any) {
      console.warn('⚠️ Could not save to KV (non-critical):', kvError.message || kvError)
      // Try batch save as fallback
      try {
        await saveToKv(walletStatsMap)
        console.log(`💾 All data saved to Vercel KV (batch)`)
      } catch (kvBatchError: any) {
        console.warn('⚠️ Could not save batch to KV (non-critical):', kvBatchError.message || kvBatchError)
      }
    }

    // Always try to save to file (works in local dev, may fail in serverless)
    try {
      await saveToFileImmediate()
      console.log(`💾 Data saved to file successfully (${walletStatsMap.size} entries)`)
    } catch (err: any) {
      // In serverless environments (Vercel), file system may be read-only
      // This is expected and OK - KV should handle it
      if (err.code === 'EROFS' || err.code === 'EACCES') {
        console.warn('⚠️ File system is read-only (serverless environment) - this is OK if KV is configured')
      } else {
        console.warn('⚠️ Error saving to file (non-critical):', err.message || err)
      }
    }

    // Always update globalThis to ensure it's in sync
    globalThis.__walletStatsMap = walletStatsMap
    
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
  // Ensure storage is loaded
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
