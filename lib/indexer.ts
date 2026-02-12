/**
 * Indexer: reads ScoreSubmitted events from the contract and upserts best scores into Supabase.
 * Run: npm run indexer (or npx tsx lib/indexer.ts)
 * Requires: RPC_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY), contract address.
 */

import 'dotenv/config'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { supabaseAdmin, LEADERBOARD_TABLE, INDEXER_STATE_TABLE, INDEXER_KEY_LAST_BLOCK } from './supabase-leaderboard'
import type { SupabaseClient } from '@supabase/supabase-js'
import { LEADERBOARD_CONTRACT_ADDRESS } from './leaderboard-contract-address'

const CONTRACT_ADDRESS = LEADERBOARD_CONTRACT_ADDRESS as `0x${string}`
const RPC_URL = process.env.RPC_URL || 'https://rpc.testnet.arc.network'
const CHUNK_SIZE = 8000n

const event = parseAbiItem('event ScoreSubmitted(address indexed player, uint256 score)')

async function getLastIndexedBlock(supabase: SupabaseClient): Promise<bigint | null> {
  const { data, error } = await supabase
    .from(INDEXER_STATE_TABLE)
    .select('value')
    .eq('key', INDEXER_KEY_LAST_BLOCK)
    .single()
  if (error || !data?.value) return null
  const n = BigInt(data.value)
  return n >= 0n ? n : null
}

async function setLastIndexedBlock(supabase: SupabaseClient, block: bigint): Promise<void> {
  await supabase.from(INDEXER_STATE_TABLE).upsert(
    { key: INDEXER_KEY_LAST_BLOCK, value: block.toString(), updated_at: new Date().toISOString() },
    { onConflict: 'key' },
  )
}

async function runIndexer() {
  if (!supabaseAdmin) {
    console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
    process.exit(1)
  }
  console.log('Indexer started')
  const client = createPublicClient({
    chain: arcTestnetChain,
    transport: http(RPC_URL),
  })

  const latestBlock = await client.getBlockNumber()
  // DEBUG: temporarily force full scan from block 0 to not miss past events (remove after finding failure point)
  const fromBlock = 0n
  console.log('Indexer block range:', fromBlock.toString(), 'to', latestBlock.toString(), 'contract:', CONTRACT_ADDRESS)

  if (fromBlock > latestBlock) {
    console.log('No new blocks to index.')
    return
  }

  const now = new Date().toISOString()
  let processed = 0
  let currentFrom = fromBlock

  while (currentFrom <= latestBlock) {
    const toBlock = currentFrom + CHUNK_SIZE - 1n > latestBlock ? latestBlock : currentFrom + CHUNK_SIZE - 1n
    const logs = await client.getLogs({
      address: CONTRACT_ADDRESS,
      event,
      fromBlock: currentFrom,
      toBlock,
    })
    console.log('Logs found:', logs.length, '(blocks', currentFrom.toString(), '-', toBlock.toString() + ')')

    for (const log of logs) {
      const args = log.args as { player?: string; score?: bigint }
      const wallet = args.player
      const score = Number(args.score ?? 0)
      if (!wallet || score <= 0) continue

      const { data: row } = await supabaseAdmin.from(LEADERBOARD_TABLE).select('best_score').eq('wallet', wallet).single()
      const existing = row?.best_score ?? 0
      if (score > existing) {
        console.log('Saving score:', wallet, score)
        await supabaseAdmin.from(LEADERBOARD_TABLE).upsert(
          { wallet, best_score: score, updated_at: now },
          { onConflict: 'wallet' },
        )
        processed++
      }
    }

    await setLastIndexedBlock(supabaseAdmin, toBlock)
    currentFrom = toBlock + 1n
  }

  console.log(`Indexed up to block ${latestBlock}. Rows upserted: ${processed}.`)
}

runIndexer().catch((err) => {
  console.error(err)
  process.exit(1)
})
