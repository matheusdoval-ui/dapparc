'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trophy } from 'lucide-react'

export function LeaderboardTop5() {
  const [list, setList] = useState<{ address: string; score: number; name?: string }[]>([])
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [loading, setLoading] = useState(true)

  const getLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard-on-chain', { cache: 'no-store' })
      const data = (await res.json()) as { list: { wallet: string; bestScore: number; name?: string }[]; totalPlayers: number }
      const items = data?.list ?? []
      const sorted = items
        .map((e) => ({ address: e.wallet, score: e.bestScore, name: e.name }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
      setList(sorted)
      setTotalPlayers(typeof data?.totalPlayers === 'number' ? data.totalPlayers : 0)
    } catch {
      setList([])
      setTotalPlayers(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getLeaderboard()
  }, [getLeaderboard])

  useEffect(() => {
    const onUpdate = () => getLeaderboard()
    window.addEventListener('leaderboard-updated', onUpdate)
    return () => window.removeEventListener('leaderboard-updated', onUpdate)
  }, [getLeaderboard])

  if (loading) {
    return (
      <div className="w-full max-w-xs rounded-xl border border-arc-accent/20 bg-muted/30 px-4 py-3">
        <div className="mb-2 h-5 w-32 animate-pulse rounded bg-muted/50" />
        <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground">
          <Trophy className="h-3.5 w-3.5 text-arc-accent" />
          Top 5 On-Chain
        </h3>
        <div className="space-y-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-6 animate-pulse rounded bg-muted/50" />
          ))}
        </div>
      </div>
    )
  }

  if (list.length === 0) {
    return (
      <div className="w-full max-w-xs rounded-xl border border-arc-accent/20 bg-muted/30 px-4 py-3">
        <p className="mb-2 text-sm font-medium text-foreground">
          👥 Players On-Chain: <span className="font-bold tabular-nums text-arc-accent">{totalPlayers}</span>
        </p>
        <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground">
          <Trophy className="h-3.5 w-3.5 text-arc-accent" />
          Top 5 On-Chain
        </h3>
        <p className="text-xs text-muted-foreground">No scores yet. Play and submit on-chain!</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-xs rounded-xl border border-arc-accent/20 bg-muted/30 px-4 py-3">
      <p className="mb-2 text-sm font-medium text-foreground">
        👥 Players On-Chain: <span className="font-bold tabular-nums text-arc-accent">{totalPlayers}</span>
      </p>
      <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground">
        <Trophy className="h-3.5 w-3.5 text-arc-accent" />
        Top 5 On-Chain
      </h3>
      <ul className="space-y-1">
        {list.map((p, i) => (
          <li key={`${p.address}-${i}`} className="text-sm font-mono text-foreground break-all">
            #{i + 1} {p.address} — {p.score}
          </li>
        ))}
      </ul>
    </div>
  )
}
