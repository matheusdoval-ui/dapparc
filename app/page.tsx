"use client"

import { WalletCard } from "@/components/wallet-card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Github, Twitter, BookOpen, ExternalLink, Trophy, Globe, Wallet, Search, Sparkles, BarChart3 } from "lucide-react"
import { useState, useEffect } from "react"

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
    <main className="min-h-screen w-full text-foreground bg-background">
      <div className="absolute inset-0 -z-10 bg-arc-mesh opacity-50" aria-hidden />
      <div className="min-h-screen flex flex-col">
        <nav className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
          <a href="/" className="flex items-center gap-1.5" aria-label="ARCtx home">
            <img src="/favicon.svg" alt="" className="h-6 w-6" />
            <span className="text-sm font-semibold">ARCtx</span>
          </a>
          <div className="flex items-center gap-2">
            {[
              { href: '/dashboard', icon: BarChart3, label: 'Dashboard' },
              { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
              { href: 'https://docs.arc.network/arc/references/contract-addresses', icon: BookOpen, label: 'Docs', external: true },
              { href: 'https://www.arc.network/', icon: ExternalLink, label: 'Explorer', external: true },
            ].map(({ href, icon: Icon, label, external }) => (
              <a key={label} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="flex items-center gap-1 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </a>
            ))}
            <ThemeToggle />
          </div>
        </nav>

        <div className="flex-1 flex flex-col items-center px-4 py-10">
          <div className="w-full max-w-md flex flex-col items-center gap-6">
            <header className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 mb-4">
                <span className={`h-2 w-2 rounded-full ${isTestnetActive ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm">{isTestnetActive ? 'Live on Arc Testnet' : 'Testnet Offline'}</span>
              </div>
              <h1 className="text-2xl font-bold mb-2">On-Chain Activity Made Simple</h1>
              <p className="text-sm text-muted-foreground">Search addresses and understand interactions on Arc Network.</p>
            </header>

            <WalletCard />

            <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
              {[
                { value: '50K+', label: 'Active Wallets' },
                { value: '2.5M', label: 'Transactions' },
                { value: '<1s', label: 'Block Time' },
              ].map(({ value, label }) => (
                <div key={label} className="rounded-lg border bg-card p-3 text-center shadow-sm">
                  <div className="text-sm font-semibold">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <section className="w-full max-w-3xl mt-12 px-4">
            <h2 className="text-lg font-semibold mb-4">How It Works</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: Globe, title: 'Access ARCtx', text: 'Visit arctx.xyz for instant on-chain data.' },
                { icon: Wallet, title: 'Connect Wallet', text: 'Link MetaMask or Rabby to see your activity.' },
                { icon: Search, title: 'Search Address', text: 'Paste any 0x… address to explore.' },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-lg border bg-card p-4">
                  <Icon className="h-5 w-5 text-primary mb-2" />
                  <h3 className="font-medium text-sm mb-1">{title}</h3>
                  <p className="text-xs text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-medium">Why ARCtx?</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Fast access to on-chain insights</li>
                <li>• No intermediaries</li>
                <li>• Fully decentralized</li>
                <li>• Built for Web3 users</li>
              </ul>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-3">Brazilian DApps</h2>
              <p className="text-sm text-muted-foreground mb-3">dApps built by Brazilian developers on Arc.</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {BRAZILIAN_DAPPS.map((dapp) => (
                  <a key={dapp.name} href={dapp.href} target="_blank" rel="noopener noreferrer" className="block rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors">
                    <span className="font-medium text-sm">{dapp.name}</span>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{dapp.description}</p>
                    <div className="flex gap-1 mt-2">
                      {dapp.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted">{tag}</span>
                      ))}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        </div>

        <footer className="border-t px-4 py-3 flex items-center justify-between text-sm text-muted-foreground">
          <p>Built on Arc Network testnet</p>
          <div className="flex gap-4">
            <a href="https://github.com/matheusdoval-ui" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground">
              <Github className="h-4 w-4" /> GitHub
            </a>
            <a href="https://x.com/matheusdovalx" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground">
              <Twitter className="h-4 w-4" /> @matheusdovalx
            </a>
          </div>
        </footer>
      </div>
    </main>
  )
}
