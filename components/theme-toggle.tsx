'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-lg border border-arc-accent/40 bg-arc-accent/10"
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4 text-arc-accent" />
      </Button>
    )
  }

  const isDark = theme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 rounded-lg border border-arc-accent/40 bg-arc-accent/10 text-arc-accent transition-all hover:border-arc-accent/60 hover:bg-arc-accent/20 hover:shadow-[0_0_16px_rgba(0,174,239,0.4)] dark:border-arc-accent/50 dark:bg-arc-accent/15 dark:text-arc-accent dark:hover:bg-arc-accent/25"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  )
}
