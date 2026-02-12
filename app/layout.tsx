import React from "react"
import type { Metadata } from 'next'
import { Orbitron } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { RegistrationProvider } from '@/contexts/registration-context'
import { WalletErrorHandler } from '@/components/wallet-error-handler'
import './globals.css'

const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' })

export const metadata: Metadata = {
  title: 'arcTX Interaction',
  description: 'Connect your wallet and view your interactions on ARC Network',
  generator: 'v0.app',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={orbitron.variable}>
      <body
        className="font-sans antialiased"
        style={{ fontFamily: 'ui-sans-serif, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <WalletErrorHandler />
          <RegistrationProvider>
            {children}
            <Analytics />
          </RegistrationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
