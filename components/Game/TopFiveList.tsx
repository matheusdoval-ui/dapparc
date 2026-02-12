'use client'

export interface TopFiveEntry {
  address: string
  score: number
  name?: string
}

interface TopFiveListProps {
  items: TopFiveEntry[]
  loading?: boolean
  emptyMessage?: string
}

export function TopFiveList({ items, loading, emptyMessage = 'No scores yet. Play and submit on-chain!' }: TopFiveListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 animate-pulse rounded bg-white/10" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <ul className="space-y-1.5">
      {items.map((p, i) => (
        <li
          key={`${p.address}-${i}`}
          className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm transition-all duration-300 hover:border-cyan-500/20"
        >
          <span className="text-muted-foreground break-all">
            <span className="font-bold text-arc-accent">#{i + 1}</span>{' '}
            {p.address}
          </span>
          <span className="font-bold tabular-nums text-[#00f7ff]">{p.score}</span>
        </li>
      ))}
    </ul>
  )
}
