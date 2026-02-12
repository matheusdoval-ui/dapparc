'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trophy } from 'lucide-react'
import { LeaderboardTable } from './LeaderboardTable'
import type { LeaderboardEntry } from './LeaderboardTable'

const REFRESH_INTERVAL_MS = 20_000
const API_URL = '/api/game-leaderboard'

export function GameLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(API_URL, { cache: 'no-store' })
      const text = await res.text()
      let data: Array<{ wallet: string; bestScore: number; name?: string }>
      try {
        data = JSON.parse(text)
      } catch {
        data = []
      }
      if (!res.ok) throw new Error(text || res.statusText)
      setEntries(
        data.map((item, i) => ({
          rank: i + 1,
          address: item.wallet,
          name: item.name,
          score: item.bestScore,
        })),
      )
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard')
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  useEffect(() => {
    const interval = setInterval(fetchLeaderboard, REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchLeaderboard])

  useEffect(() => {
    const onUpdate = () => fetchLeaderboard()
    if (typeof window !== 'undefined') {
      window.addEventListener('leaderboard-updated', onUpdate)
      return () => window.removeEventListener('leaderboard-updated', onUpdate)
    }
  }, [fetchLeaderboard])

  return (
    <div className="card-glow-cyan relative w-full max-w-2xl overflow-hidden rounded-xl bg-black/40 p-0 backdrop-blur-sm">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 200, 255, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 200, 255, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />
      <div className="relative p-5 sm:p-4">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground">
          <Trophy className="h-4 w-4 text-arc-accent" />
          Leaderboard
        </h3>
        <LeaderboardTable entries={entries} loading={loading} error={error} />
      </div>
    </div>
  )
}
