import { NextRequest, NextResponse } from 'next/server'
import { isWalletRegistered, REGISTRY_CONTRACT } from '@/lib/registration-verification'

/**
 * API endpoint to check if a wallet is registered for leaderboard
 * GET /api/check-registration?address=0x...
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

    const isRegistered = await isWalletRegistered(normalizedAddress)

    return NextResponse.json({
      address: normalizedAddress,
      isRegistered,
      registryContract: REGISTRY_CONTRACT || null,
      message: isRegistered 
        ? 'Wallet is registered on-chain. Eligible for leaderboard.'
        : REGISTRY_CONTRACT 
          ? 'On-chain registration required. Connect your wallet and call register() on the LeaderboardRegistry contract to appear in leaderboard.'
          : 'Registry contract not deployed. All connected wallets are eligible (backward compatibility).'
    })
  } catch (error) {
    console.error('Error checking registration:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || 'Failed to check registration status' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
