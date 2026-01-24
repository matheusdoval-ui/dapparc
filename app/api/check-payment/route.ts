import { NextRequest, NextResponse } from 'next/server'
import { hasPaidLeaderboardFee, DEVELOPER_WALLET } from '@/lib/payment-verification'

/**
 * API endpoint to check if a wallet has paid the leaderboard fee
 * GET /api/check-payment?address=0x...
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      )
    }

    const normalizedAddress = address.toLowerCase()
    if (!/^0x[a-f0-9]{40}$/.test(normalizedAddress)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400 }
      )
    }

    const hasPaid = await hasPaidLeaderboardFee(normalizedAddress)

    return NextResponse.json({
      address: normalizedAddress,
      hasPaid,
      developerWallet: DEVELOPER_WALLET,
      minimumPayment: '1 USDC',
      message: hasPaid 
        ? 'Payment verified. Wallet is eligible for leaderboard.'
        : 'Payment required. Send at least 1 USDC to the developer wallet to appear in leaderboard.'
    })
  } catch (error) {
    console.error('Error checking payment:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || 'Failed to check payment status' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
