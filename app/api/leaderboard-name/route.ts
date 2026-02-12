import { NextResponse } from 'next/server'
import { supabaseAdmin, LEADERBOARD_TABLE } from '@/lib/supabase-leaderboard'
import { syncLeaderboardScores } from '@/lib/sync-leaderboard-scores'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * POST /api/leaderboard-name — set display name for a wallet (off-chain metadata).
 * Body: { wallet: string, name: string }
 * Name is stored in leaderboard.name; row must exist (user must have submitted score on-chain first).
 */
export async function POST(req: Request) {
  try {
    console.log('SUPABASE URL:', !!process.env.SUPABASE_URL)
    console.log('SERVICE ROLE:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }
    const body = await req.json().catch(() => ({}))
    const wallet = typeof body.wallet === 'string' ? body.wallet.trim().toLowerCase() : null
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 20) : null

    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return NextResponse.json({ error: 'Invalid wallet' }, { status: 400 })
    }

    await syncLeaderboardScores()

    try {
      const { error } = await supabaseAdmin
        .from(LEADERBOARD_TABLE)
        .update({ name: name ?? null, updated_at: new Date().toISOString() })
        .eq('wallet', wallet)

      if (error) {
        console.error('leaderboard-name update error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } catch (err) {
      console.error('leaderboard-name update error:', err)
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Update failed' },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('leaderboard-name:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 },
    )
  }
}
