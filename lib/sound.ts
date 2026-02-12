/**
 * Simon-style game sounds via Web Audio API.
 * No external libraries.
 */

import type { GameColor } from '@/lib/game-config'

const COLOR_FREQUENCIES: Record<GameColor, number> = {
  red: 329.63,
  blue: 261.63,
  green: 392.0,
  yellow: 523.25,
}

let audioContext: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return audioContext
}

/**
 * Play a sine tone at the given frequency for the given duration (ms).
 */
export function playTone(frequency: number, duration = 180): void {
  const ctx = getContext()
  if (!ctx) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.setValueAtTime(frequency, now)
  osc.type = 'sine'
  gain.gain.setValueAtTime(0.15, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000)
  osc.start(now)
  osc.stop(now + duration / 1000)
}

/**
 * Play the tone for a game color (tile light-up or user click).
 */
export function playColorTone(color: GameColor, duration = 180): void {
  playTone(COLOR_FREQUENCIES[color], duration)
}

/**
 * Short ascending tone when score increases (optional reward sound).
 */
export function playScoreUpSound(): void {
  const ctx = getContext()
  if (!ctx) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(440, now)
  osc.frequency.exponentialRampToValueAtTime(660, now + 0.12)
  gain.gain.setValueAtTime(0.08, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12)
  osc.start(now)
  osc.stop(now + 0.12)
}

/**
 * Short descending tone to signal game over / failure.
 */
export function playGameOverSound(): void {
  const ctx = getContext()
  if (!ctx) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(180, now)
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.35)
  gain.gain.setValueAtTime(0.12, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35)
  osc.start(now)
  osc.stop(now + 0.35)
}
