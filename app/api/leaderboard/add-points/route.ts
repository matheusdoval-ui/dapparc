/**
 * @file route.ts
 * @description API route: addPoints(user, points) on ArcLeaderboard.
 * Uses owner private key server-side. POST only.
 */

import { NextRequest, NextResponse } from 'next/server'
import { addPointsOnChain } from '@/lib/leaderboard-add-points'

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user, points } = body as { user?: string; points?: number }

    if (!user || typeof user !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid user address' },
        { status: 400 }
      )
    }

    if (!ADDRESS_REGEX.test(user)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Ethereum address format' },
        { status: 400 }
      )
    }

    const amount = typeof points === 'number' ? points : 1
    if (amount < 1 || amount > 1_000_000) {
      return NextResponse.json(
        { success: false, error: 'Points must be between 1 and 1000000' },
        { status: 400 }
      )
    }

    const txHash = await addPointsOnChain(user, amount)

    return NextResponse.json({
      success: true,
      txHash,
      user,
      points: amount,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[add-points]', msg)

    if (msg.includes('LEADERBOARD_OWNER_PRIVATE_KEY') || msg.includes('OWNER_PRIVATE_KEY')) {
      return NextResponse.json(
        { success: false, error: 'Server misconfiguration: owner key not set' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    )
  }
}
