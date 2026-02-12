import { NextResponse } from 'next/server'
import { syncLeaderboardScores } from '@/lib/sync-leaderboard-scores'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    console.log('SUPABASE URL:', !!process.env.SUPABASE_URL)
    console.log('SERVICE ROLE:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

    const synced = await syncLeaderboardScores()
    return NextResponse.json({ status: 'OK', synced })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Sync failed'
    console.error('DEBUG ERROR:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
