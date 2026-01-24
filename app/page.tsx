"use client"

import { WalletCard } from "@/components/wallet-card"
import { Github, Twitter, BookOpen, ExternalLink, Trophy } from "lucide-react"
import { useState, useEffect } from "react"

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
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-black px-4 py-12 text-white">
      {/* Navigation */}
      <nav className="absolute left-0 right-0 top-0 flex items-center justify-end px-6 py-4 sm:px-12">
        <div className="flex items-center gap-4">
          <a
            href="/leaderboard"
            className="text-sm text-white/70 transition-colors hover:text-white flex items-center gap-2"
          >
            <Trophy className="h-4 w-4" />
            Leaderboard
          </a>
          <a
            href="https://docs.arc.network/arc/references/contract-addresses"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/70 transition-colors hover:text-white flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Docs
          </a>
          <a
            href="https://www.arc.network/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/70 transition-colors hover:text-white flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Explorer
          </a>
          <a
            href="https://github.com/matheusdoval-ui"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/70 transition-colors hover:text-white flex items-center gap-2"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-6 text-center">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              {isTestnetActive ? (
                <>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500/40 opacity-80" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </>
              ) : (
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              )}
            </span>
            <span className="text-sm font-medium text-white/70">
              {isTestnetActive ? 'Testnet Live' : 'Testnet Offline'}
            </span>
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
            href="https://github.com/matheusdoval-ui"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-colors hover:text-white flex items-center gap-2"
            aria-label="GitHub repository"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>
          <a
            href="https://x.com/matheusdovalx"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-colors hover:text-white flex items-center gap-2"
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
