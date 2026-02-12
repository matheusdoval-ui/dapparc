import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { getLeaderboard } from '@/lib/leaderboard-storage'

const RPC = process.env.NEXT_PUBLIC_ARC_RPC || process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network'
const PRIVATE_KEY = process.env.LEADERBOARD_OWNER_KEY || process.env.LEADERBOARD_OWNER_PRIVATE_KEY
const CONTRACT_ADDRESS = '0x7461Fc5EAf38693e98B06B042e37b4adF1453AbD'
const ABI = [
  'function registerUser(address user) external',
  'function addPoints(address user, uint256 amount) external',
]

interface LeaderboardEntry {
  address: string
  transactions: number
  firstTransactionTimestamp: number | null
  arcAge: number | null // days
  rank: number
}

/**
 * POST /api/leaderboard — Backend relayer: owner wallet calls addPoints on ArcLeaderboard.
 * Requires LEADERBOARD_OWNER_KEY in env. Registers user if needed, then adds 1 point.
 */
export async function POST(req: Request) {
  try {
    if (!PRIVATE_KEY || !PRIVATE_KEY.startsWith('0x')) {
      console.warn('Leaderboard POST: LEADERBOARD_OWNER_KEY not set. Set it in .env.local and Vercel.')
      return NextResponse.json(
        { success: false, error: 'LEADERBOARD_NOT_CONFIGURED', message: 'Server not configured for leaderboard write' }
      )
    }

    const { userAddress } = await req.json()
    if (!userAddress || typeof userAddress !== 'string') {
      return NextResponse.json(
        { success: false, error: 'userAddress required' },
        { status: 400 }
      )
    }
    const normalized = userAddress.toLowerCase()
    if (!/^0x[a-f0-9]{40}$/.test(normalized)) {
      return NextResponse.json(
        { success: false, error: 'Invalid address' },
        { status: 400 }
      )
    }

    const provider = new ethers.JsonRpcProvider(RPC, {
      name: 'arc',
      chainId: 5042002,
      ensAddress: null,
    })
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet)

    // Register user if not already (contract requires registered before addPoints)
    try {
      await contract.registerUser(normalized)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (!msg.includes('Already registered')) {
        console.warn('registerUser:', e)
      }
    }

    const tx = await contract.addPoints(normalized, 1)
    await tx.wait()

    return NextResponse.json({ success: true, hash: tx.hash })
  } catch (err) {
    console.error('Leaderboard API error:', err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

/**
 * API endpoint to fetch leaderboard data
 * GET /api/leaderboard?limit=100
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '100', 10)

    // Get leaderboard from storage (based on consulted wallets)
    const walletStats = await getLeaderboard(limit)
    console.log(`📊 Leaderboard request: ${walletStats.length} wallets found`)

    // Convert to leaderboard entries
    // Calculate ARC Age based on first consultation date (simplified)
    const now = Math.floor(Date.now() / 1000)
    const leaderboard: LeaderboardEntry[] = walletStats.map((stat, index) => {
      // Calculate days since first consultation as a proxy for ARC Age
      const daysSinceFirstConsult = Math.floor((now - (stat.firstConsultedAt / 1000)) / 86400)
      
      return {
        address: stat.address,
        transactions: stat.transactions,
        firstTransactionTimestamp: Math.floor(stat.firstConsultedAt / 1000),
        arcAge: daysSinceFirstConsult,
        rank: index + 1,
      }
    })

    console.log(`✅ Returning leaderboard with ${leaderboard.length} entries`)

    return NextResponse.json({
      leaderboard: leaderboard,
      total: leaderboard.length,
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || 'Failed to fetch leaderboard' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
