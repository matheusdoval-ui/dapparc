'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, Trophy, Award } from 'lucide-react'
import { useRecordGame } from '@/lib/use-record-game'
import { StatsCard } from './StatsCard'
import { TopFiveList } from './TopFiveList'

export function HeroStatsCards() {
  const { isConnected, address } = useRecordGame()
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [top5, setTop5] = useState<{ address: string; score: number; name?: string }[]>([])
  const [bestScore, setBestScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard-on-chain', { cache: 'no-store' })
      const data = (await res.json()) as {
        list: { wallet: string; bestScore: number; name?: string }[]
        totalPlayers: number
      }
      const items = data?.list ?? []
      setTotalPlayers(typeof data?.totalPlayers === 'number' ? data.totalPlayers : 0)
      setTop5(
        items
          .map((e) => ({ address: e.wallet, score: e.bestScore, name: e.name }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
      )
    } catch {
      setTotalPlayers(0)
      setTop5([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchBestScore = useCallback(async (addr: string) => {
    try {
      const res = await fetch(`/api/leaderboard/score/${encodeURIComponent(addr)}`, { cache: 'no-store' })
      const data = await res.json()
      if (typeof data.bestScore === 'number') setBestScore(data.bestScore)
      else setBestScore(0)
    } catch {
      setBestScore(0)
    }
  }, [])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  useEffect(() => {
    if (address) fetchBestScore(address)
    else setBestScore(null)
  }, [address, fetchBestScore])

  useEffect(() => {
    const onUpdate = () => {
      fetchLeaderboard()
      if (address) fetchBestScore(address)
    }
    window.addEventListener('leaderboard-updated', onUpdate)
    return () => window.removeEventListener('leaderboard-updated', onUpdate)
  }, [fetchLeaderboard, fetchBestScore, address])

  return (
    <section className="mt-8 grid w-full max-w-4xl grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <StatsCard icon={Users} title="Players On-Chain" loading={loading}>
        <p className="text-3xl font-black tabular-nums text-[#00f7ff] drop-shadow-[0_0_12px_rgba(0,247,255,0.5)] sm:text-4xl">
          {totalPlayers}
        </p>
      </StatsCard>

      <StatsCard icon={Trophy} title="Top 5 On-Chain" colSpan={2}>
        <TopFiveList items={top5} loading={loading} />
      </StatsCard>

      <StatsCard
        icon={Award}
        title="Your Best Score"
        colSpan={3}
        loading={isConnected && bestScore === null}
      >
        {!isConnected ? (
          <p className="text-sm text-muted-foreground">Connect wallet to track your best score</p>
        ) : (
          <p className="text-3xl font-black tabular-nums text-[#00f7ff] drop-shadow-[0_0_12px_rgba(0,247,255,0.5)] sm:text-4xl">
            {bestScore}
          </p>
        )}
      </StatsCard>
    </section>
  )
}
