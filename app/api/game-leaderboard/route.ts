import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-leaderboard'
import { syncLeaderboardScores } from '@/lib/sync-leaderboard-scores'
import { readLeaderboardOnChain } from '@/lib/read-leaderboard-on-chain'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/** GET /api/game-leaderboard — syncs chain → Supabase, returns top 50. Fallback to on-chain read if Supabase fails. */
export async function GET() {
  try {
    console.log('SUPABASE URL:', !!process.env.SUPABASE_URL)
    console.log('SERVICE ROLE:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

    if (!process.env.NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS) {
      console.error('game-leaderboard: NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS is not set')
    }

    if (supabaseAdmin) {
      try {
        await syncLeaderboardScores()

        const result = await supabaseAdmin
          .from('leaderboard')
          .select('wallet, best_score, name')
          .order('best_score', { ascending: false })
          .limit(50)

        if (!result.error) {
          const list = (result.data ?? []).map((row) => ({
            wallet: row.wallet,
            bestScore: row.best_score,
            name: row.name ?? undefined,
          }))
          return NextResponse.json(list)
        }
        console.error('game-leaderboard Supabase error:', result.error)
      } catch (err) {
        console.error('game-leaderboard Supabase failed, falling back to on-chain:', err)
      }
    } else {
      console.error('game-leaderboard: supabaseAdmin not available, using on-chain only')
    }

    const { entries } = await readLeaderboardOnChain()
    const wallets = entries.map((e) => e.wallet)
    const nameMap = new Map<string, string>()
    if (supabaseAdmin && wallets.length > 0) {
      try {
        const { data } = await supabaseAdmin
          .from('leaderboard')
          .select('wallet, name')
          .in('wallet', wallets)
        for (const row of data ?? []) {
          if (row?.name && String(row.name).trim()) {
            nameMap.set(row.wallet.toLowerCase(), String(row.name).trim())
          }
        }
      } catch {
        /* names optional */
      }
    }
    const list = entries.map((e) => ({
      wallet: e.wallet,
      bestScore: e.bestScore,
      name: nameMap.get(e.wallet.toLowerCase()) ?? undefined,
    }))
    return NextResponse.json(list)
  } catch (err) {
    console.error('game-leaderboard API:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 },
    )
  }
}
