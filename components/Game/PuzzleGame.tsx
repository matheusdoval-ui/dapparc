'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { ColorTile } from './ColorTile'
import { GAME_COLORS, type GameColor } from '@/lib/game-config'
import { useRecordGame } from '@/lib/use-record-game'
import { playColorTone, playGameOverSound, playScoreUpSound } from '@/lib/sound'
import { Loader2, Trophy, Wallet } from 'lucide-react'

const SEQ_STEP_DELAY_MS = 500
const TILE_FLASH_MS = 380

export function PuzzleGame() {
  const [phase, setPhase] = useState<'idle' | 'playing' | 'replay' | 'input' | 'gameover'>('idle')
  const [sequence, setSequence] = useState<GameColor[]>([])
  const [score, setScore] = useState(0)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const [inputIndex, setInputIndex] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [scoreBump, setScoreBump] = useState(false)

  const isGameOver = phase === 'gameover'
  const { isConnected, address, recordGame, status: txStatus, error: txError, lastTxHash, reset: resetTx } = useRecordGame()

  const loadMyScore = useCallback(async (addr: string) => {
    try {
      const res = await fetch(`/api/leaderboard/score/${encodeURIComponent(addr)}`, { cache: 'no-store' })
      const data = await res.json()
      if (data.bestScore !== undefined) setBestScore(data.bestScore)
    } catch {
      setBestScore(0)
    }
  }, [])

  useEffect(() => {
    if (!address) {
      setBestScore(0)
      return
    }
    loadMyScore(address)
  }, [address, loadMyScore])

  useEffect(() => {
    if (txStatus === 'success' && address) loadMyScore(address)
  }, [txStatus, address, loadMyScore])

  const addRandomStep = useCallback(() => {
    const i = Math.floor(Math.random() * GAME_COLORS.length)
    setSequence((s) => [...s, GAME_COLORS[i]])
  }, [])

  const playSequence = useCallback(async () => {
    setPhase('replay')
    setHighlightIndex(-1)
    await new Promise((r) => setTimeout(r, 300))
    for (let i = 0; i < sequence.length; i++) {
      setHighlightIndex(i)
      playColorTone(sequence[i], 180)
      await new Promise((r) => setTimeout(r, TILE_FLASH_MS))
      setHighlightIndex(-1)
      await new Promise((r) => setTimeout(r, Math.max(0, SEQ_STEP_DELAY_MS - TILE_FLASH_MS)))
    }
    setHighlightIndex(-1)
    setPhase('input')
    setInputIndex(0)
  }, [sequence])

  const startGame = useCallback(() => {
    setSequence([])
    setScore(0)
    setInputIndex(0)
    setHighlightIndex(-1)
    addRandomStep()
    setPhase('playing')
  }, [addRandomStep])

  useEffect(() => {
    if (phase !== 'playing' || sequence.length === 0) return
    playSequence()
  }, [phase, sequence.length, playSequence])

  useEffect(() => {
    if (!scoreBump) return
    const t = setTimeout(() => setScoreBump(false), 600)
    return () => clearTimeout(t)
  }, [scoreBump])

  const handleTileClick = useCallback(
    (color: GameColor) => {
      if (phase !== 'input') return
      playColorTone(color, 180)
      const expected = sequence[inputIndex]
      if (color !== expected) {
        playGameOverSound()
        setPhase('gameover')
        return
      }
      const next = inputIndex + 1
      setInputIndex(next)
      if (next >= sequence.length) {
        const newScore = sequence.length
        setScore(newScore)
        setScoreBump(true)
        playScoreUpSound()
        addRandomStep()
        setPhase('playing')
      }
    },
    [phase, sequence, inputIndex, addRandomStep],
  )

  const handleSubmitScore = useCallback(() => {
    if (score <= 0) return
    resetTx()
    recordGame(score)
  }, [score, recordGame, resetTx])

  const isTileDisabled = phase === 'idle' || phase === 'replay' || isGameOver
  const isSubmitDisabled = txStatus === 'pending' || txStatus === 'confirming'

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md px-2 sm:px-0">
      {/* Score & status */}
      <div className="flex flex-wrap items-center gap-4">
        <div
          className={cn(
            'card-glow-cyan rounded-xl px-4 py-2 transition-all duration-300',
            scoreBump
              ? 'bg-arc-accent/10 ring-2 ring-arc-accent/40'
              : 'bg-muted/50',
          )}
        >
          <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Score</span>
          <p
            className={cn(
              'text-2xl font-bold tabular-nums text-foreground transition-transform duration-300',
              scoreBump && 'animate-score-bump',
            )}
          >
            {score}
          </p>
        </div>
        {isConnected && (
          <div className="card-glow-cyan rounded-xl bg-black/30 px-4 py-2 transition-all duration-300">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Your Best Score</span>
            <p className="text-2xl font-bold tabular-nums text-arc-accent">{bestScore}</p>
          </div>
        )}
        {phase === 'input' && (
          <span className="text-sm text-muted-foreground">Repeat the sequence ({inputIndex + 1}/{sequence.length})</span>
        )}
      </div>

      {/* Grid 2x2 — 140px tiles, 20px gap, no overlap; glow pulse during replay */}
      <div
        className={cn(
          'grid justify-center items-center rounded-2xl transition-all duration-300',
          phase === 'replay' && 'ring-2 ring-arc-accent/40 ring-offset-4 ring-offset-background animate-pulse',
        )}
        style={{
          gridTemplateColumns: 'repeat(2, 140px)',
          gridTemplateRows: 'repeat(2, 140px)',
          gap: '20px',
        }}
      >
        {GAME_COLORS.map((color) => (
          <ColorTile
            key={color}
            color={color}
            isActive={highlightIndex >= 0 && sequence[highlightIndex] === color}
            disabled={isTileDisabled}
            onClick={() => handleTileClick(color)}
            className="w-[140px] h-[140px] min-w-[140px] min-h-[140px]"
          />
        ))}
      </div>

      {/* Start / Connect */}
      {phase === 'idle' && (
        <div className="flex flex-col items-center gap-3">
          {!isConnected ? (
            <>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Connect your wallet to play
              </p>
              <Button
                size="lg"
                className="bg-arc-accent text-arc-accent-foreground"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.ethereum) {
                    window.ethereum.request({ method: 'eth_requestAccounts' })
                  }
                }}
              >
                Connect Wallet
              </Button>
            </>
          ) : (
            <Button size="lg" className="bg-arc-accent text-arc-accent-foreground" onClick={startGame}>
              Start Game
            </Button>
          )}
        </div>
      )}

      {/* Game Over modal */}
      <Dialog open={isGameOver} onOpenChange={() => {}}>
        <DialogContent
          className="card-glow-cyan sm:max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-arc-accent" />
              Game Over
            </DialogTitle>
            <DialogDescription>Your score: {score}. Submit it on-chain to save to the leaderboard.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-2xl font-bold tabular-nums text-foreground">Score: {score}</p>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={startGame} disabled={isSubmitDisabled}>
              Play Again
            </Button>
            <Button
              className="bg-arc-accent text-arc-accent-foreground"
              onClick={handleSubmitScore}
              disabled={isSubmitDisabled || score <= 0}
            >
              {isSubmitDisabled ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {txStatus === 'confirming' ? 'Confirming...' : 'Sending...'}
                </span>
              ) : (
                'Submit Score On-Chain'
              )}
            </Button>
          </DialogFooter>
          {txStatus === 'success' && (
            <div className="space-y-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">🏆 Score saved on-chain!</p>
              {lastTxHash && (
                <div className="space-y-1 text-xs">
                  <p className="font-mono text-muted-foreground">
                    Tx: {lastTxHash.slice(0, 10)}...{lastTxHash.slice(-8)}
                  </p>
                  <a
                    href={`https://testnet.arcscan.app/tx/${lastTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-arc-accent hover:underline"
                  >
                    View on Explorer →
                  </a>
                </div>
              )}
            </div>
          )}
          {txError && <p className="text-sm text-red-500">{txError}</p>}
        </DialogContent>
      </Dialog>
    </div>
  )
}
