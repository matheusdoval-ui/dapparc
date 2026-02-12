'use client'

import Link from 'next/link'
import { PuzzleGame } from '@/components/Game/PuzzleGame'
import { GameLeaderboard } from '@/components/Game/Leaderboard'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function GamePage() {
  return (
    <main className="min-h-screen bg-arc-mesh bg-gradient-to-b from-background/80 to-background">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/" aria-label="Back to home">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Memory Puzzle</h1>
        </div>
        <p className="mb-8 text-sm text-muted-foreground">
          Watch the sequence, then repeat it. Each round adds one more step. Submit your score on-chain when the game ends.
        </p>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-center lg:gap-16">
          <PuzzleGame />
          <GameLeaderboard />
        </div>
      </div>
    </main>
  )
}
