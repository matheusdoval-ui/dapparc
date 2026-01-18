import { WalletCard } from "@/components/wallet-card"
import { Github, Twitter } from "lucide-react"

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Background gradient effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-arc-accent/5 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-arc-accent/5 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-arc-accent/3 blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Navigation */}
      <nav className="absolute left-0 right-0 top-0 flex items-center justify-between px-6 py-4 sm:px-12">
        <div></div>
        <div className="flex items-center gap-4">
          <a 
            href="https://docs.arc.network/arc/references/contract-addresses" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Docs
          </a>
          <a 
            href="https://www.arc.network/" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Explorer
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-arc-accent/30 bg-arc-accent/10 px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-arc-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-arc-accent" />
            </span>
            <span className="text-sm font-medium text-arc-accent">Testnet Live</span>
          </div>
          <h1 className="text-balance text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-2 text-foreground">
            ARCtx
          </h1>
          <p className="mx-auto mt-4 max-w-md text-pretty text-base text-muted-foreground sm:text-lg">
            the dapp that checks your onchain interaction
          </p>
        </header>

        {/* Wallet Card */}
        <WalletCard />

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 sm:gap-16">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground sm:text-3xl">50K+</div>
            <div className="mt-1 text-xs text-muted-foreground sm:text-sm">Active Wallets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground sm:text-3xl">2.5M</div>
            <div className="mt-1 text-xs text-muted-foreground sm:text-sm">Transactions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground sm:text-3xl">{"<"}1s</div>
            <div className="mt-1 text-xs text-muted-foreground sm:text-sm">Block Time</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 py-4 sm:px-12">
        <p className="text-xs text-muted-foreground/60">
          Built on ARC Network
        </p>
        <div className="flex items-center gap-4">
          <a 
            href="https://x.com/matheusdovalx" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-arc-accent/50 hover:bg-arc-accent/10 hover:text-arc-accent"
            aria-label="Follow creator on X"
          >
            <Twitter className="h-3.5 w-3.5" />
            <span>@matheusdovalx</span>
          </a>
          <a 
            href="https://github.com/matheusdoval-ui" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground/60 transition-colors hover:text-foreground"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </footer>
    </main>
  )
}
