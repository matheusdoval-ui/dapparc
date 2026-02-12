"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { Github, Twitter, BookOpen, ExternalLink, Trophy, Globe, BarChart3, Gamepad2 } from "lucide-react"
import { useState, useEffect } from "react"
import { PuzzleGame } from "@/components/Game/PuzzleGame"
import { GameLeaderboard } from "@/components/Game/Leaderboard"
import { HeroStatsCards } from "@/components/Game/HeroStatsCards"
import { Button } from "@/components/ui/button"
import { LEADERBOARD_CONTRACT_ADDRESS } from "@/lib/leaderboard-contract-address"

const BRAZILIAN_DAPPS = [
  { name: "ARCtx", description: "Check your on-chain interactions on Arc Network.", href: "https://arctx.xyz", tags: ["Wallet", "Analytics"] },
  { name: "PayZed", description: "Programmable money made simple. Create invoices, receive USDC/EURC payments.", href: "https://payzed.xyz/", tags: ["Payments", "USDC"] },
  { name: "ARCDex V2", description: "DeFi trading on Arc Network. Swap tokens and trade.", href: "https://www.arc-dex.xyz/", tags: ["DeFi", "DEX"] },
  { name: "Arc Invoice", description: "Instant payments in USDC & EURC on Arc Network.", href: "https://arcinvoice.xyz/", tags: ["Payments"] },
  { name: "Easy Faucet Arc", description: "Get testnet USDC and tokens.", href: "https://easyfaucetarc.xyz/", tags: ["Faucet"] },
  { name: "Arc Index", description: "Explore Arc Network ecosystem.", href: "https://arcindex.xyz/", tags: ["Index"] },
  { name: "Arc Crypto Race", description: "Crypto race game on Arc Network.", href: "https://arccryptorace.xyz/", tags: ["Game"] },
  { name: "CrowdMint", description: "Decentralized crowdfunding.", href: "https://www.crowdmint.live/", tags: ["Crowdfunding"] },
]

