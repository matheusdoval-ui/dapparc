"use client"

import { useEffect, useState, useCallback } from "react"
import { Activity, Trophy, ExternalLink, RefreshCw, Sparkles, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { loadLeaderboard, type LeaderboardEntry } from "@/lib/leaderboard"

const CACHE_KEY = "leaderboard_cache"
const REFRESH_INTERVAL_MS = 20000

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const data = await loadLeaderboard()
      setLeaderboard(data)
      setError(null)
      if (typeof window !== "undefined") {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data))
      }
    } catch (err) {
      console.error("RPC error loading leaderboard:", err)
      setError(err instanceof Error ? err.message : "Failed to load leaderboard")
      if (typeof window !== "undefined") {
        const cache = localStorage.getItem(CACHE_KEY)
        if (cache) {
          try {
            const parsed = JSON.parse(cache) as LeaderboardEntry[]
            setLeaderboard(parsed)
          } catch (e) {
            console.warn("Could not parse leaderboard cache", e)
          }
        }
      }
    } finally {
      setLoading(false)
    }
  }, [])

<<<<<<< HEAD
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchData])

  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`
=======
  // Refetch when a user is saved on-chain (e.g. from home after connecting wallet)
  useEffect(() => {
    const onLeaderboardUpdated = () => {
      fetchLeaderboard()
    }
    window.addEventListener("leaderboard-updated", onLeaderboardUpdated)
    return () => window.removeEventListener("leaderboard-updated", onLeaderboardUpdated)
  }, [])

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }
>>>>>>> 3813cb1 (deploy)

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5" />
    if (rank === 2) return <Trophy className="h-4 w-4" />
    if (rank === 3) return <Trophy className="h-4 w-4" />
    return `#${rank}`
  }

  const isTopThree = (rank: number) => rank <= 3

  if (loading && leaderboard.length === 0) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <a href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <span>←</span> Back to Home
            </a>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button onClick={() => { setLoading(true); fetchData().finally(() => setLoading(false)) }} variant="outline" size="sm" disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Trophy className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">ARC Activity Leaderboard</h1>
              <p className="text-sm text-muted-foreground">Ranking of the most active wallets on ARC Network. Ranked by score (ArcLeaderboard contract).</p>
              {leaderboard.length > 0 && <p className="text-xs text-muted-foreground mt-1">{leaderboard.length} wallets • Auto-refresh every 20s</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 rounded-lg border bg-card p-4">
          <h3 className="font-medium mb-2">How to Appear in the Leaderboard</h3>
          <p className="text-sm text-muted-foreground">Entries are registered on-chain via the ArcLeaderboard contract. Score is assigned by the contract owner. Data reloads every 20 seconds.</p>
        </div>

        {error && leaderboard.length === 0 ? (
          <Card className="border-destructive/50 bg-destructive/10 p-6">
            <p className="text-destructive font-medium mb-2">Error loading leaderboard</p>
            <p className="text-sm text-muted-foreground mb-2">{error}</p>
            <p className="text-xs text-muted-foreground">Ensure NEXT_PUBLIC_ARC_RPC is set and the ArcLeaderboard contract is deployed.</p>
          </Card>
        ) : error && leaderboard.length > 0 ? (
          <div className="mb-4 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-sm">Showing cached data. RPC error: {error}</div>
        ) : null}

        {leaderboard.length === 0 && !loading ? (
          <Card className="p-12 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="font-medium mb-2">No leaderboard data yet</p>
            <p className="text-sm text-muted-foreground">The ArcLeaderboard contract has no registered users. Connect and interact on the home page to register.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => {
              const rank = entry.rank ?? index + 1
              const isTop3 = isTopThree(rank)
              return (
                <Card key={entry.address} className={`p-4 ${isTop3 ? 'border-primary/30' : ''}`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isTop3 ? 'bg-primary text-primary-foreground' : 'bg-muted'} font-bold text-sm`}>
                      {getRankIcon(rank)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-medium">{shortenAddress(entry.address)}</p>
                        <a href={`https://testnet.arcscan.app/address/${entry.address}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                      {isTop3 && <span className="text-xs text-muted-foreground">{rank === 1 ? 'Champion' : rank === 2 ? 'Runner-up' : 'Third Place'}</span>}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                        <Activity className="h-3.5 w-3.5" /> Score
                      </div>
                      <p className="font-semibold">{entry.score.toLocaleString()}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
