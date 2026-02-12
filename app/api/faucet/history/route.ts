/**
 * GET /api/faucet/history — Returns last 50 faucet claims.
 * Server-side only. No secrets exposed.
 */

import { NextResponse } from "next/server"
import { getRecentClaims } from "@/lib/faucet-history"

export async function GET() {
  try {
    const limit = 50
    const claims = getRecentClaims(limit)
    return NextResponse.json({ success: true, claims })
  } catch (err) {
    console.error("Faucet history error:", err)
    return NextResponse.json(
      { success: false, error: "Failed to load history" },
      { status: 500 }
    )
  }
}
