import { WalletCard } from "@/components/wallet-card"
import { Github, Twitter } from "lucide-react"

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-black px-4 py-12 text-white">
      {/* Navigation */}
      <nav className="absolute left-0 right-0 top-0 flex items-center justify-between px-6 py-4 sm:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          <span className="text-lg font-semibold text-white">ARCtx</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://arctx.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/70 transition-colors hover:text-white"
          >
            Live demo
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-6 text-center">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/40 opacity-80" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            <span className="text-sm font-medium text-white/70">Testnet Live</span>
          </div>
          <h1 className="text-balance text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-2">
            ARCtx
          </h1>
          <p className="mx-auto mt-4 max-w-md text-pretty text-base text-white/70 sm:text-lg">
            the dapp that checks your onchain interaction
          </p>
        </header>

        {/* Wallet Card */}
        <WalletCard />

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 sm:gap-16">
          <div className="text-center">
            <div className="text-2xl font-bold text-white sm:text-3xl">50K+</div>
            <div className="mt-1 text-xs text-white/60 sm:text-sm">Active Wallets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white sm:text-3xl">2.5M</div>
            <div className="mt-1 text-xs text-white/60 sm:text-sm">Transactions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white sm:text-3xl">{"<"}1s</div>
            <div className="mt-1 text-xs text-white/60 sm:text-sm">Block Time</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 py-4 sm:px-12 text-white/60">
        <p className="text-xs">Built on Arc Network testnet</p>
        <div className="flex items-center gap-4">
          <a
            href="https://arctx.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-colors hover:text-white"
            aria-label="ARCtx live"
          >
            Live demo
          </a>
          <a
            href="https://x.com/matheusdovalx"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-colors hover:text-white"
            aria-label="Follow creator on X"
          >
            <Twitter className="h-4 w-4" />
          </a>
        </div>
      </footer>
    </main>
  )
}
