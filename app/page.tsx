"use client"

import { WalletCard } from "@/components/wallet-card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Github, Twitter, BookOpen, ExternalLink, Trophy, Globe, Wallet, Search, Sparkles, BarChart3 } from "lucide-react"
import { useState, useEffect } from "react"

const BRAZILIAN_DAPPS = [
  {
    name: "ARCtx",
    description: "Check your on-chain interactions on Arc Network.",
    href: "https://arctx.xyz",
    tags: ["Wallet", "Analytics"],
  },
  {
    name: "PayZed",
    description: "Programmable money made simple. Create invoices, receive USDC/EURC payments, and bridge across chains on Arc Testnet.",
    href: "https://payzed.xyz/",
    tags: ["Payments", "Invoices", "USDC"],
  },
  {
    name: "ARCDex V2",
    description: "DeFi trading on Arc Network. Swap tokens and trade on a decentralized exchange.",
    href: "https://www.arc-dex.xyz/",
    tags: ["DeFi", "Trading", "DEX"],
  },
  {
    name: "Arc Invoice",
    description: "Instant payments in USDC & EURC on Arc Network.",
    href: "https://arcinvoice.xyz/",
    tags: ["Payments", "USDC", "EURC"],
  },
  {
    name: "Easy Faucet Arc",
    description: "Get testnet USDC and tokens for Arc Network.",
    href: "https://easyfaucetarc.xyz/",
    tags: ["Faucet", "Testnet"],
  },
  {
    name: "Arc Index",
    description: "Explore and index Arc Network ecosystem.",
    href: "https://arcindex.xyz/",
    tags: ["Index", "Explorer"],
  },
  {
    name: "Arc Crypto Race",
    description: "Crypto race game on Arc Network.",
    href: "https://arccryptorace.xyz/",
    tags: ["Game", "Race"],
  },
  {
    name: "CrowdMint",
    description: "Decentralized crowdfunding. Back campaigns with USDC, track on-chain, unclaimed funds earn yield.",
    href: "https://www.crowdmint.live/",
    tags: ["Crowdfunding", "USDC", "Web3"],
  },
] as const

