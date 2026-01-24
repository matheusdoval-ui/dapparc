import { NextRequest, NextResponse } from 'next/server'
import { getWalletRank, getWalletStats } from '@/lib/leaderboard-storage'

/**
 * API endpoint to get rank for a specific wallet
 * GET /api/rank/0x...
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400 }
      )
    }

    const rank = await getWalletRank(address)
    const stats = await getWalletStats(address)

    if (!stats) {
      return NextResponse.json({
        rank: null,
        message: 'Wallet not found in leaderboard yet. Connect or query the wallet to add it.',
      })
    }

    return NextResponse.json({
      address: address,
      rank: rank,
      transactions: stats.transactions,
      arcAge: stats.arcAge,
      consultCount: stats.consultCount,
    })
  } catch (error) {
    console.error('Error fetching rank:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || 'Failed to fetch rank' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
