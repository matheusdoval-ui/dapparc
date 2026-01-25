"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { Trophy, BarChart3, TrendingUp, Coins, Globe, ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface NetworkStats {
  daily: { date: string; transactions: number }[]
  weekly: { week: string; transactions: number }[]
}

interface ActiveAddresses {
  dates: string[]
  addresses: number[]
}

interface TopToken {
  address: string
  symbol: string
  name: string
  usage: number
  percentage: number
}

interface DAppUsage {
  name: string
  usage: number
  percentage: number
}

const COLORS = [
  "hsl(195, 100%, 47%)", // arc-accent
  "hsl(195, 80%, 55%)",
  "hsl(195, 60%, 63%)",
  "hsl(195, 40%, 71%)",
  "hsl(195, 20%, 79%)",
  "hsl(195, 10%, 87%)",
  "hsl(195, 5%, 93%)",
  "hsl(195, 2%, 97%)",
  "hsl(195, 1%, 99%)",
  "hsl(195, 0.5%, 100%)",
]

export default function DashboardPage() {
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null)
  const [activeAddresses, setActiveAddresses] = useState<ActiveAddresses | null>(null)
  const [topTokens, setTopTokens] = useState<TopToken[]>([])
  const [dappUsage, setDappUsage] = useState<DAppUsage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        const fetchWithTimeout = async (url: string, timeout = 10000): Promise<Response> => {
          return Promise.race([
            fetch(url),
            new Promise<Response>((_, reject) =>
              setTimeout(() => reject(new Error("Timeout")), timeout)
            ),
          ])
        }

        const [statsRes, addressesRes, tokensRes, dappsRes] = await Promise.allSettled([
          fetchWithTimeout("/api/network-stats"),
          fetchWithTimeout("/api/active-addresses"),
          fetchWithTimeout("/api/top-tokens"),
          fetchWithTimeout("/api/dapp-usage"),
        ])

        if (statsRes.status === "fulfilled" && statsRes.value.ok) {
          try {
            const stats = await statsRes.value.json()
            if (stats && (stats.daily || stats.weekly)) {
              setNetworkStats(stats)
            }
          } catch (e) {
            console.error("Error parsing network stats:", e)
          }
        }

        if (addressesRes.status === "fulfilled" && addressesRes.value.ok) {
          try {
            const addresses = await addressesRes.value.json()
            if (addresses && addresses.dates && addresses.addresses) {
              setActiveAddresses(addresses)
            }
          } catch (e) {
            console.error("Error parsing active addresses:", e)
          }
        }

        if (tokensRes.status === "fulfilled" && tokensRes.value.ok) {
          try {
            const tokens = await tokensRes.value.json()
            if (Array.isArray(tokens) && tokens.length > 0) {
              setTopTokens(tokens)
            }
          } catch (e) {
            console.error("Error parsing top tokens:", e)
          }
        }

        if (dappsRes.status === "fulfilled" && dappsRes.value.ok) {
          try {
            const dapps = await dappsRes.value.json()
            if (Array.isArray(dapps) && dapps.length > 0) {
              setDappUsage(dapps)
            }
          } catch (e) {
            console.error("Error parsing dApp usage:", e)
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const activeAddressesChartData =
    activeAddresses?.dates.map((date, i) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      addresses: activeAddresses.addresses[i],
    })) || []

  return (
    <main className="min-h-screen bg-arc-mesh px-4 py-8 text-foreground">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between border-b border-arc-accent/20 bg-white/80 backdrop-blur-xl px-4 py-3 sm:px-6 dark:bg-black/40">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1 text-foreground/90 transition-all hover:border-arc-accent/30 hover:bg-arc-accent/5 hover:text-arc-accent"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-semibold">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-arc-accent" />
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">Arc Network Dashboard</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Testnet Metrics</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/leaderboard"
            className="flex items-center gap-1.5 rounded-lg border border-arc-accent/20 bg-arc-accent/5 px-3 py-1.5 text-xs font-medium text-arc-accent transition-all hover:bg-arc-accent/10 hover:border-arc-accent/40"
          >
            <Trophy className="h-3.5 w-3.5" />
            Leaderboard
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-arc-accent border-t-transparent" />
              <p className="text-sm text-muted-foreground">Loading Arc Network Testnet metrics...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Volume de Transações */}
            <section className="rounded-xl border border-arc-accent/15 bg-white/60 p-6 backdrop-blur-md dark:bg-black/30">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-arc-accent" />
                  <h2 className="text-lg font-bold">Transaction Volume</h2>
                </div>
                <span className="rounded-full border border-arc-accent/30 bg-arc-accent/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-arc-accent">
                  Arc Network Testnet
                </span>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Daily</h3>
                  {networkStats?.daily && networkStats.daily.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={networkStats.daily}>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.6} />
                        <YAxis tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.6} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            border: "1px solid rgba(0, 174, 239, 0.3)",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="transactions" fill="hsl(195, 100%, 47%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="py-10 text-center text-sm text-muted-foreground">Data not available</p>
                  )}
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Weekly</h3>
                  {networkStats?.weekly && networkStats.weekly.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={networkStats.weekly}>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                        <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.6} />
                        <YAxis tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.6} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            border: "1px solid rgba(0, 174, 239, 0.3)",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="transactions" fill="hsl(195, 100%, 47%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="py-10 text-center text-sm text-muted-foreground">Data not available</p>
                  )}
                </div>
              </div>
            </section>

            {/* Crescimento de Endereços Ativos */}
            <section className="rounded-xl border border-arc-accent/15 bg-white/60 p-6 backdrop-blur-md dark:bg-black/30">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-arc-accent" />
                  <h2 className="text-lg font-bold">Active Addresses Growth</h2>
                </div>
                <span className="rounded-full border border-arc-accent/30 bg-arc-accent/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-arc-accent">
                  Arc Network Testnet
                </span>
              </div>
              {activeAddressesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={activeAddressesChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.6} />
                    <YAxis tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.6} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        border: "1px solid rgba(0, 174, 239, 0.3)",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="addresses"
                      stroke="hsl(195, 100%, 47%)"
                      strokeWidth={2}
                      dot={{ fill: "hsl(195, 100%, 47%)", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-10 text-center text-sm text-muted-foreground">Dados não disponíveis</p>
              )}
            </section>

            {/* Top 10 Tokens */}
            <section className="rounded-xl border border-arc-accent/15 bg-white/60 p-6 backdrop-blur-md dark:bg-black/30">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-arc-accent" />
                  <h2 className="text-lg font-bold">Top 10 Most Used Tokens</h2>
                </div>
                <span className="rounded-full border border-arc-accent/30 bg-arc-accent/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-arc-accent">
                  Arc Network Testnet
                </span>
              </div>
              {topTokens.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    {topTokens.slice(0, 5).map((token, idx) => (
                      <div
                        key={token.address}
                        className="flex items-center justify-between rounded-lg border border-arc-accent/10 bg-white/40 p-3 dark:bg-black/20"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: COLORS[idx] }}
                          >
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{token.symbol}</p>
                            <p className="text-xs text-muted-foreground">{token.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{token.usage.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{token.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {topTokens.slice(5, 10).map((token, idx) => (
                      <div
                        key={token.address}
                        className="flex items-center justify-between rounded-lg border border-arc-accent/10 bg-white/40 p-3 dark:bg-black/20"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: COLORS[idx + 5] }}
                          >
                            {idx + 6}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{token.symbol}</p>
                            <p className="text-xs text-muted-foreground">{token.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{token.usage.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{token.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="py-10 text-center text-sm text-muted-foreground">Dados não disponíveis</p>
              )}
            </section>

            {/* Uso de dApps */}
            <section className="rounded-xl border border-arc-accent/15 bg-white/60 p-6 backdrop-blur-md dark:bg-black/30">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-arc-accent" />
                  <h2 className="text-lg font-bold">dApp Usage</h2>
                </div>
                <span className="rounded-full border border-arc-accent/30 bg-arc-accent/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-arc-accent">
                  Arc Network Testnet
                </span>
              </div>
              {dappUsage.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={dappUsage}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="usage"
                        >
                          {dappUsage.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {dappUsage.map((dapp, idx) => (
                      <div
                        key={dapp.name}
                        className="flex items-center justify-between rounded-lg border border-arc-accent/10 bg-white/40 p-3 dark:bg-black/20"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                          />
                          <p className="text-sm font-semibold">{dapp.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{dapp.usage.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{dapp.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="py-10 text-center text-sm text-muted-foreground">Dados não disponíveis</p>
              )}
            </section>

            {/* Nota informativa */}
            <div className="rounded-xl border border-arc-accent/15 bg-white/60 p-4 backdrop-blur-md dark:bg-black/30">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-arc-accent/20">
                  <span className="text-[10px] font-bold text-arc-accent">ℹ</span>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-semibold text-foreground">About the Data</p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    All displayed metrics are from <span className="font-semibold text-arc-accent">Arc Network Testnet</span>. Data is collected in real-time via network RPC (
                    <a
                      href="https://rpc.testnet.arc.network"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-arc-accent underline hover:text-arc-accent/80"
                    >
                      rpc.testnet.arc.network
                    </a>
                    ). Some metrics may include estimates based on block sampling to optimize performance.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
