import { NextRequest, NextResponse } from 'next/server'
import { getLeaderboard } from '@/lib/leaderboard-storage'

interface LeaderboardEntry {
  address: string
  transactions: number
  firstTransactionTimestamp: number | null
  arcAge: number | null // days
  rank: number
}

/**
 * API endpoint to fetch leaderboard data
 * GET /api/leaderboard?limit=100
 * 
 * Note: This is a simplified implementation. In production, you would:
 * - Use an indexer or subgraph to track all addresses
 * - Cache results in a database
 * - Update rankings periodically
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '100', 10)

    // Get leaderboard from storage (based on consulted wallets)
    const walletStats = getLeaderboard(limit)
    console.log(`📊 Leaderboard request: ${walletStats.length} wallets found`)

    // Convert to leaderboard entries
    // Calculate ARC Age based on first consultation date (simplified)
    const now = Math.floor(Date.now() / 1000)
    const leaderboard: LeaderboardEntry[] = walletStats.map((stat, index) => {
      // Calculate days since first consultation as a proxy for ARC Age
      const daysSinceFirstConsult = Math.floor((now - (stat.firstConsultedAt / 1000)) / 86400)
      
      return {
        address: stat.address,
        transactions: stat.transactions,
        firstTransactionTimestamp: Math.floor(stat.firstConsultedAt / 1000),
        arcAge: daysSinceFirstConsult,
        rank: index + 1,
      }
    })

    console.log(`✅ Returning leaderboard with ${leaderboard.length} entries`)

    return NextResponse.json({
      leaderboard: leaderboard,
      total: leaderboard.length,
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || 'Failed to fetch leaderboard' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
