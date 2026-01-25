/**
 * Leaderboard persistence in Postgres (Neon)
 * Table: arc_leaderboard — address (pk), transactions, first_consulted_at, last_consulted_at, consult_count
 * Rank = ORDER BY transactions DESC (computed on read)
 */

export interface DbWalletRow {
  address: string
  transactions: number
  first_consulted_at: number
  last_consulted_at: number
  consult_count: number
}

const TABLE = 'arc_leaderboard'

function isDbAvailable(): boolean {
  return !!(process.env.DATABASE_URL && String(process.env.DATABASE_URL).startsWith('postgres'))
}

let sql: ((strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown[]>) | null = null
let dbInitDone = false

async function getSql() {
  if (sql) return sql
  if (!isDbAvailable()) return null
  try {
    const { neon } = await import('@neondatabase/serverless')
    sql = neon(process.env.DATABASE_URL!) as typeof sql
    return sql
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.warn('⚠️ Could not init Neon Postgres:', msg)
    return null
  }
}

/**
 * Create table if not exists (idempotent)
 */
export async function ensureTable(): Promise<boolean> {
  const s = await getSql()
  if (!s) return false
  if (dbInitDone) return true
  try {
    await s`CREATE TABLE IF NOT EXISTS arc_leaderboard (
      address VARCHAR(42) PRIMARY KEY,
      transactions INTEGER NOT NULL DEFAULT 0,
      first_consulted_at BIGINT NOT NULL,
      last_consulted_at BIGINT NOT NULL,
      consult_count INTEGER NOT NULL DEFAULT 1
    )`
    dbInitDone = true
    console.log('📂 arc_leaderboard table ready')
    return true
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.warn('⚠️ ensureTable failed:', msg)
    return false
  }
}

/**
 * Upsert wallet: insert or update by transactions, timestamps, consult_count
 */
export async function upsertWallet(
  address: string,
  transactions: number,
  firstConsultedAt: number,
  lastConsultedAt: number,
  consultCount: number
): Promise<boolean> {
  const s = await getSql()
  if (!s) return false
  const ok = await ensureTable()
  if (!ok) return false
  const addr = address.toLowerCase()
  try {
    await s`
      INSERT INTO arc_leaderboard (address, transactions, first_consulted_at, last_consulted_at, consult_count)
      VALUES (${addr}, ${transactions}, ${firstConsultedAt}, ${lastConsultedAt}, ${consultCount})
      ON CONFLICT (address) DO UPDATE SET
        transactions = EXCLUDED.transactions,
        last_consulted_at = EXCLUDED.last_consulted_at,
        consult_count = EXCLUDED.consult_count
    `
    console.log(`💾 DB upsert: ${addr}, TX: ${transactions}`)
    return true
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.warn('⚠️ upsertWallet failed:', msg)
    return false
  }
}

/**
 * Get leaderboard from DB: ORDER BY transactions DESC, limit
 */
export async function getLeaderboardFromDb(limit: number): Promise<DbWalletRow[]> {
  const s = await getSql()
  if (!s) return []
  const ok = await ensureTable()
  if (!ok) return []
  try {
    const rows = (await s`
      SELECT address, transactions, first_consulted_at, last_consulted_at, consult_count
      FROM arc_leaderboard
      ORDER BY transactions DESC, first_consulted_at ASC
      LIMIT ${limit}
    `) as DbWalletRow[]
    return Array.isArray(rows) ? rows : []
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.warn('⚠️ getLeaderboardFromDb failed:', msg)
    return []
  }
}

/**
 * Get a single wallet by address from DB
 */
export async function getWalletFromDb(address: string): Promise<DbWalletRow | null> {
  const s = await getSql()
  if (!s) return null
  const ok = await ensureTable()
  if (!ok) return null
  const addr = address.toLowerCase()
  try {
    const rows = (await s`
      SELECT address, transactions, first_consulted_at, last_consulted_at, consult_count
      FROM arc_leaderboard
      WHERE address = ${addr}
      LIMIT 1
    `) as DbWalletRow[]
    return Array.isArray(rows) && rows.length > 0 ? rows[0]! : null
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.warn('⚠️ getWalletFromDb failed:', msg)
    return null
  }
}

export { isDbAvailable }