export default function Home() {
  const [isTestnetActive, setIsTestnetActive] = useState(true)

  useEffect(() => {
    // Verificar status da testnet
    const checkTestnetStatus = async () => {
      try {
        const response = await fetch('https://rpc.testnet.arc.network', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
            id: 1
          })
        })
        const data = await response.json()
        setIsTestnetActive(data.result !== undefined)
      } catch (error) {
        setIsTestnetActive(false)
      }
    }

    checkTestnetStatus()
    // Verificar a cada 30 segundos
    const interval = setInterval(checkTestnetStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto text-foreground">
      {/* Grid background — absolute so it doesn't affect layout */}
      <div className="absolute inset-0 -z-10 bg-arc-mesh" aria-hidden />
      <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-10 min-w-0">
        <div className="w-full max-w-xl flex flex-col gap-6">
      {/* Navigation */}
      <nav className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between gap-2 border-b border-arc-accent/20 bg-white/80 backdrop-blur-xl px-4 py-2 sm:px-6 shadow-[0_0_30px_rgba(0,174,239,0.06)] dark:bg-black/40 dark:shadow-[0_0_30px_rgba(0,174,239,0.08)]">
        <a
          href="/"
          className="flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1 text-foreground/90 transition-all hover:border-arc-accent/30 hover:bg-arc-accent/5 hover:text-arc-accent"
          aria-label="ARCtx home"
        >
          <img src="/favicon.svg" alt="" className="h-6 w-6 shrink-0" />
          <span className="text-sm font-bold tracking-tight sm:text-base">ARCtx</span>
        </a>
        <div className="flex items-center gap-1 sm:gap-1.5">
          {[
            { href: '/dashboard', icon: BarChart3, label: 'Dashboard' },
            { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
            { href: 'https://docs.arc.network/arc/references/contract-addresses', icon: BookOpen, label: 'Docs', external: true },
            { href: 'https://www.arc.network/', icon: ExternalLink, label: 'Explorer', external: true },
          ].map(({ href, icon: Icon, label, external }) => (
            <a
              key={label}
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="flex items-center gap-1 rounded-lg border border-transparent px-2.5 py-1.5 text-xs sm:text-sm tracking-wide text-foreground/70 transition-all hover:border-arc-accent/30 hover:bg-arc-accent/5 hover:text-arc-accent hover:shadow-[0_0_16px_rgba(0,174,239,0.2)]"
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{label}</span>
            </a>
          ))}
          <ThemeToggle />
        </div>
      </nav>

      {/* Main Content: ARCtx + wallet + stats, then Brazilian DApps abaixo */}
      <div className="relative z-10 flex w-full flex-col items-center gap-8 px-2 pt-4 pb-24">
        <div className="flex flex-col items-center text-center">
          <header className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-arc-accent/20 bg-white/90 px-4 py-2 backdrop-blur-md shadow-[0_0_20px_rgba(0,174,239,0.08)] dark:bg-black/40 dark:shadow-[0_0_20px_rgba(0,174,239,0.1)]">
              <span className="relative flex h-2.5 w-2.5">
                {isTestnetActive ? (
                  <>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                  </>
                ) : (
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                )}
              </span>
              <span className="text-sm font-medium tracking-wide text-foreground/90">
                {isTestnetActive ? 'Live on Arc Network Testnet' : 'Testnet Offline'}
              </span>
            </div>
            <h1 className="text-balance text-3xl font-black tracking-tighter sm:text-4xl lg:text-5xl mb-2 text-foreground">
              <span className="uppercase">On-Chain Activity</span>
              <br />
              Made Simple
            </h1>
            <p className="mx-auto mt-3 max-w-md text-pretty text-sm tracking-wide text-muted-foreground sm:text-base">
              Search addresses and understand interactions on Arc Network.
            </p>
          </header>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full flex items-center justify-center flex-shrink-0">
            <WalletCard />
          </div>
          <div className="mt-4 grid w-full max-w-sm grid-cols-3 gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {[
              { value: '50K+', label: 'Active Wallets' },
              { value: '2.5M', label: 'Transactions' },
              { value: '<1s', label: 'Block Time' },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="rounded-lg border border-arc-accent/15 bg-white/60 px-2.5 py-2 backdrop-blur-md transition-all hover:border-arc-accent/40 hover:bg-arc-accent/5 hover:shadow-[0_0_16px_rgba(0,174,239,0.2)] dark:bg-black/30"
              >
                <div className="text-sm font-bold tabular-nums sm:text-base tracking-wide bg-gradient-to-r from-foreground to-arc-accent/90 bg-clip-text text-transparent dark:from-white">
                  {value}
                </div>
                <div className="mt-0.5 text-[8px] font-medium uppercase tracking-wider text-muted-foreground sm:text-[9px]">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works — landing */}
        <section className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-6 rounded-2xl border border-arc-accent/25 bg-white/80 px-6 py-5 text-center backdrop-blur-md dark:bg-black/40">
            <h2 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">How It Works</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm font-medium tracking-wide text-muted-foreground sm:text-base">
              Explore on-chain activity on ARC Network in seconds
            </p>
          </div>
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Globe,
                title: 'Access ARCtx',
                text: 'Visit arctx.xyz for instant on-chain data. No sign-up.',
              },
              {
                icon: Wallet,
                title: 'Connect Your Wallet',
                text: 'Link MetaMask, Rabby, or others to see your activity. Optional.',
              },
              {
                icon: Search,
                title: 'Search Any Address',
                text: 'Paste any 0x… address to explore txs and contracts — no wallet needed.',
              },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="group relative flex flex-col items-center overflow-hidden rounded-xl border border-arc-accent/15 bg-white/60 p-4 text-center backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-arc-accent/40 hover:bg-arc-accent/5 hover:shadow-[0_0_24px_rgba(0,174,239,0.15)] dark:bg-black/30"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-arc-accent/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="mb-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-arc-accent/20 bg-arc-accent/10 transition-all group-hover:border-arc-accent/40 group-hover:bg-arc-accent/20 group-hover:shadow-[0_0_12px_rgba(0,174,239,0.25)]">
                  <Icon className="h-5 w-5 text-arc-accent" />
                </div>
                <h3 className="mb-2 text-sm font-semibold tracking-wide text-foreground">{title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>

          {/* Why ARCtx */}
          <div className="mt-8 rounded-xl border border-arc-accent/25 bg-arc-accent/5 px-5 py-5 backdrop-blur-md dark:bg-arc-accent/10">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-arc-accent/20 bg-arc-accent/15">
                <Sparkles className="h-4 w-4 text-arc-accent" />
              </div>
              <h3 className="text-sm font-bold tracking-wide text-foreground sm:text-base">Why ARCtx?</h3>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {[
                'Fast access to on-chain insights',
                'No intermediaries',
                'Fully decentralized',
                'Built for Web3 users & builders',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-arc-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Brazilian DApps — compacto */}
        <section className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 mb-4">
          <div className="mb-2 flex items-center gap-1.5">
            <span className="h-5 w-0.5 rounded-full bg-[#009c3b] shadow-[0_0_6px_rgba(0,156,59,0.5)]" />
            <span className="h-5 w-0.5 rounded-full bg-[#ffdf00] shadow-[0_0_6px_rgba(255,223,0,0.4)]" />
            <h2 className="text-sm font-bold tracking-widest uppercase text-foreground sm:text-base">Brazilian DApps</h2>
          </div>
          <p className="mb-3 text-xs tracking-wide text-muted-foreground">dApps built by Brazilian developers on Arc.</p>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {BRAZILIAN_DAPPS.map((dapp) => (
              <a
                key={dapp.name}
                href={dapp.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col overflow-hidden rounded-lg border border-arc-accent/15 bg-white/60 p-3 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-arc-accent/50 hover:bg-arc-accent/5 hover:shadow-[0_0_20px_rgba(0,174,239,0.2)] dark:bg-black/30"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-arc-accent/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="mb-1.5 flex items-center gap-1.5">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-arc-accent/20 bg-arc-accent/10 transition-all group-hover:border-arc-accent/40 group-hover:bg-arc-accent/20 group-hover:shadow-[0_0_8px_rgba(0,174,239,0.25)]">
                    <Globe className="h-3 w-3 text-arc-accent" />
                  </div>
                  <span className="truncate text-xs font-semibold tracking-wide text-foreground">{dapp.name}</span>
                </div>
                <p className="mb-2 line-clamp-1 flex-1 text-[10px] leading-snug text-muted-foreground">{dapp.description}</p>
                <div className="flex flex-wrap gap-1">
                  {dapp.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-arc-accent/90">
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
      <footer className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between border-t border-arc-accent/15 bg-white/80 backdrop-blur-xl px-6 py-4 sm:px-12 text-muted-foreground shadow-[0_0_30px_rgba(0,174,239,0.04)] dark:bg-black/40 dark:shadow-[0_0_30px_rgba(0,174,239,0.05)]">
        <p className="text-xs">Built on Arc Network testnet</p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/matheusdoval-ui"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs transition-all hover:text-foreground hover:translate-y-[-1px]"
            aria-label="GitHub repository"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>
          <a
            href="https://x.com/matheusdovalx"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs transition-all hover:text-foreground hover:translate-y-[-1px]"
            aria-label="Follow creator on X"
          >
            <Twitter className="h-4 w-4" />
            <span>@matheusdovalx</span>
          </a>
        </div>
      </footer>
        </div>
      </div>
    </main>
  )
}