export default function Home() {
  const [isTestnetActive, setIsTestnetActive] = useState(true)

  useEffect(() => {
    const checkTestnetStatus = async () => {
      try {
        const response = await fetch('https://rpc.testnet.arc.network', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 })
        })
        const data = await response.json()
        setIsTestnetActive(data.result !== undefined)
      } catch {
        setIsTestnetActive(false)
      }
    }
    checkTestnetStatus()
    const interval = setInterval(checkTestnetStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-arc-mesh px-4 py-12 sm:px-6 sm:py-14 text-foreground">
      {/* Navigation */}
      <nav className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between gap-2 border-b border-violet-500/20 bg-black/50 backdrop-blur-xl px-4 py-2.5 sm:px-6 shadow-[0_0_30px_rgba(139,92,246,0.08)] transition-all duration-300">
        <a
          href="/"
          className="flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1 text-foreground/90 transition-all duration-300 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300"
          aria-label="ARCtx home"
        >
          <img src="/favicon.svg" alt="" className="h-6 w-6 shrink-0" />
          <span className="text-sm font-bold tracking-tight sm:text-base">ARCtx</span>
        </a>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-black/40 px-3 py-1.5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              {isTestnetActive ? (
                <>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </>
              ) : (
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              )}
            </span>
            <span className="text-sm font-medium tracking-wide text-foreground/90">
              {isTestnetActive ? 'Live on Arc Testnet' : 'Testnet Offline'}
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            {[
              { href: '/dashboard', icon: BarChart3, label: 'Dashboard' },
              { href: '/game', icon: Gamepad2, label: 'Game' },
              { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
              { href: 'https://docs.arc.network/arc/references/contract-addresses', icon: BookOpen, label: 'Docs', external: true },
              { href: 'https://www.arc.network/', icon: ExternalLink, label: 'Explorer', external: true },
            ].map(({ href, icon: Icon, label, external }) => (
              <a
                key={label}
                href={href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="flex items-center gap-1 rounded-lg border border-transparent px-2.5 py-1.5 text-sm tracking-wide text-foreground/80 transition-all duration-300 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300 hover:shadow-[0_0_16px_rgba(139,92,246,0.2)]"
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{label}</span>
              </a>
            ))}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main Content: O JOGO — hero + game + leaderboard */}
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-6 px-4 pt-6 pb-28 sm:px-6 sm:pt-8 sm:pb-32">
        {/* Hero: Play. Score. Go On-Chain. */}
        <section className="flex w-full flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500 px-2 sm:px-0">
          <h1 className="title-arcade text-balance text-3xl font-black tracking-tighter sm:text-4xl lg:text-5xl mb-3 text-foreground">
            Play. Score. Go On-Chain.
          </h1>
          <p className="mx-auto mb-8 max-w-lg text-pretty text-sm tracking-wide text-muted-foreground sm:text-base">
            Play the Memory Puzzle and store your score permanently on ARC Network.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              className="min-w-[180px] gap-2 bg-violet-500 text-white text-base font-semibold transition-all duration-300 hover:bg-violet-400 hover:shadow-[0_0_24px_rgba(139,92,246,0.4)]"
              onClick={() => document.getElementById('game')?.scrollIntoView({ behavior: 'smooth' })}
            >
              🎮 PLAY GAME
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-w-[180px] gap-2 border-violet-500/50 text-base font-semibold transition-all duration-300 hover:bg-violet-500/10 hover:border-violet-500/70 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]"
              onClick={() => document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' })}
            >
              🏆 VIEW LEADERBOARD
            </Button>
          </div>
          <HeroStatsCards />
        </section>

        {/* O JOGO — elemento principal + leaderboard */}
        <section id="game" className="w-full max-w-4xl pt-10 pb-10 sm:pt-14 sm:pb-14 animate-in fade-in slide-in-from-bottom-4 duration-500 scroll-mt-24 px-2 sm:px-0">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:justify-center lg:gap-12">
            <div className="w-full max-w-md lg:max-w-none">
              <PuzzleGame />
            </div>
            <div id="leaderboard" className="w-full max-w-2xl scroll-mt-24">
              <GameLeaderboard />
            </div>
          </div>
        </section>

        {/* Brazilian DApps */}
        <section className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 mb-6 sm:mb-8 px-2 sm:px-0">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-5 w-0.5 rounded-full bg-[#009c3b] shadow-[0_0_6px_rgba(0,156,59,0.5)]" />
            <span className="h-5 w-0.5 rounded-full bg-[#ffdf00] shadow-[0_0_6px_rgba(255,223,0,0.4)]" />
            <h2 className="text-base font-bold tracking-widest uppercase text-foreground">Brazilian DApps</h2>
          </div>
          <p className="mb-4 text-sm tracking-wide text-muted-foreground">dApps built by Brazilian developers on Arc.</p>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {BRAZILIAN_DAPPS.map((dapp) => (
              <a
                key={dapp.name}
                href={dapp.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col overflow-hidden rounded-xl border border-violet-500/20 bg-black/30 p-4 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/50 hover:shadow-[0_0_24px_rgba(139,92,246,0.2)]"
              >
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10 transition-all duration-300 group-hover:border-violet-500/50 group-hover:shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                    <Globe className="h-3.5 w-3.5 text-violet-400" />
                  </div>
                  <span className="truncate text-sm font-semibold tracking-wide text-foreground">{dapp.name}</span>
                </div>
                <p className="mb-3 line-clamp-2 flex-1 text-sm leading-snug text-muted-foreground">{dapp.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {dapp.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="rounded-md px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-violet-400/90">
                      {tag}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 flex flex-col gap-3 border-t border-violet-500/20 bg-black/50 backdrop-blur-xl px-6 py-4 sm:px-12 text-muted-foreground shadow-[0_0_30px_rgba(139,92,246,0.06)] transition-all duration-300">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
          {LEADERBOARD_CONTRACT_ADDRESS && (
            <span>
              Smart Contract:{' '}
              <a
                href={`https://testnet.arcscan.app/address/${LEADERBOARD_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-violet-400 transition-colors duration-300 hover:text-violet-300 hover:underline"
              >
                {LEADERBOARD_CONTRACT_ADDRESS.slice(0, 6)}...{LEADERBOARD_CONTRACT_ADDRESS.slice(-4)}
              </a>
            </span>
          )}
          <a
            href={LEADERBOARD_CONTRACT_ADDRESS ? `https://testnet.arcscan.app/address/${LEADERBOARD_CONTRACT_ADDRESS}` : 'https://testnet.arcscan.app'}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-300 hover:text-violet-300 hover:underline"
          >
            Verified on ArcScan
          </a>
          <span>Built on ARC Testnet</span>
          <span>Game data stored on-chain</span>
        </div>
        <div className="flex items-center justify-end gap-4">
          <a
            href="https://github.com/matheusdoval-ui"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm transition-all duration-300 hover:text-violet-300 hover:translate-y-[-1px]"
            aria-label="GitHub repository"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>
          <a
            href="https://x.com/matheusdovalx"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm transition-all duration-300 hover:text-violet-300 hover:translate-y-[-1px]"
            aria-label="Follow creator on X"
          >
            <Twitter className="h-4 w-4" />
            <span>@matheusdovalx</span>
          </a>
        </div>
      </footer>
    </main>
  )
}
