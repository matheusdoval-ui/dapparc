import React from "react"
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { RegistrationProvider } from '@/contexts/registration-context'
import { BackgroundMusic } from '@/components/background-music'
import './globals.css'

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
    <html lang="en" suppressHydrationWarning>
      <body
        className="font-sans antialiased"
        style={{ fontFamily: 'ui-sans-serif, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <RegistrationProvider>
            {children}
            <BackgroundMusic />
            <Analytics />
          </RegistrationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
