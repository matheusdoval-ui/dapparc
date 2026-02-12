/**
 * Leaderboard on-chain sync: ScoreSubmitted events → Supabase.
 * RPC (Arc Testnet) limits eth_getLogs to 10,000 blocks; we use strict 2000-block chunks.
 * After sync, last_block is saved to sync_state.
 */

import { createPublicClient, http } from 'viem'
import { supabaseAdmin, LEADERBOARD_TABLE, SYNC_STATE_TABLE, SYNC_STATE_ID } from './supabase-leaderboard'
import { LEADERBOARD_CONTRACT_ADDRESS } from './leaderboard-contract-address'

const RPC_URL = 'https://rpc.testnet.arc.network/'
const CHUNK_SIZE = 2000
const LOOKBACK = 8000n

const scoreSubmittedEvent = {
  type: 'event' as const,
  name: 'ScoreSubmitted' as const,
  inputs: [
    { name: 'player', type: 'address' as const, indexed: true },
    { name: 'score', type: 'uint256' as const, indexed: false },
  ],
}

export async function syncLeaderboardScores(): Promise<number> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY missing')
    return 0
  }
  const CONTRACT_ADDRESS = LEADERBOARD_CONTRACT_ADDRESS
  if (!CONTRACT_ADDRESS || !CONTRACT_ADDRESS.startsWith('0x')) {
    console.error('NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS is not set or invalid')
    return 0
  }
  if (!supabaseAdmin) {
    console.error('supabaseAdmin not available (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY required)')
    return 0
  }

  console.log('SUPABASE URL:', !!process.env.SUPABASE_URL)
  console.log('SERVICE ROLE:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  console.log('SYNC CONTRACT:', CONTRACT_ADDRESS)

  const address = CONTRACT_ADDRESS as `0x${string}`

  const client = createPublicClient({
    transport: http(RPC_URL),
  })

  const latest = await client.getBlockNumber()
  console.log('Latest block:', latest.toString())

  const fromBlock = latest > LOOKBACK ? latest - LOOKBACK : 0n
  let current = fromBlock
  let totalEvents = 0

  while (current <= latest) {
    const toRaw = current + BigInt(CHUNK_SIZE) - 1n
    const to = toRaw > latest ? latest : toRaw

    console.log(`Fetching logs from ${current.toString()} to ${to.toString()}`)

    try {
      const logs = await client.getLogs({
        address,
        event: scoreSubmittedEvent,
        fromBlock: current,
        toBlock: to,
      })

      console.log('Logs in chunk:', logs.length)

      for (const log of logs) {
        const player = (log.args.player as string).toLowerCase()
        const score = Number(log.args.score)

        console.log('Processing:', player, score)

        try {
          const { error } = await supabaseAdmin.from(LEADERBOARD_TABLE).upsert(
            {
              wallet: player,
              best_score: score,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'wallet' },
          )
          if (error) {
            console.error('leaderboard upsert error:', error)
          } else {
            totalEvents++
          }
        } catch (err) {
          console.error('leaderboard upsert exception:', err)
        }
      }
    } catch (err) {
      console.error('Chunk error:', err)
    }

    current += BigInt(CHUNK_SIZE)
  }

  try {
    const { error } = await supabaseAdmin
      .from(SYNC_STATE_TABLE)
      .upsert({ id: SYNC_STATE_ID, last_block: Number(latest) }, { onConflict: 'id' })
    if (error) {
      console.error('sync_state upsert error:', error)
    }
  } catch (err) {
    console.error('sync_state upsert exception:', err)
  }

  return totalEvents
}
