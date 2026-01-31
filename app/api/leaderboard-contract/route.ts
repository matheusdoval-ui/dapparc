/**
 * @file route.ts
 * @description API para leaderboard diretamente do contrato ArcLeaderboard
 * Usa getUsersCount, getUserAt, getScore
 */

import { NextResponse } from 'next/server'
import { loadLeaderboard } from '@/lib/leaderboard'

export async function GET() {
  try {
    const data = await loadLeaderboard()
    return NextResponse.json({
      success: true,
      leaderboard: data,
      total: data.length,
    })
  } catch (error) {
    console.error('Error fetching leaderboard from contract:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch leaderboard'
    return NextResponse.json(
      { success: false, error: message, leaderboard: [], total: 0 },
      { status: 500 }
    )
  }
}
