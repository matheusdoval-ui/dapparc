import { NextRequest, NextResponse } from 'next/server'
import { JsonRpcProvider } from 'ethers'
import { recordWalletConsultation } from '@/lib/leaderboard-storage'

// ARC Testnet Configuration
const ARC_RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network'
const ARC_CHAIN_ID = 5042002

/**
 * API endpoint to fetch wallet statistics from ARC Testnet
 * GET /api/wallet-stats?address=0x...&connected=true
 * 
 * @param address - Wallet address to check
 * @param connected - Whether wallet was connected (true) or manual lookup (false/undefined)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get('address')
    const connected = searchParams.get('connected') === 'true' // Only true if explicitly passed

    // Validate address parameter
    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      )
    }

    // Validate Ethereum address format (case-insensitive)
    const normalizedAddress = address.toLowerCase()
    if (!/^0x[a-f0-9]{40}$/.test(normalizedAddress)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400 }
      )
    }

    // Connect to ARC Testnet using ethers.js
    const provider = new JsonRpcProvider(ARC_RPC_URL)

    // Get transaction count (nonce) which represents total interactions
    // This is the number of transactions sent from this address
    const txCount = await provider.getTransactionCount(normalizedAddress, 'latest')

    // Get USDC balance (native balance on Arc)
    const balance = await provider.getBalance(normalizedAddress)
    // Convert from wei (18 decimals) to USDC display (6 decimals)
    const balanceUSDC = Number(balance) / 1e18

    // Record wallet consultation for leaderboard
    // Only records if wallet was connected AND payment is verified
    // Manual lookups (connected=false) are NOT added to leaderboard
    // ARC Age will be calculated later if needed, for now pass null to avoid slow lookups
    try {
      const result = await recordWalletConsultation(normalizedAddress, txCount, null, connected)
      if (result.recorded) {
        console.log(`✅ Wallet consultation recorded to leaderboard: ${normalizedAddress}, TX: ${txCount}, Connected: ${connected}`)
      } else {
        console.log(`⛔ Wallet consultation not recorded: ${result.reason}`)
      }
    } catch (error) {
      console.error('Error recording wallet consultation:', error)
    }

    // Return wallet statistics
    return NextResponse.json({
      address: normalizedAddress,
      txCount: txCount,
      balance: balanceUSDC,
      balanceFormatted: balanceUSDC.toFixed(2),
      network: 'Arc Testnet',
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching wallet stats:', error)

    // Handle RPC errors
    if (error instanceof Error) {
      // Check for common RPC errors
      if (error.message.includes('network') || error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'RPC connection failed. Please try again later.' },
          { status: 503 }
        )
      }

      return NextResponse.json(
        { error: error.message || 'Failed to fetch wallet statistics' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
