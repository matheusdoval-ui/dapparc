import { NextResponse } from 'next/server'
import { readLeaderboardOnChain } from '@/lib/read-leaderboard-on-chain'
import { supabaseAdmin, LEADERBOARD_TABLE } from '@/lib/supabase-leaderboard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/leaderboard-on-chain
 * Returns leaderboard built directly from chain (ScoreSubmitted events).
 * Enriches with display names from Supabase when available.
 */
export async function GET() {
  try {
    const { entries, totalPlayers } = await readLeaderboardOnChain()
    const wallets = entries.map((e) => e.wallet)
    const nameMap = new Map<string, string>()

    if (supabaseAdmin && wallets.length > 0) {
      try {
        const { data } = await supabaseAdmin
          .from(LEADERBOARD_TABLE)
          .select('wallet, name')
          .in('wallet', wallets)
        for (const row of data ?? []) {
          if (row?.name && String(row.name).trim()) {
            nameMap.set(row.wallet.toLowerCase(), String(row.name).trim())
          }
        }
      } catch {
        // ignore; names optional
      }
    }

    const list = entries.map((e) => ({
      wallet: e.wallet,
      bestScore: e.bestScore,
      name: nameMap.get(e.wallet.toLowerCase()) ?? undefined,
    }))
    return NextResponse.json({ list, totalPlayers })
  } catch (err) {
    console.error('leaderboard-on-chain:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to read leaderboard from chain' },
      { status: 500 },
    )
  }
}
