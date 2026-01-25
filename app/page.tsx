"use client"

import { WalletCard } from "@/components/wallet-card"
import { Github, Twitter, BookOpen, ExternalLink, Trophy, Globe } from "lucide-react"
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
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-arc-mesh px-4 py-12 text-white">
      {/* Navigation */}
      <nav className="absolute left-0 right-0 top-0 z-20 flex items-center justify-end border-b border-arc-accent/20 bg-black/40 backdrop-blur-xl px-6 py-3 sm:px-12 shadow-[0_0_30px_rgba(0,174,239,0.08)]">
        <div className="flex items-center gap-1 sm:gap-2">
          {[
            { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
            { href: 'https://docs.arc.network/arc/references/contract-addresses', icon: BookOpen, label: 'Docs', external: true },
            { href: 'https://www.arc.network/', icon: ExternalLink, label: 'Explorer', external: true },
            { href: 'https://github.com/matheusdoval-ui', icon: Github, label: 'GitHub', external: true },
          ].map(({ href, icon: Icon, label, external }) => (
            <a
              key={label}
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="flex items-center gap-1.5 rounded-lg border border-transparent px-3 py-2 text-sm tracking-wide text-white/70 transition-all hover:border-arc-accent/30 hover:bg-arc-accent/5 hover:text-arc-accent hover:shadow-[0_0_16px_rgba(0,174,239,0.2)]"
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* Main Content: ARCtx + wallet + stats, then Brazilian DApps abaixo */}
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-8 px-2 pt-4">
        <div className="flex flex-col items-center text-center">
          <header className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-arc-accent/20 bg-black/40 px-4 py-2 backdrop-blur-md shadow-[0_0_20px_rgba(0,174,239,0.1)]">
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
              <span className="text-sm font-medium tracking-wide text-white/90">
                {isTestnetActive ? 'Testnet Live' : 'Testnet Offline'}
              </span>
            </div>
            <h1 className="text-balance text-4xl font-black tracking-[0.15em] sm:text-5xl lg:text-6xl mb-2 text-white">
              ARCtx
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-pretty text-sm tracking-wide text-white/50 sm:text-base">
              the dapp that checks your onchain interaction
            </p>
          </header>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                className="rounded-lg border border-arc-accent/15 bg-black/30 px-2.5 py-2 backdrop-blur-md transition-all hover:border-arc-accent/40 hover:bg-arc-accent/5 hover:shadow-[0_0_16px_rgba(0,174,239,0.2)]"
              >
                <div className="text-sm font-bold tabular-nums text-white sm:text-base tracking-wide bg-gradient-to-r from-white to-arc-accent/90 bg-clip-text text-transparent">
                  {value}
                </div>
                <div className="mt-0.5 text-[8px] font-medium uppercase tracking-wider text-white/40 sm:text-[9px]">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Brazilian DApps — posição inicial, abaixo */}
        <section className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-6 w-0.5 rounded-full bg-[#009c3b] shadow-[0_0_8px_rgba(0,156,59,0.6)]" />
            <span className="h-6 w-0.5 rounded-full bg-[#ffdf00] shadow-[0_0_8px_rgba(255,223,0,0.5)]" />
            <h2 className="text-base font-bold tracking-widest uppercase text-white sm:text-lg">Brazilian DApps</h2>
          </div>
          <p className="mb-5 text-sm tracking-wide text-white/50">dApps built by Brazilian developers on Arc.</p>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {BRAZILIAN_DAPPS.map((dapp) => (
              <a
                key={dapp.name}
                href={dapp.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col overflow-hidden rounded-xl border border-arc-accent/15 bg-black/30 p-4 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-arc-accent/50 hover:bg-arc-accent/5 hover:shadow-[0_0_24px_rgba(0,174,239,0.2)]"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-arc-accent/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-arc-accent/20 bg-arc-accent/10 transition-all group-hover:border-arc-accent/40 group-hover:bg-arc-accent/20 group-hover:shadow-[0_0_12px_rgba(0,174,239,0.3)]">
                    <Globe className="h-3.5 w-3.5 text-arc-accent" />
                  </div>
                  <span className="truncate text-sm font-semibold tracking-wide text-white">{dapp.name}</span>
                </div>
                <p className="mb-3 line-clamp-2 flex-1 text-xs leading-relaxed text-white/55">{dapp.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {dapp.tags.map((tag) => (
                    <span key={tag} className="rounded-md border border-arc-accent/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-arc-accent">
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
      <footer className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between border-t border-arc-accent/15 bg-black/40 backdrop-blur-xl px-6 py-4 sm:px-12 text-white/40 shadow-[0_0_30px_rgba(0,174,239,0.05)]">
        <p className="text-xs">Built on Arc Network testnet</p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/matheusdoval-ui"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs transition-all hover:text-white hover:translate-y-[-1px]"
            aria-label="GitHub repository"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>
          <a
            href="https://x.com/matheusdovalx"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs transition-all hover:text-white hover:translate-y-[-1px]"
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
