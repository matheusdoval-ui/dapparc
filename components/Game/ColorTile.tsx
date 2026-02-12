'use client'

import { cn } from '@/lib/utils'
import type { GameColor } from '@/lib/game-config'

export interface ColorTileProps {
  color: GameColor
  isActive: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
}

const colorBase: Record<GameColor, string> = {
  red: 'bg-red-600 border-red-700',
  blue: 'bg-blue-600 border-blue-700',
  green: 'bg-green-600 border-green-700',
  yellow: 'bg-yellow-600 border-yellow-700',
}

export function ColorTile({ color, isActive, disabled, onClick, className }: ColorTileProps) {
  return (
    <button
      type="button"
      aria-label={`Tile ${color}`}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'rounded-xl border-2 transition-all duration-200 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-arc-accent',
        'disabled:pointer-events-none disabled:opacity-60',
        colorBase[color],
        className,
      )}
      style={
        isActive
          ? {
              transform: 'scale(1.08)',
              filter: 'brightness(1.6)',
              boxShadow: '0 0 25px currentColor',
            }
          : undefined
      }
    />
  )
}
