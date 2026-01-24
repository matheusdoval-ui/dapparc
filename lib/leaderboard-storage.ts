/**
 * Simple in-memory storage for leaderboard data
 * In production, use a database (PostgreSQL, MongoDB, etc.)
 */

interface WalletStats {
  address: string
  transactions: number
  firstConsultedAt: number // timestamp
  lastConsultedAt: number // timestamp
  consultCount: number
  arcAge: number | null // days since first transaction
}

// In-memory storage (will reset on server restart)
// In production, use a database
// Using globalThis to ensure persistence across hot reloads in development
declare global {
  var __walletStatsMap: Map<string, WalletStats> | undefined
}

const walletStatsMap = 
  globalThis.__walletStatsMap ?? new Map<string, WalletStats>()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__walletStatsMap = walletStatsMap
}

/**
 * Record a wallet consultation
 */
export function recordWalletConsultation(
  address: string,
  transactionCount: number,
  arcAge: number | null
): void {
  try {
    const now = Date.now()
    const normalizedAddress = address.toLowerCase()

    console.log(`🔍 Recording consultation for: ${normalizedAddress}, TX: ${transactionCount}`)
    console.log(`📦 Current map size before: ${walletStatsMap.size}`)

    const existing = walletStatsMap.get(normalizedAddress)

    if (existing) {
      // Update existing entry
      existing.transactions = transactionCount
      existing.lastConsultedAt = now
      existing.consultCount++
      existing.arcAge = arcAge
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
      })
      console.log(`🆕 New wallet added to leaderboard: ${normalizedAddress}, TX: ${transactionCount}`)
    }

    console.log(`📦 Current map size after: ${walletStatsMap.size}`)
    console.log(`📋 All addresses in map:`, Array.from(walletStatsMap.keys()))
  } catch (error) {
    console.error('Error in recordWalletConsultation:', error)
    throw error
  }
}

/**
 * Get all wallet stats for leaderboard
 */
export function getAllWalletStats(): WalletStats[] {
  const stats = Array.from(walletStatsMap.values())
  console.log(`📊 Total wallets in leaderboard: ${stats.length}`)
  return stats
}

/**
 * Get wallet stats by address
 */
export function getWalletStats(address: string): WalletStats | null {
  return walletStatsMap.get(address.toLowerCase()) || null
}

/**
 * Get leaderboard sorted by transactions and ARC Age
 */
export function getLeaderboard(limit: number = 100): WalletStats[] {
  console.log(`🔍 getLeaderboard called, map size: ${walletStatsMap.size}`)
  const allStats = getAllWalletStats()
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
 * Get rank for a specific address
 */
export function getWalletRank(address: string): number | null {
  const allStats = getLeaderboard(1000) // Get all for ranking
  const normalizedAddress = address.toLowerCase()
  
  const index = allStats.findIndex(stat => stat.address === normalizedAddress)
  
  if (index === -1) return null
  return index + 1
}
