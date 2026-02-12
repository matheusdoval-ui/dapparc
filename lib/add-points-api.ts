/**
 * @file add-points-api.ts
 * @description Client-side helper to call addPoints API.
 * Call when user connects wallet or performs an action.
 */

export async function addPointsViaApi(
  user: string,
  points: number = 1
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const res = await fetch('/api/leaderboard/add-points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, points }),
    })
    const data = await res.json()

    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to add points' }
    }

    return { success: true, txHash: data.txHash }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { success: false, error: msg }
  }
}
