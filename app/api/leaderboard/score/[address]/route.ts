import { NextResponse } from 'next/server'
import { readBestScoreOnChain } from '@/lib/read-best-score-on-chain'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/leaderboard/score/[address]
 * Returns bestScore for the given address from the on-chain contract.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params
    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 })
    }

    const score = await readBestScoreOnChain(address)
    if (score === null) {
      return NextResponse.json(
        { error: 'Failed to read score or invalid address' },
        { status: 400 },
      )
    }

    return NextResponse.json({ address: address.toLowerCase(), bestScore: score })
  } catch (err) {
    console.error('leaderboard/score:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to read score' },
      { status: 500 },
    )
  }
}
