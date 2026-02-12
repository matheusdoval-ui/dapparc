'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { ExternalLink } from 'lucide-react'

const ARCSCAN_BASE = 'https://testnet.arcscan.app'

export interface LeaderboardEntry {
  rank: number
  address: string
  name?: string
  score: number
}

function getRowStyles(rank: number) {
  if (rank === 1) {
    return {
      border: 'border-amber-500/40',
      bg: 'bg-amber-500/5',
      glow: 'shadow-[0_0_20px_rgba(251,191,36,0.25)]',
      rankText: 'text-amber-400',
      hover: 'hover:bg-amber-500/10 hover:shadow-[0_0_24px_rgba(251,191,36,0.35)]',
    }
  }
  if (rank === 2) {
    return {
      border: 'border-slate-400/40',
      bg: 'bg-slate-400/5',
      glow: 'shadow-[0_0_18px_rgba(148,163,184,0.2)]',
      rankText: 'text-slate-300',
      hover: 'hover:bg-slate-400/10 hover:shadow-[0_0_22px_rgba(148,163,184,0.3)]',
    }
  }
  if (rank === 3) {
    return {
      border: 'border-amber-700/50',
      bg: 'bg-amber-700/5',
      glow: 'shadow-[0_0_18px_rgba(180,83,9,0.25)]',
      rankText: 'text-amber-600',
      hover: 'hover:bg-amber-700/10 hover:shadow-[0_0_22px_rgba(180,83,9,0.35)]',
    }
  }
  return {
    border: 'border-white/10',
    bg: 'bg-white/5',
    glow: '',
    rankText: 'text-muted-foreground',
    hover: 'hover:bg-cyan-500/10 hover:shadow-[0_0_20px_rgba(0,200,255,0.2)] hover:border-cyan-500/30',
  }
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  loading?: boolean
  error?: string | null
  emptyMessage?: string
}

export function LeaderboardTable({
  entries,
  loading = false,
  error = null,
  emptyMessage = 'No scores yet. Play and submit to appear here.',
}: LeaderboardTableProps) {
  if (loading) {
    return (
      <div className="space-y-2 animate-in fade-in duration-300">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-12 w-full bg-white/10" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>
  }

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <div
      className="overflow-x-auto overflow-y-visible scroll-smooth scrollbar-hide"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <table className="w-full min-w-[320px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-cyan-500/30">
            <th className="pb-3 pr-4 text-left font-semibold uppercase tracking-wider text-muted-foreground">
              Rank
            </th>
            <th className="pb-3 pr-4 text-left font-semibold uppercase tracking-wider text-muted-foreground">
              Wallet
            </th>
            <th className="pb-3 pr-4 text-right font-semibold uppercase tracking-wider text-muted-foreground">
              Score
            </th>
            <th className="pb-3 pl-2 text-right font-semibold uppercase tracking-wider text-muted-foreground">
              Explorer
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, idx) => {
            const styles = getRowStyles(e.rank)
            return (
              <tr
                key={`${e.address}-${e.rank}`}
                className={`
                  animate-in fade-in slide-in-from-bottom-2
                  border-b border-white/5 transition-all duration-300
                  ${styles.border} ${styles.bg} ${styles.glow} ${styles.hover}
                `}
                style={{
                  animationDelay: `${idx * 40}ms`,
                  animationDuration: '0.4s',
                  animationFillMode: 'both',
                }}
              >
                <td className="py-3 pr-4">
                  <span className={`font-bold tabular-nums ${styles.rankText}`}>#{e.rank}</span>
                </td>
                <td className="py-3 pr-4 min-w-0 font-mono text-foreground break-all text-sm">
                  {e.address}
                </td>
                <td className="py-3 pr-4 text-right font-bold tabular-nums text-arc-accent">{e.score}</td>
                <td className="py-3 pl-2 text-right">
                  <a
                    href={`${ARCSCAN_BASE}/address/${e.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-cyan-400 transition-all hover:bg-cyan-500/20 hover:text-cyan-300"
                  >
                    View
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
