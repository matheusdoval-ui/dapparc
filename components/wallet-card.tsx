"use client"

import { useState, useEffect, useCallback } from "react"
import { Wallet, Activity, Copy, Check, ExternalLink, Zap, Shield, Globe, AlertCircle, Coins, RefreshCw, Clock, TrendingUp, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CelebrationAnimation } from "@/components/celebration-animation"
import { InteractionLevelPopup } from "@/components/interaction-level-popup"
import { connectWallet, isWalletInstalled, getAccounts, getChainId, ensureArcTestnet, getWalletName, registerQueryAsTransaction } from "@/lib/wallet"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface WalletData {
  address: string
  interactions: number
  balance?: number
  balanceFormatted?: string
  lastUpdated?: string
}

interface ChartDataPoint {
  date: string
  interactions: number
}

export function WalletCard() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showLevelPopup, setShowLevelPopup] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [isRegisteringTransaction, setIsRegisteringTransaction] = useState(false)
  const [lastTransactionHash, setLastTransactionHash] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [manualAddress, setManualAddress] = useState("")
  const [manualLookupAddress, setManualLookupAddress] = useState<string | null>(null)
  const [walletRank, setWalletRank] = useState<number | null>(null)
  const [isLoadingRank, setIsLoadingRank] = useState(false)
  const [isCheckingAddress, setIsCheckingAddress] = useState(false)
  const [addressValidation, setAddressValidation] = useState<{
    isValid: boolean
    message: string
  } | null>(null)
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null)
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Validate address in real-time
  const validateAddress = useCallback((address: string) => {
    const trimmed = address.trim()
    
    if (!trimmed) {
      setAddressValidation(null)
      return false
    }

    if (trimmed.length < 42) {
      setAddressValidation({
        isValid: false,
        message: 'Address too short'
      })
      return false
    }

    if (!trimmed.startsWith('0x')) {
      setAddressValidation({
        isValid: false,
        message: 'Address must start with 0x'
      })
      return false
    }

    const ethAddressPattern = /^0x[a-fA-F0-9]{40}$/i
    if (ethAddressPattern.test(trimmed)) {
      setAddressValidation({
        isValid: true,
        message: 'Valid address'
      })
      return true
    } else {
      setAddressValidation({
        isValid: false,
        message: 'Invalid address format'
      })
      return false
    }
  }, [])

  // Generate chart data showing growth over last 30 days
  // This simulates growth based on current transaction count
  const generateChartData = useCallback((currentTxCount: number) => {
    const data: ChartDataPoint[] = []
    const days = 30
    const today = new Date()

    // Estimate growth: assume gradual increase over time
    // If current count is low, show slow growth; if high, show faster growth
    const growthRate = Math.min(currentTxCount / 100, 1) // Normalize growth rate
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Simulate gradual growth: current count * (days_ago / total_days) * growth_factor
      const daysAgo = days - i
      const progress = daysAgo / days
      // Apply exponential-like growth curve
      const estimatedCount = Math.max(0, Math.floor(currentTxCount * Math.pow(progress, 0.7 + growthRate * 0.3)))
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        interactions: estimatedCount,
      })
    }

    setChartData(data)
  }, [])

  // Fetch wallet statistics from API and register query as transaction
  const fetchWalletStats = useCallback(async (address: string, registerTransaction: boolean = true, isWalletConnected: boolean = false) => {
    console.log('🔍 fetchWalletStats called with:', { address, registerTransaction })
    
    // Set loading states immediately for better UX
    setIsLoadingStats(true)
    setIsRefreshing(true)
    setError(null)

    try {
      // Validate address format
      if (!address || !/^0x[a-fA-F0-9]{40}$/i.test(address)) {
        throw new Error('Invalid wallet address format')
      }

      // First, register the query as an on-chain transaction
      // This creates a transaction every time the wallet is queried
      if (registerTransaction) {
        try {
          setIsRegisteringTransaction(true)
          console.log('📝 Registering query as on-chain transaction...')
          
          // Try to use contract if available, otherwise use self-transfer
          const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
          const txHash = await registerQueryAsTransaction(contractAddress)
          
          console.log('✅ Transaction created:', txHash)
          setLastTransactionHash(txHash)
          
          // Wait a bit for transaction to be included in a block
          await new Promise(resolve => setTimeout(resolve, 3000))
        } catch (txError: any) {
          console.warn('⚠️ Could not create transaction:', txError)
          
          // If user rejected, don't show error - just continue
          if (txError.message && txError.message.includes('rejected')) {
            console.log('User rejected transaction - continuing without registering')
          } else {
            // For other errors, show warning but continue
            console.warn('Transaction not created, but continuing with query')
          }
        } finally {
          setIsRegisteringTransaction(false)
        }
      }

      // Then fetch wallet statistics (which will now include the new transaction)
      console.log('📡 Fetching wallet stats from API for:', address, 'Connected:', isWalletConnected)
      
      // Normalize address to lowercase for consistency
      const normalizedAddress = address.toLowerCase()
      // Pass 'connected' parameter: true if wallet was connected, false/undefined for manual lookup
      const apiUrl = `/api/wallet-stats?address=${encodeURIComponent(normalizedAddress)}&connected=${isWalletConnected}`
      console.log('🌐 API URL:', apiUrl)
      
      // Make API call immediately without delays
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Ensure fresh data
      })
      
      console.log('📥 API Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        // Try to get error message from response
        let errorData
        try {
          const responseText = await response.clone().text()
          console.error('❌ API Error Response body:', responseText)
          errorData = JSON.parse(responseText)
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        console.error('❌ API Error:', errorData)
        throw new Error(errorData.error || 'Failed to fetch wallet statistics')
      }

      const data = await response.json()
      console.log('✅ Wallet stats received:', data)
      
      // Validate response data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from server')
      }
      
      if (!data.address || typeof data.txCount !== 'number') {
        console.error('❌ Invalid data structure:', data)
        throw new Error('Missing required fields in response')
      }

      if (isWalletConnected && data.leaderboardRecorded === false) {
        console.warn('⚠️ Leaderboard: wallet not recorded.', data.leaderboardReason || 'Connect on home page to appear in leaderboard.')
      }
      
      const newWalletData = {
        address: data.address,
        interactions: data.txCount || 0,
        balance: data.balance ?? 0,
        balanceFormatted: data.balanceFormatted || (data.balance ? data.balance.toFixed(2) : '0.00'),
        lastUpdated: data.lastUpdated || new Date().toISOString(),
      }
      
      console.log('💾 Setting wallet data:', newWalletData)
      setWalletData(newWalletData)

      // Check registration status for leaderboard
      try {
        setIsCheckingRegistration(true)
        const registrationResponse = await fetch(`/api/check-registration?address=${encodeURIComponent(data.address)}`)
        if (registrationResponse.ok) {
          const registrationData = await registrationResponse.json()
          setIsRegistered(registrationData.isRegistered)
          console.log('✅ Registration status:', registrationData.isRegistered ? 'Registered' : 'Not registered')
        }
      } catch (err) {
        console.warn('⚠️ Could not check registration status:', err)
      } finally {
        setIsCheckingRegistration(false)
      }

      // Fetch wallet rank after getting stats
      try {
        setIsLoadingRank(true)
        const rankResponse = await fetch(`/api/rank/${data.address}`)
        if (rankResponse.ok) {
          const rankData = await rankResponse.json()
          setWalletRank(rankData.rank)
        }
      } catch (err) {
        console.warn('Error fetching rank:', err)
      } finally {
        setIsLoadingRank(false)
      }

      // Generate chart data (simulated growth over last 30 days)
      // In production, this could come from an API that tracks historical data
      if (data.txCount > 0) {
        generateChartData(data.txCount)
      } else {
        setChartData([])
      }

      // Show celebration animation after successful connection
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 4500)
      setTimeout(() => {
        setShowLevelPopup(true)
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch wallet statistics'
      setError(errorMessage)
      console.error('Error fetching wallet stats:', err)
    } finally {
      setIsLoadingStats(false)
      setIsRefreshing(false)
    }
  }, [generateChartData])

  const handleConnect = useCallback(async () => {
    console.log('🔍 handleConnect called')
    setIsConnecting(true)
    setError(null)

    try {
      // Check if any compatible wallet is installed
      if (!isWalletInstalled()) {
        throw new Error('No compatible wallet found. Please install MetaMask or Rabby Wallet to continue.')
      }

      // Connect wallet and ensure correct network
      console.log('📡 Connecting wallet...')
      const address = await connectWallet()
      console.log('✅ Wallet connected:', address)

      // Verify network one more time
      const chainId = await getChainId()
      if (chainId !== 5042002) {
        console.log('🔄 Switching to ARC Testnet...')
        await ensureArcTestnet()
      }

      setIsConnected(true)
      setIsConnecting(false)

      // Fetch wallet statistics (wallet is connected, so pass isWalletConnected=true)
      console.log('📊 Fetching wallet statistics...')
      await fetchWalletStats(address, true, true) // registerTransaction=true, isWalletConnected=true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet'
      setError(errorMessage)
      setIsConnecting(false)
      console.error('❌ Error connecting wallet:', err)
    }
  }, [fetchWalletStats])

  const handleManualLookup = useCallback(async () => {
    console.log('🔍 handleManualLookup called with:', manualAddress)
    console.log('📊 Current state:', { 
      manualAddress, 
      addressValidation, 
      isCheckingAddress, 
      isLoadingStats 
    })
    
    const trimmed = manualAddress.trim()

    if (!trimmed) {
      console.warn('⚠️ Empty address')
      setError('Enter a valid wallet address to continue.')
      setAddressValidation({
        isValid: false,
        message: 'Address is required'
      })
      return
    }

    // Validate address format
    const isValid = validateAddress(trimmed)
    
    if (!isValid) {
      console.warn('⚠️ Invalid address format:', trimmed)
      setError('Please enter a valid Ethereum address (0x followed by 40 hex characters).')
      return
    }

    // Set loading state immediately for UI feedback
    console.log('⏳ Setting loading states...')
    setIsCheckingAddress(true)
    setError(null)
    setManualLookupAddress(null)
    setIsConnected(false)

    try {
      console.log('✅ Address validated, fetching stats...')
      console.log('📞 Calling fetchWalletStats with:', { 
        address: trimmed, 
        registerTransaction: false, 
        isWalletConnected: false 
      })
      
      await fetchWalletStats(trimmed, false, false) // registerTransaction=false, isWalletConnected=false (manual lookup)
      
      console.log('✅ fetchWalletStats completed successfully')
      setManualLookupAddress(trimmed)
    } catch (err) {
      console.error('❌ Error in handleManualLookup:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch wallet statistics'
      setError(errorMessage)
    } finally {
      setIsCheckingAddress(false)
      console.log('🏁 handleManualLookup finished, isCheckingAddress set to false')
    }
  }, [manualAddress, addressValidation, fetchWalletStats, validateAddress])

  // Listen for account changes (but don't auto-connect)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setIsConnected(false)
          setWalletData(null)
        }
        // Don't auto-connect when accounts change
      }

      const handleChainChanged = () => {
        window.location.reload()
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum?.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])


  const handleDisconnect = () => {
    setIsConnected(false)
    setWalletData(null)
    setManualLookupAddress(null)
    setManualAddress('')
    setAddressValidation(null)
    setError(null)
    setChartData([])
    setWalletRank(null)
    setIsRegistered(null)
  }

  const copyAddress = async () => {
    if (walletData) {
      await navigator.clipboard.writeText(walletData.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      <CelebrationAnimation isActive={showCelebration} />
      {walletData && (
        <InteractionLevelPopup
          isOpen={showLevelPopup}
          onClose={() => setShowLevelPopup(false)}
          interactions={walletData.interactions}
        />
      )}
      <div className="relative w-full max-w-md">
        {/* Glow effect behind card */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-arc-accent/25 via-arc-accent/10 to-arc-accent/25 blur-xl opacity-80" />
        
        {/* Main card — dimensões fixas: não altera ao conectar */}
        <div className="relative flex h-[420px] min-h-[420px] max-h-[420px] w-full flex-col overflow-hidden rounded-2xl border border-arc-accent/15 bg-white/90 p-5 backdrop-blur-xl transition-[border-color,box-shadow] duration-300 hover:border-arc-accent/40 hover:shadow-[0_0_32px_rgba(0,174,239,0.2)] dark:bg-black/40">
          {/* Decorative corner accents */}
          <div className="absolute left-0 top-0 h-14 w-14 rounded-tl-2xl border-l-2 border-t-2 border-arc-accent/40" />
          <div className="absolute bottom-0 right-0 h-14 w-14 rounded-br-2xl border-b-2 border-r-2 border-arc-accent/40" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-arc-accent/50 to-transparent" />

          {/* Header com logo compacto */}
          <div className="mb-4 flex flex-shrink-0 flex-col items-center">
            <div className="animate-pulse-glow mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-arc-accent to-arc-accent/70 shadow-[0_0_20px_rgba(0,174,239,0.35)]">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-lg font-bold tracking-wide text-foreground">ARC Network</h2>
            <p className="mt-0.5 text-xs tracking-wide text-muted-foreground">Decentralized Infrastructure</p>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
          {!walletData ? (
            <div className="flex flex-col items-center">
              {/* Badges compactos */}
              <div className="mb-4 flex flex-wrap justify-center gap-2">
                <div className="flex items-center gap-1 rounded-full border border-arc-accent/15 bg-arc-accent/5 px-2.5 py-1 text-[10px] uppercase tracking-wider text-muted-foreground transition-all hover:border-arc-accent/30 hover:bg-arc-accent/10 hover:text-arc-accent">
                  <Shield className="h-2.5 w-2.5 text-arc-accent" />
                  Secure
                </div>
                <div className="flex items-center gap-1 rounded-full border border-arc-accent/15 bg-arc-accent/5 px-2.5 py-1 text-[10px] uppercase tracking-wider text-muted-foreground transition-all hover:border-arc-accent/30 hover:bg-arc-accent/10 hover:text-arc-accent">
                  <Zap className="h-2.5 w-2.5 text-arc-accent" />
                  Fast
                </div>
                <div className="flex items-center gap-1 rounded-full border border-arc-accent/15 bg-arc-accent/5 px-2.5 py-1 text-[10px] uppercase tracking-wider text-muted-foreground transition-all hover:border-arc-accent/30 hover:bg-arc-accent/10 hover:text-arc-accent">
                  <Globe className="h-2.5 w-2.5 text-arc-accent" />
                  EVM
                </div>
              </div>

              <p className="mb-4 text-center text-xs text-muted-foreground">
                Connect your wallet or paste an address to view on-chain interactions.
              </p>

              {/* Error message */}
              {error && (
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400 animate-in slide-in-from-top-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                  <button
                    onClick={() => setError(null)}
                    className="ml-auto text-red-400/60 hover:text-red-400 transition-colors"
                    aria-label="Dismiss error"
                  >
                    ×
                  </button>
                </div>
              )}

              
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="group relative w-full overflow-hidden rounded-xl border border-arc-accent/30 bg-arc-accent py-4 text-sm font-semibold tracking-wide text-white transition-all duration-300 hover:border-arc-accent/60 hover:bg-arc-accent/95 hover:shadow-[0_0_36px_rgba(0,174,239,0.5)] disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                {isConnecting ? (
                  <span className="flex items-center justify-center gap-2 relative z-10">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Connecting...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2 relative z-10">
                    <Wallet className="h-5 w-5" />
                    <span>Connect Wallet</span>
                  </span>
                )}
              </Button>

              <p className="mt-3 text-[10px] text-muted-foreground/60">
                MetaMask or Rabby • ARC Testnet
              </p>

              <div className="mt-4 w-full space-y-2">
                <div className="flex items-center gap-2 text-center text-[10px] text-muted-foreground/80">
                  <div className="h-px flex-1 bg-foreground/10" />
                  <span>Or check address manually</span>
                  <div className="h-px flex-1 bg-foreground/10" />
                </div>
                <p className="text-center text-[10px] text-muted-foreground/60">
                  Paste ARC address (0x...) to check interactions
                </p>
                <div className="flex w-full flex-col gap-1.5">
                  <div className="flex w-full gap-2">
                    <div className="relative flex-1">
                      <Input
                        value={manualAddress}
                        onChange={(event) => {
                          const value = event.target.value
                          setManualAddress(value)
                          validateAddress(value)
                          // Clear error when user starts typing
                          if (error && value.trim()) {
                            setError(null)
                          }
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && !isCheckingAddress && !isLoadingStats && manualAddress.trim() && addressValidation?.isValid) {
                            event.preventDefault()
                            handleManualLookup()
                          }
                        }}
                        onPaste={(event) => {
                          // Validate pasted content
                          setTimeout(() => {
                            validateAddress(manualAddress)
                          }, 0)
                        }}
                        placeholder="0x1234...abcd"
                        className={`flex-1 border-white/30 bg-white/[0.05] text-xs text-white placeholder:text-white/40 transition-all ${
                          addressValidation?.isValid 
                            ? 'border-green-500/50 focus:border-green-500/80' 
                            : addressValidation?.isValid === false && manualAddress.trim()
                            ? 'border-red-500/50 focus:border-red-500/80'
                            : 'focus:border-arc-accent/50'
                        } ${isCheckingAddress || isLoadingStats ? 'opacity-50 cursor-not-allowed' : ''}`}
                        autoComplete="off"
                        maxLength={66}
                        disabled={isCheckingAddress || isLoadingStats}
                      />
                      {addressValidation && manualAddress.trim() && (
                        <div className={`absolute right-3 top-1/2 -translate-y-1/2 transition-opacity ${
                          addressValidation.isValid ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {addressValidation.isValid ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        console.log('🔘 Check button clicked', { 
                          addressValidation, 
                          isCheckingAddress, 
                          isLoadingStats,
                          manualAddress 
                        })
                        // Allow click even if validation state is not set, will validate in handleManualLookup
                        if (!isCheckingAddress && !isLoadingStats) {
                          handleManualLookup()
                        }
                      }}
                      disabled={isCheckingAddress || isLoadingStats}
                      className={`flex-shrink-0 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-white transition-all active:scale-95 ${
                        addressValidation?.isValid && !isCheckingAddress && !isLoadingStats
                          ? 'bg-arc-accent hover:bg-arc-accent/90 hover:shadow-[0_0_20px_rgba(0,174,239,0.4)]'
                          : 'bg-white/10 hover:bg-white/20 disabled:opacity-60'
                      }`}
                    >
                      {isCheckingAddress || isLoadingStats ? (
                        <span className="flex items-center gap-2">
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Checking...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Activity className="h-3 w-3" />
                          Check
                        </span>
                      )}
                    </Button>
                  </div>
                  {addressValidation && manualAddress.trim() && (
                    <p className={`text-xs transition-all ${
                      addressValidation.isValid 
                        ? 'text-green-400/80' 
                        : 'text-red-400/80'
                    }`}>
                      {addressValidation.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Connected status */}
              <div className="mb-1 flex flex-col items-center gap-0.5">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                  </span>
                  <span className="text-xs font-medium text-green-400">
                    {isConnected ? 'Connected' : 'Manual lookup'}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground/60">
                  {isConnected ? 'ARC Testnet wallet active' : 'Address analyzed manually'}
                </span>
              </div>

              {/* Wallet Address + USDC em linha */}
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div className="rounded-lg border border-white/10 bg-white/5 p-2.5 transition-all hover:border-white/20">
                  <div className="mb-0.5 flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                    <Wallet className="h-2.5 w-2.5 text-arc-accent" />
                    Wallet Address
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate font-mono text-xs font-semibold text-foreground">
                      {walletData && shortenAddress(walletData.address)}
                    </span>
                    <div className="flex shrink-0 gap-0.5">
                      <button
                        onClick={copyAddress}
                        className="rounded p-1.5 text-muted-foreground transition-all hover:bg-white/10 hover:text-arc-accent"
                        title="Copy address"
                      >
                        {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                      <a
                        href={`https://testnet.arcscan.app/address/${walletData?.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded p-1.5 text-muted-foreground transition-all hover:bg-white/10 hover:text-arc-accent"
                        title="View on explorer"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
                {walletData?.balance !== undefined && (
                  <div className="rounded-lg border border-white/10 bg-white/5 p-2.5 transition-all hover:border-white/20 min-w-0">
                    <div className="mb-0.5 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                        <Coins className="h-2.5 w-2.5 text-arc-accent" />
                        USDC
                      </div>
                      {walletData.lastUpdated && (
                        <span className="text-[9px] text-muted-foreground/60">
                          {new Date(walletData.lastUpdated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="bg-gradient-to-r from-arc-accent to-cyan-300 bg-clip-text text-lg font-bold text-transparent">
                        {walletData.balanceFormatted || walletData.balance?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Interactions Card */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-2.5 transition-all hover:border-white/20">
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                    <Activity className="h-2.5 w-2.5 text-arc-accent" />
                    Total Interactions
                  </div>
                  <div className="flex items-center gap-1.5">
                    {walletRank !== null && (
                      <a
                        href="/leaderboard"
                        className="flex items-center gap-1 rounded-full border border-arc-accent/30 bg-arc-accent/10 px-2 py-0.5 hover:bg-arc-accent/20 transition-colors"
                        title="View full leaderboard"
                      >
                        <Trophy className="h-2.5 w-2.5 text-arc-accent" />
                        <span className="text-[10px] font-semibold text-arc-accent">#{walletRank}</span>
                      </a>
                    )}
                    <button
                      onClick={() => walletData && fetchWalletStats(walletData.address, false, isConnected)}
                      disabled={isRefreshing || isLoadingStats}
                      className="rounded p-1 text-muted-foreground transition-all hover:bg-white/10 hover:text-arc-accent disabled:opacity-50"
                      title="Refresh stats"
                    >
                      <RefreshCw className={`h-3 w-3 ${isRefreshing || isLoadingStats ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
                {isLoadingStats ? (
                  <div className="flex flex-col items-center justify-center py-2 gap-1">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-arc-accent/30 border-t-arc-accent" />
                    <p className="text-[10px] text-muted-foreground animate-pulse">Loading...</p>
                  </div>
                ) : error ? (
                  <div className="flex items-center gap-1.5 py-2 text-[10px] text-red-400">
                    <AlertCircle className="h-3 w-3" />
                    <span>Failed to load</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1.5">
                      <span className="bg-gradient-to-r from-arc-accent to-cyan-300 bg-clip-text text-xl font-bold text-transparent">
                        {walletData?.interactions.toLocaleString() || 0}
                      </span>
                      <span className="text-[10px] text-muted-foreground">transactions</span>
                    </div>
                    {chartData.length > 0 && (
                      <div className="mt-2 h-14 w-full">
                        <div className="mb-0.5 flex items-center gap-1 text-[9px] text-muted-foreground">
                          <TrendingUp className="h-2.5 w-2.5 text-arc-accent" />
                          <span>Growth over last 30 days</span>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 2, right: 2, left: -18, bottom: 2 }}>
                            <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '8px' }} interval={Math.floor(chartData.length / 5)} />
                            <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '8px' }} width={28} />
                            <Tooltip
                              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                              labelStyle={{ color: '#fff' }}
                            />
                            <Line type="monotone" dataKey="interactions" stroke="#00AEEF" strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    {chartData.length === 0 && (
                      <div className="mt-2 flex items-end gap-0.5 h-5">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 80].map((height, i) => (
                          <div key={i} className="flex-1 rounded-sm bg-arc-accent/30 transition-all hover:bg-arc-accent/50" style={{ height: `${height}%` }} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Disconnect Button */}
              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="w-full rounded-lg border-white/10 bg-transparent py-2 text-[10px] font-medium text-muted-foreground transition-all duration-200 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
              >
                {isConnected ? 'Disconnect wallet' : 'Clear lookup'}
              </Button>
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  )
}
