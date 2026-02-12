/**
 * Supabase client for game leaderboard persistence.
 * API routes must use SERVICE ROLE only (supabaseAdmin). Do not use anon key for writes.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/** For API routes: SERVICE ROLE client (read/write, bypasses RLS). Null when env missing. */
export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null

export interface LeaderboardRow {
  wallet: string
  best_score: number
  updated_at: string
}

export const LEADERBOARD_TABLE = 'leaderboard'
export const INDEXER_STATE_TABLE = 'indexer_state'
export const INDEXER_KEY_LAST_BLOCK = 'last_block'
export const SYNC_STATE_TABLE = 'sync_state'
export const SYNC_STATE_ID = 1
