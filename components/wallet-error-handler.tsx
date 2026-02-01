'use client'

import { useEffect } from 'react'

/**
 * Captures unhandled promise rejections to prevent full app crash.
 * Mount once in layout.
 */
export function WalletErrorHandler() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handler = (e: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', e.reason)
    }

    window.addEventListener('unhandledrejection', handler)
    return () => window.removeEventListener('unhandledrejection', handler)
  }, [])

  return null
}
