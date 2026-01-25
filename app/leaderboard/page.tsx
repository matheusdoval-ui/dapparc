"use client"

import { useEffect, useState } from "react"
import { Activity, Trophy, ExternalLink, RefreshCw, Sparkles, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"

interface LeaderboardEntry {
  address: string
  transactions: number
  firstTransactionTimestamp: number | null
  rank: number
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/leaderboard?limit=100')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch leaderboard')
      }

      const data = await response.json()
      const raw = Array.isArray(data.leaderboard) ? data.leaderboard : []
      // Sort by transactions (desc) – rank = position; safe for missing values
      const sorted = [...raw].sort(
        (a, b) => (Number(b?.transactions) || 0) - (Number(a?.transactions) || 0)
      )
      const withRank = sorted.map((e, i) => ({ ...e, rank: i + 1 }))
      setLeaderboard(withRank)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load leaderboard'
      setError(errorMessage)
      console.error('Error fetching leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6" />
    if (rank === 2) return <Trophy className="h-5 w-5" />
    if (rank === 3) return <Trophy className="h-5 w-5" />
    return `#${rank}`
  }

  const getRankStyle = (rank: number) => {
    if (rank === 1) {
      return {
        gradient: 'from-yellow-400 via-arc-accent to-cyan-300',
        glow: 'shadow-[0_0_30px_rgba(0,174,239,0.5)]',
        border: 'border-yellow-400/50',
        scale: 'scale-105'
      }
    }
    if (rank === 2) {
      return {
        gradient: 'from-gray-300 to-gray-500',
        glow: 'shadow-[0_0_20px_rgba(156,163,175,0.4)]',
        border: 'border-gray-400/50',
        scale: 'scale-103'
      }
    }
    if (rank === 3) {
      return {
        gradient: 'from-orange-400 to-orange-600',
        glow: 'shadow-[0_0_20px_rgba(251,146,60,0.4)]',
        border: 'border-orange-400/50',
        scale: 'scale-103'
      }
    }
    return {
      gradient: 'from-arc-accent/80 to-cyan-300/80',
      glow: '',
      border: 'border-white/10',
      scale: ''
    }
  }

  const isTopThree = (rank: number) => rank <= 3

  if (loading) {
    return (
      <main className="min-h-screen bg-arc-mesh text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-arc-accent/30 border-t-arc-accent mx-auto mb-6" />
            <Sparkles className="h-8 w-8 text-arc-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-muted-foreground text-lg">Loading leaderboard...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-arc-mesh text-foreground relative overflow-hidden">

      {/* Header */}
      <div className="relative border-b border-arc-accent/20 bg-white/80 backdrop-blur-xl shadow-[0_0_40px_rgba(0,174,239,0.06)] dark:bg-black/40 dark:shadow-[0_0_40px_rgba(0,174,239,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <a
              href="/"
              className="group flex items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm tracking-wide text-foreground/70 transition-all hover:border-arc-accent/30 hover:bg-arc-accent/5 hover:text-arc-accent hover:shadow-[0_0_16px_rgba(0,174,239,0.2)]"
            >
              <span>←</span>
              <span>Back to Home</span>
            </a>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            <Button
              onClick={fetchLeaderboard}
              variant="outline"
              className="group border-arc-accent/20 bg-white/60 hover:border-arc-accent/50 hover:bg-arc-accent/10 hover:shadow-[0_0_20px_rgba(0,174,239,0.2)] dark:bg-black/30 transition-all duration-200"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              Refresh
            </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-arc-accent to-cyan-300 rounded-2xl blur-xl opacity-50 animate-pulse" />
              <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-arc-accent to-cyan-300 flex items-center justify-center shadow-[0_0_30px_rgba(0,174,239,0.5)]">
                <Trophy className="h-10 w-10 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-black mb-3 tracking-[0.1em] bg-gradient-to-r from-foreground via-arc-accent to-cyan-300 bg-clip-text text-transparent dark:from-white">
                ARC Activity Leaderboard
              </h1>
              <p className="text-muted-foreground text-lg tracking-wide">
                Ranking of the most active wallets on ARC Network
              </p>
              <p className="text-arc-accent/80 text-sm mt-2 font-medium">
                Ranked by number of transactions (most first)
              </p>
              {leaderboard.length > 0 && (
                <p className="text-white/50 text-sm mt-1">
                  {leaderboard.length} {leaderboard.length === 1 ? 'wallet' : 'wallets'} tracked
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Registration requirement notice */}
        <div className="mb-8 rounded-xl border border-arc-accent/25 bg-arc-accent/5 px-6 py-5 backdrop-blur-md shadow-[0_0_24px_rgba(0,174,239,0.1)]">
          <div className="flex items-start gap-4">
            <div className="rounded-xl border border-arc-accent/20 bg-arc-accent/15 p-3 flex-shrink-0 shadow-[0_0_12px_rgba(0,174,239,0.2)]">
              <Trophy className="h-6 w-6 text-arc-accent" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold tracking-wide text-foreground mb-2">How to Appear in the Leaderboard</h3>
              <p className="text-foreground/80 text-sm mb-3">
                To appear in the ARC Activity Leaderboard, you need to:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
                <li>Connect your wallet using MetaMask or Rabby Wallet on the home page</li>
                <li>Your wallet is added automatically and ranked by <strong>number of transactions</strong> (higher = better rank)</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-3 italic">
                Note: Manual wallet lookups are not added. Only connected wallets appear. Rank is by transaction count and is preserved.
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <Card className="border-red-500/30 bg-red-500/10 backdrop-blur-sm p-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-red-500/20 p-3">
                <Trophy className="h-6 w-6 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-red-400 mb-2 font-semibold text-lg">Error loading leaderboard</p>
                <p className="text-white/70 text-sm mb-4">{error}</p>
                <p className="text-white/60 text-xs">
                  Note: The leaderboard requires address tracking. For production, implement with an indexer or subgraph.
                </p>
              </div>
            </div>
          </Card>
        ) : leaderboard.length === 0 ? (
          <Card className="border-arc-accent/15 bg-white/60 backdrop-blur-md p-12 text-center shadow-[0_0_30px_rgba(0,174,239,0.06)] dark:bg-black/30 dark:shadow-[0_0_30px_rgba(0,174,239,0.08)]">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-foreground/5 mb-6">
              <Trophy className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-foreground/80 mb-2 text-lg font-medium">No leaderboard data available</p>
            <p className="text-muted-foreground text-sm">
              Connect your wallet on the home page to appear here. Entries are ranked by number of transactions.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => {
              const rankStyle = getRankStyle(entry.rank)
              const isTop3 = isTopThree(entry.rank)
              
              return (
                <Card
                  key={entry.address}
                  className={`
                    group relative overflow-hidden
                    border ${rankStyle.border}
                    ${isTop3 ? 'bg-gradient-to-r from-white/10 to-white/5' : 'bg-white/5'}
                    backdrop-blur-sm
                    p-6
                    transition-all duration-300
                    hover:scale-[1.02] hover:shadow-xl
                    ${rankStyle.glow}
                    ${isTop3 ? 'hover:border-opacity-100' : 'hover:border-arc-accent/30 hover:shadow-[0_0_24px_rgba(0,174,239,0.15)]'}
                    animate-slide-up
                  `}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    animationDuration: '0.5s',
                    animationFillMode: 'both'
                  }}
                >
                  {/* Glow effect for top 3 */}
                  {isTop3 && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${rankStyle.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl`} />
                  )}
                  
                  {/* Content */}
                  <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0">
                      <div className={`
                        relative
                        ${isTop3 ? 'h-16 w-16' : 'h-14 w-14'}
                        rounded-2xl
                        bg-gradient-to-br ${rankStyle.gradient}
                        flex items-center justify-center
                        text-white font-bold
                        ${isTop3 ? 'text-2xl shadow-lg' : 'text-lg'}
                        ${rankStyle.scale}
                        transition-transform duration-300 group-hover:scale-110
                      `}>
                        {isTop3 ? (
                          <div className="relative">
                            {getRankIcon(entry.rank)}
                            {entry.rank === 1 && (
                              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300 animate-pulse" />
                            )}
                          </div>
                        ) : (
                          <span className="font-extrabold">#{entry.rank}</span>
                        )}
                        {entry.rank === 1 && (
                          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-arc-accent rounded-2xl blur opacity-50 animate-pulse" />
                        )}
                      </div>
                    </div>

                    {/* Address Section */}
                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-mono text-lg sm:text-xl font-bold text-white group-hover:text-arc-accent transition-colors">
                          {shortenAddress(entry.address)}
                        </p>
                        <a
                          href={`https://testnet.arcscan.app/address/${entry.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/50 hover:text-arc-accent transition-all duration-200 hover:scale-110"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      {isTop3 && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`
                            text-xs font-semibold px-2 py-0.5 rounded-full
                            ${entry.rank === 1 ? 'bg-yellow-400/20 text-yellow-300' : ''}
                            ${entry.rank === 2 ? 'bg-gray-400/20 text-gray-300' : ''}
                            ${entry.rank === 3 ? 'bg-orange-400/20 text-orange-300' : ''}
                          `}>
                            {entry.rank === 1 ? '🏆 Champion' : entry.rank === 2 ? '🥈 Runner-up' : '🥉 Third Place'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 sm:gap-8 w-full sm:w-auto justify-between sm:justify-end">
                      {/* Transactions */}
                      <div className="text-center sm:text-right">
                        <div className="flex items-center gap-2 text-white/60 mb-2 justify-center sm:justify-end">
                          <Activity className="h-4 w-4" />
                          <span className="text-xs uppercase tracking-wider text-xs">Transactions</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-arc-accent to-cyan-300 bg-clip-text text-transparent">
                          {entry.transactions.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar for top 3 */}
                  {isTop3 && entry.rank === 1 && leaderboard.length > 1 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-arc-accent to-cyan-300 opacity-50" />
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
