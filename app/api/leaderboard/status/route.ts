import { NextResponse } from 'next/server'

/**
 * GET /api/leaderboard/status
 * Returns which storage backend is active for the leaderboard (database, KV, or memory).
 * Use this to verify persistence is configured correctly.
 */
export async function GET() {
  const hasDb = !!(
    process.env.DATABASE_URL &&
    String(process.env.DATABASE_URL).startsWith('postgres')
  )
  const hasKv = !!(
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN
  )

  let databaseReady = false
  let tableExists = false

  if (hasDb) {
    try {
      const db = await import('@/lib/leaderboard-db')
      if (db.isDbAvailable()) {
        databaseReady = true
        const ok = await db.ensureTable()
        tableExists = !!ok
      }
    } catch (e) {
      console.warn('Leaderboard status: DB check failed', e)
    }
  }

  const storage = databaseReady
    ? 'database'
    : hasKv
      ? 'kv'
      : 'memory'

  const message = databaseReady
    ? 'Leaderboard persisted in Postgres (Neon). Ranks are saved and never deleted.'
    : hasKv
      ? 'Leaderboard persisted in Vercel KV. Set DATABASE_URL (Neon) for best reliability.'
      : 'Leaderboard in memory only. Data is lost on redeploy. Set DATABASE_URL or Vercel KV to persist.'

  return NextResponse.json({
    storage,
    database: hasDb,
    databaseReady,
    tableExists,
    kv: hasKv,
    message,
  })
}
