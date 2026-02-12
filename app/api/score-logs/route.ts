import { createPublicClient, http } from 'viem'
import { arcTestnet } from '@/lib/chains'
import { leaderboardAbi } from '@/lib/abis/leaderboard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const address = process.env.NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS as `0x${string}`

    if (!address || !address.startsWith('0x')) {
      return Response.json(
        { error: 'NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS not set' },
        { status: 500 },
      )
    }

    const client = createPublicClient({
      chain: arcTestnet,
      transport: http('https://rpc.testnet.arc.network/'),
    })

    const block = await client.getBlockNumber()

    const scoreSubmittedEvent = leaderboardAbi.find((e) => e.name === 'ScoreSubmitted')
    if (!scoreSubmittedEvent || scoreSubmittedEvent.type !== 'event') {
      return Response.json({ error: 'ScoreSubmitted event not found in ABI' }, { status: 500 })
    }

    const logs = await client.getLogs({
      address,
      event: scoreSubmittedEvent,
      fromBlock: block - 8000n,
      toBlock: 'latest',
    })

    return Response.json({
      contract: address,
      currentBlock: block.toString(),
      logsFound: logs.length,
      logs,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch logs'
    return Response.json({ error: message }, { status: 500 })
  }
}
