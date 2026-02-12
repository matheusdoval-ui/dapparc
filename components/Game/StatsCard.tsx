'use client'

import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  icon: LucideIcon
  title: string
  /** When true, shows skeleton instead of children */
  loading?: boolean
  children: React.ReactNode
  className?: string
  /** Column span on sm+ screens (default 1) */
  colSpan?: 1 | 2 | 3
}

const cardBase =
  'card-glow-cyan flex flex-col rounded-xl bg-black/30 p-5 sm:p-4 backdrop-blur-sm min-w-0 w-full transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,200,255,0.3)]'

const colSpanClass = {
  1: '',
  2: 'sm:col-span-2',
  3: 'sm:col-span-3',
} as const

export function StatsCard({ icon: Icon, title, loading, children, className = '', colSpan = 1 }: StatsCardProps) {
  return (
    <div className={`${cardBase} ${colSpanClass[colSpan]} ${className}`}>
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-5 w-5 text-[#00f7ff] drop-shadow-[0_0_8px_rgba(0,247,255,0.6)]" />
        <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
      </div>
      {loading ? (
        <div className="h-10 w-16 animate-pulse rounded bg-white/10" />
      ) : (
        children
      )}
    </div>
  )
}
