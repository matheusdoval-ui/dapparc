import { NextResponse } from 'next/server'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { LEADERBOARD_CONTRACT_ADDRESS } from '@/lib/leaderboard-contract-address'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const RPC_URL = process.env.RPC_URL || 'https://rpc.testnet.arc.network'

const arcTestnetChain = {
  id: 11124,
  name: 'Arc Testnet',
  network: 'arc-testnet',
  nativeCurrency: { name: 'ARC', symbol: 'ARC', decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
} as const

const event = parseAbiItem(
  'event ScoreSubmitted(address indexed player, uint256 score)',
)

/**
 * GET /api/debug-events
 * Fetches last 10 ScoreSubmitted logs from the leaderboard contract.
 * Use to confirm blockchain → server connection and event shape.
 */
export async function GET() {
  try {
    if (!LEADERBOARD_CONTRACT_ADDRESS || !LEADERBOARD_CONTRACT_ADDRESS.startsWith('0x')) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS not set' },
        { status: 500 },
      )
    }

    const contractAddress = LEADERBOARD_CONTRACT_ADDRESS as `0x${string}`
    const publicClient = createPublicClient({
      chain: arcTestnetChain,
      transport: http(RPC_URL),
    })

    const latest = await publicClient.getBlockNumber()
    const fromBlock = latest > 100000n ? latest - 100000n : 0n

    const logs = await publicClient.getLogs({
      address: contractAddress,
      event,
      fromBlock,
      toBlock: latest,
    })

    const last10 = logs.slice(-10).map((log) => {
      const args = log.args as { player?: string; score?: bigint }
      return {
        wallet: args.player?.toLowerCase() ?? '',
        score: args.score != null ? Number(args.score) : 0,
        blockNumber: log.blockNumber?.toString(),
      }
    })

    return NextResponse.json({
      contract: contractAddress,
      fromBlock: fromBlock.toString(),
      toBlock: latest.toString(),
      totalLogs: logs.length,
      last10,
    })
  } catch (err) {
    console.error('debug-events:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch events' },
      { status: 500 },
    )
  }
}
