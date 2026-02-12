"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { ethers } from "ethers"
import { Wallet, Activity, Copy, Check, ExternalLink, Zap, Shield, Globe, AlertCircle, Coins, RefreshCw, Clock, TrendingUp, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CelebrationAnimation } from "@/components/celebration-animation"
import { InteractionLevelPopup } from "@/components/interaction-level-popup"
import { connectWallet, isWalletInstalled, getAccounts, getChainId, ensureArcTestnet, getWalletName, registerQueryAsTransaction } from "@/lib/wallet"
import { useRegistration } from "@/contexts/registration-context"
import { isTargetAddressConnected, checkLeaderboardRegistration } from "@/lib/leaderboard-registration"
import { useUserOperation } from "@/hooks/useUserOperation"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TOKENS } from "@/lib/tokens"
import { getTokenBalance } from "@/lib/getTokenBalance"

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
  const [saveScoreStatus, setSaveScoreStatus] = useState<'idle' | 'saving' | 'sent' | 'saved' | 'error'>('idle')
  const [saveScoreError, setSaveScoreError] = useState<string | null>(null)
  const leaderboardSavedThisSessionRef = useRef(false)
  const [faucetLoading, setFaucetLoading] = useState<'USDC' | 'EUR' | null>(null)
  const [faucetError, setFaucetError] = useState<string | null>(null)
  const [faucetSuccess, setFaucetSuccess] = useState<string | null>(null)
  const [faucetNotConfigured, setFaucetNotConfigured] = useState(false)
  const [faucetHistory, setFaucetHistory] = useState<Array<{ address: string; token: string; amount: string; txHash: string; timestamp: number }>>([])
  const [faucetHistoryLoading, setFaucetHistoryLoading] = useState(false)
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null)
  const [eurBalance, setEurBalance] = useState<number | null>(null)
  // Hooks para Account Abstraction
  const { isRegistered: contextIsRegistered, checkRegistration, registerViaUserOperation } = useRegistration()
  const { isSmartAccount, checkAccount } = useUserOperation()
  
  // Endereço alvo específico
  const TARGET_ADDRESS = '0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2'

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Faucet: defined early so useEffect/handlers can reference without TDZ
  const fetchFaucetHistory = useCallback(async () => {
    setFaucetHistoryLoading(true)
    try {
      const res = await fetch('/api/faucet/history', { cache: 'no-store' })
      const data = await res.json()
      if (data.success && Array.isArray(data.claims)) {
        setFaucetHistory(data.claims)
      }
    } catch {
      setFaucetHistory([])
    } finally {
      setFaucetHistoryLoading(false)
    }
  }, [])

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
          
          // SEMPRE usar o contrato Registry se configurado (OBRIGATÓRIO para evitar Raw input 0x)
          // No cliente, só funciona com NEXT_PUBLIC_*
          const registryContractAddress = 
            process.env.NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS ||
            process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
            null
          
          const txHash = await registerQueryAsTransaction(registryContractAddress || undefined)
          
          if (registryContractAddress) {
            console.log('✅ Using Registry Contract:', registryContractAddress)
            console.log('✅ CallData será gerado com register() - Raw input não será 0x')
            console.log('✅ Transação será enviada para o contrato, não para próprio endereço')
          } else {
            console.warn('⚠️ Registry Contract not configured - Raw input será 0x')
            console.warn('⚠️ Configure NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS no .env.local')
          }
          
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

      // Backend relayer: POST /api/leaderboard (owner writes addPoints on-chain) — once per session
      if (!leaderboardSavedThisSessionRef.current) {
        setSaveScoreStatus('saving')
        setSaveScoreError(null)
        fetch('/api/leaderboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userAddress: address }),
        })
          .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
          .then(({ ok, data }) => {
            if (ok && data.success) {
              setSaveScoreStatus('saved')
              leaderboardSavedThisSessionRef.current = true
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('leaderboard-updated'))
              }
            } else {
              const err = data?.error ?? data?.message ?? ''
              const isNotConfigured =
                err === 'LEADERBOARD_NOT_CONFIGURED' ||
                String(err).toLowerCase().includes('server not configured for leaderboard')
              if (isNotConfigured) {
                setSaveScoreStatus('idle')
                setSaveScoreError(null)
                leaderboardSavedThisSessionRef.current = true
              } else {
                setSaveScoreStatus('error')
                setSaveScoreError(data?.message ?? data?.error ?? 'Failed to save to leaderboard')
              }
            }
          })
          .catch((err) => {
            setSaveScoreStatus('error')
            const msg = err instanceof Error ? err.message : String(err)
            setSaveScoreError(msg)
            console.error('[WalletCard] leaderboard API error:', err)
          })
      }

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

  // useEffect para detectar endereço específico e registrar automaticamente
  useEffect(() => {
    const handleAutoRegistration = async () => {
      // Verificar se endereço específico está conectado
      if (!isConnected || !walletData?.address) return

      const connectedAddress = walletData.address
      const isTarget = isTargetAddressConnected(connectedAddress, TARGET_ADDRESS)

      if (!isTarget) {
        console.log('ℹ️ Connected address is not the target address')
        return
      }

      console.log('✅ Target address detected:', connectedAddress)

      try {
        // Verificar se é Smart Account
        await checkAccount(connectedAddress as `0x${string}`)
        
        if (!isSmartAccount) {
          console.log('ℹ️ Target address is not a Smart Account, skipping auto-registration')
          return
        }

        console.log('✅ Smart Account confirmed for target address')

        // Verificar se já está registrado
        setIsCheckingRegistration(true)
        const registered = await checkLeaderboardRegistration(connectedAddress)
        setIsRegistered(registered)

        if (registered) {
          console.log('✅ Target address already registered in leaderboard')
          await checkRegistration(connectedAddress) // Atualizar contexto
          return
        }

        // Se não estiver registrado, registrar via UserOperation
        console.log('📝 Registering target address via UserOperation...')
        setIsRegistering(true)

        // Usar função do contexto para registrar
        const userOpHash = await registerViaUserOperation(connectedAddress)

        console.log('✅ Registration UserOperation sent:', userOpHash)

        // Status já será atualizado pelo contexto
        setIsRegistered(true)
      } catch (err: any) {
        console.error('❌ Error in auto-registration:', err)
        if (err.message?.includes('already registered')) {
          setIsRegistered(true)
          await checkRegistration(connectedAddress)
        }
      } finally {
        setIsCheckingRegistration(false)
        setIsRegistering(false)
      }
    }

    handleAutoRegistration()
  }, [isConnected, walletData?.address, isSmartAccount, checkAccount, checkRegistration])

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

  // Fetch USDC and EUR token balances when wallet address is available
  useEffect(() => {
    const address = walletData?.address
    if (!address) {
      setUsdcBalance(null)
      setEurBalance(null)
      return
    }
    const rpc = process.env.NEXT_PUBLIC_ARC_RPC || "https://rpc.testnet.arc.network"
    const provider = new ethers.JsonRpcProvider(rpc)
    let cancelled = false
    Promise.all([
      getTokenBalance(TOKENS.USDC.address, address, provider, TOKENS.USDC.decimals),
      getTokenBalance(TOKENS.EUR.address, address, provider, TOKENS.EUR.decimals),
    ])
      .then(([usdc, eur]) => {
        if (!cancelled) {
          setUsdcBalance(usdc)
          setEurBalance(eur)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUsdcBalance(null)
          setEurBalance(null)
        }
      })
    return () => {
      cancelled = true
    }
  }, [walletData?.address])

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
    setSaveScoreStatus('idle')
    setSaveScoreError(null)
    leaderboardSavedThisSessionRef.current = false
    setFaucetLoading(null)
    setFaucetError(null)
    setFaucetSuccess(null)
    setUsdcBalance(null)
    setEurBalance(null)
    setFaucetNotConfigured(false)
    setFaucetHistory([])
  }

  const copyAddress = async () => {
    if (walletData) {
      await navigator.clipboard.writeText(walletData.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const requestFaucet = useCallback(
    async (token: 'USDC' | 'EUR') => {
      if (!walletData?.address) return
      setFaucetLoading(token)
      setFaucetError(null)
      setFaucetSuccess(null)
      setFaucetNotConfigured(false)
      try {
        const res = await fetch('/api/faucet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: walletData.address,
            token: token === 'EUR' ? 'EUR' : 'USDC',
          }),
        })
        const data = await res.json()
        if (data.success) {
          setFaucetSuccess(`${token === 'EUR' ? 'EURC' : token} sent! Tx: ${(data.hash as string).slice(0, 10)}...`)
          setTimeout(() => setFaucetSuccess(null), 5000)
          if (walletData?.address) fetchWalletStats(walletData.address, false, isConnected)
          fetchFaucetHistory()
        } else {
          if (res.status === 429) {
            setFaucetError(data.error || 'Rate limit exceeded. Try again later.')
          } else if (data.error === 'FAUCET_NOT_CONFIGURED' || String(data.message || '').toLowerCase().includes('not configured')) {
            setFaucetNotConfigured(true)
          } else {
            setFaucetError(data.error || data.message || 'Request failed')
          }
        }
      } catch (e) {
        setFaucetError(e instanceof Error ? e.message : 'Request failed')
      } finally {
        setFaucetLoading(null)
      }
    },
    [walletData?.address, isConnected, fetchWalletStats, fetchFaucetHistory]
  )

  function timeAgo(ts: number): string {
    const sec = Math.floor((Date.now() - ts) / 1000)
    if (sec < 60) return `${sec}s ago`
    const min = Math.floor(sec / 60)
    if (min < 60) return `${min}m ago`
    const h = Math.floor(min / 60)
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    return `${d}d ago`
  }

  // Load faucet history when wallet is available (must be after fetchFaucetHistory is defined)
  useEffect(() => {
    if (walletData?.address) fetchFaucetHistory()
  }, [walletData?.address, fetchFaucetHistory])

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
      {/* Card padronizado: mesmo layout conectado / desconectado */}
      <div className="wallet-card-fixed bg-card border border-border rounded-2xl shadow-xl px-5 pt-5 pb-6 overflow-hidden flex flex-col gap-4 backdrop-blur-sm">

          {/* Header — idêntico em ambos os estados */}
          <div className="flex flex-col items-center gap-1">
            <div className="animate-pulse-glow flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-arc-accent to-arc-accent/70 shadow-[0_0_20px_rgba(0,174,239,0.35)]">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-base font-bold tracking-wide text-foreground">ARC Network</h2>
            <p className="text-[10px] tracking-wide text-muted-foreground opacity-80">Decentralized Infrastructure</p>
          </div>

          <div className="scrollbar-hide min-h-0 overflow-x-hidden">
          {!walletData ? (
            <div className="flex flex-col items-center gap-4">
              {/* Badges — Secure, Fast, EVM */}
              <div className="flex flex-wrap justify-center gap-2">
                <div className="flex items-center gap-1 rounded-full border border-arc-accent/15 bg-arc-accent/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground transition-all hover:border-arc-accent/30 hover:bg-arc-accent/10 hover:text-arc-accent">
                  <Shield className="h-2.5 w-2.5 text-arc-accent" />
                  Secure
                </div>
                <div className="flex items-center gap-1 rounded-full border border-arc-accent/15 bg-arc-accent/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground transition-all hover:border-arc-accent/30 hover:bg-arc-accent/10 hover:text-arc-accent">
                  <Zap className="h-2.5 w-2.5 text-arc-accent" />
                  Fast
                </div>
                <div className="flex items-center gap-1 rounded-full border border-arc-accent/15 bg-arc-accent/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground transition-all hover:border-arc-accent/30 hover:bg-arc-accent/10 hover:text-arc-accent">
                  <Globe className="h-2.5 w-2.5 text-arc-accent" />
                  EVM
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground opacity-80">
                Connect your wallet or paste an address to view on-chain interactions.
              </p>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-border bg-destructive/10 px-3 py-2 text-xs text-red-400 animate-in slide-in-from-top-2 w-full">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                  <button onClick={() => setError(null)} className="ml-auto text-red-400/60 hover:text-red-400 transition-colors" aria-label="Dismiss error">×</button>
                </div>
              )}

              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="h-11 w-full rounded-lg group relative overflow-hidden border border-arc-accent/30 bg-arc-accent py-4 text-sm font-semibold tracking-wide text-white transition-all duration-300 hover:border-arc-accent/60 hover:bg-arc-accent/95 hover:shadow-[0_0_36px_rgba(0,174,239,0.5)] disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
              >
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

              <p className="text-[10px] text-muted-foreground opacity-80">
                MetaMask or Rabby • ARC Testnet
              </p>

              <div className="w-full flex flex-col gap-3">
                <div className="flex items-center gap-2 text-center text-[10px] text-muted-foreground opacity-80">
                  <div className="h-px flex-1 bg-foreground/10" />
                  <span>Or check an address</span>
                  <div className="h-px flex-1 bg-foreground/10" />
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-3 transition-all hover:border-border hover:bg-muted/50">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    <Activity className="h-3 w-3 text-arc-accent" />
                    Check address
                  </div>
                  <div className="flex w-full flex-col gap-3">
                    <div className="relative w-full">
                      <Input
                        value={manualAddress}
                        onChange={(e) => { setManualAddress(e.target.value); validateAddress(e.target.value); if (error && e.target.value.trim()) setError(null) }}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !isCheckingAddress && !isLoadingStats && manualAddress.trim() && addressValidation?.isValid) { e.preventDefault(); handleManualLookup() } }}
                        onPaste={() => setTimeout(() => validateAddress(manualAddress), 0)}
                        placeholder="0x... paste wallet address"
                          className={`w-full min-h-[44px] rounded-xl border border-border bg-muted/30 px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-all ${
                          addressValidation?.isValid ? 'border-green-500/50 focus:border-green-500/80' :
                          addressValidation?.isValid === false && manualAddress.trim() ? 'border-red-500/50 focus:border-red-500/80' : 'focus:border-arc-accent/50'
                        } ${isCheckingAddress || isLoadingStats ? 'opacity-50 cursor-not-allowed' : ''}`}
                        autoComplete="off"
                        maxLength={66}
                        disabled={isCheckingAddress || isLoadingStats}
                      />
                      {addressValidation && manualAddress.trim() && (
                        <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${addressValidation.isValid ? 'text-green-400' : 'text-red-400'}`}>
                          {addressValidation.isValid ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={(e) => { e.preventDefault(); if (!isCheckingAddress && !isLoadingStats) handleManualLookup() }}
                      disabled={isCheckingAddress || isLoadingStats}
                      className={`h-11 w-full rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-white transition-all active:scale-95 ${
                        addressValidation?.isValid && !isCheckingAddress && !isLoadingStats
                          ? 'bg-arc-accent hover:bg-arc-accent/90 hover:shadow-[0_0_20px_rgba(0,174,239,0.4)]'
                          : 'bg-muted/50 hover:bg-muted disabled:opacity-60'
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
                    {addressValidation && manualAddress.trim() && (
                      <p className={`text-xs ${addressValidation.isValid ? 'text-green-400/80' : 'text-red-400/80'}`}>{addressValidation.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 w-full">
              {/* Status — mesmo layout que badges: linha 1 = pill, linha 2 = subtitle */}
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex items-center justify-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wider text-green-400">
                    {isConnected ? 'Connected' : 'Manual lookup'}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground opacity-80">
                  {isConnected ? 'ARC Testnet wallet active' : 'Address looked up manually'}
                </span>
              </div>

              {/* On-chain score save feedback */}
              {isConnected && saveScoreStatus !== 'idle' && (
                <div
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs w-full animate-in slide-in-from-top-2 ${
                    saveScoreStatus === 'error'
                      ? 'border-red-500/30 bg-red-500/10 text-red-400'
                      : saveScoreStatus === 'saved'
                        ? 'border-green-500/30 bg-green-500/10 text-green-400'
                        : 'border-arc-accent/30 bg-arc-accent/10 text-arc-accent'
                  }`}
                >
                  {saveScoreStatus === 'saving' && (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-arc-accent/30 border-t-arc-accent" />
                      Saving score on-chain...
                    </>
                  )}
                  {saveScoreStatus === 'sent' && (
                    <>
                      <Check className="h-4 w-4" />
                      Transaction sent...
                    </>
                  )}
                  {saveScoreStatus === 'saved' && (
                    <>
                      <Check className="h-4 w-4" />
                      Saved to leaderboard!
                    </>
                  )}
                  {saveScoreStatus === 'error' && (
                    <>
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {saveScoreError ?? 'Failed to save to leaderboard'}
                    </>
                  )}
                </div>
              )}

              {/* Seções padronizadas — mesmo estilo de card */}
              <div className="flex flex-col gap-3 overflow-hidden w-full">
                <div className="rounded-xl border border-border bg-muted/30 p-3 transition-all hover:border-border hover:bg-muted/50">
                  <div className="mb-1.5 flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    <Wallet className="h-3 w-3 text-arc-accent" />
                    Address
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold text-foreground">{walletData && shortenAddress(walletData.address)}</span>
                    <div className="flex gap-1">
                      <button onClick={copyAddress} className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-muted hover:text-arc-accent" title="Copy address">
                        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                        <a href={`https://testnet.arcscan.app/address/${walletData?.address}`} target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-muted hover:text-arc-accent" title="View on explorer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>

                {(usdcBalance !== null || walletData?.balance !== undefined) && (
                  <div className="rounded-xl border border-border bg-muted/30 p-3 transition-all hover:border-border hover:bg-muted/50">
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        <Coins className="h-3 w-3 text-arc-accent" />
                        USDC Balance
                      </div>
                      {walletData?.lastUpdated && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground opacity-80">
                          <Clock className="h-3 w-3" />
                          {new Date(walletData.lastUpdated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="bg-gradient-to-r from-arc-accent to-cyan-300 bg-clip-text text-xl font-bold text-transparent">
                        {usdcBalance !== null ? usdcBalance.toFixed(2) : (walletData?.balanceFormatted ?? walletData?.balance?.toFixed(2) ?? "...")}
                      </span>
                      <span className="text-xs text-muted-foreground opacity-80">USDC</span>
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-border bg-muted/30 p-3 transition-all hover:border-border hover:bg-muted/50">
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      <Coins className="h-3 w-3 text-arc-accent" />
                      EUR Balance
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="bg-gradient-to-r from-arc-accent to-cyan-300 bg-clip-text text-xl font-bold text-transparent">
                      {eurBalance !== null ? eurBalance.toFixed(2) : "..."}
                    </span>
                    <span className="text-xs text-muted-foreground opacity-80">EUR</span>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-3 transition-all hover:border-border hover:bg-muted/50">
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      <Activity className="h-3 w-3 text-arc-accent" />
                      Interactions
                    </div>
                    <div className="flex items-center gap-2">
                      {walletRank != null && (
                        <a href="/leaderboard" className="flex items-center gap-1.5 rounded-full border border-arc-accent/30 bg-arc-accent/10 px-2.5 py-1 text-[10px] font-semibold text-arc-accent hover:bg-arc-accent/20 transition-colors" title="View full leaderboard">
                          <Trophy className="h-3 w-3 text-arc-accent" />
                          Rank #{walletRank}
                        </a>
                      )}
                      <button
                        onClick={() => walletData && fetchWalletStats(walletData.address, false, isConnected)}
                        disabled={isRefreshing || isLoadingStats}
                        className="rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-muted hover:text-arc-accent disabled:opacity-50"
                        title="Refresh stats"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing || isLoadingStats ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                  {isLoadingStats ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-4">
                      <span className="h-6 w-6 animate-spin rounded-full border-2 border-arc-accent/30 border-t-arc-accent" />
                      <p className="text-xs text-muted-foreground animate-pulse">Loading...</p>
                    </div>
                  ) : error ? (
                    <div className="flex items-center gap-2 py-3 text-xs text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <span>Failed to load interactions</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="bg-gradient-to-r from-arc-accent to-cyan-300 bg-clip-text text-xl font-bold text-transparent">
                          {(walletData?.interactions ?? 0).toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground opacity-80">transactions</span>
                      </div>
                      {chartData.length > 0 && (
                        <div className="h-28 w-full mt-2 animate-in fade-in slide-in-from-bottom-4">
                          <div className="mb-1 flex items-center gap-1.5 text-[10px] text-muted-foreground opacity-80">
                            <TrendingUp className="h-3 w-3 text-arc-accent" />
                            <span>Last 30 days</span>
                          </div>
                          <div className="relative w-full aspect-[4/1] min-h-[80px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                              <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '10px' }} interval={Math.floor(chartData.length / 6)} />
                              <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '10px' }} width={40} />
                              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} labelStyle={{ color: '#fff' }} />
                              <Line type="monotone" dataKey="interactions" stroke="#00AEEF" strokeWidth={2} dot={{ fill: '#00AEEF', r: 3 }} activeDot={{ r: 5 }} />
                            </LineChart>
                          </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                      {chartData.length === 0 && (
                        <div className="mt-3 flex items-end gap-0.5 h-6">
                          {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 80].map((h, i) => (
                            <div key={i} className="flex-1 rounded-sm bg-arc-accent/30 transition-all hover:bg-arc-accent/50" style={{ height: `${h}%` }} />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Faucet */
              {walletData?.address && (
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    <Coins className="h-3 w-3 text-arc-accent" />
                    Receive test tokens
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => requestFaucet('USDC')}
                      disabled={faucetLoading !== null}
                      className="h-11 w-full flex-1 rounded-lg border border-border bg-muted/50 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
                    >
                      {faucetLoading === 'USDC' ? (
                        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        'Receive USDC'
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => requestFaucet('EUR')}
                      disabled={faucetLoading !== null}
                      className="h-11 w-full flex-1 rounded-lg border border-border bg-muted/50 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
                    >
                      {faucetLoading === 'EUR' ? (
                        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        'Receive EUR'
                      )}
                    </Button>
                  </div>
                  {faucetSuccess && (
                    <p className="mt-1.5 text-xs text-green-400">{faucetSuccess}</p>
                  )}
                  {faucetNotConfigured && (
                    <p className="mt-1.5 text-xs text-muted-foreground opacity-80">Faucet is not configured on this server.</p>
                  )}
                  {faucetError && (
                    <p className="mt-1.5 text-xs text-red-400">{faucetError}</p>
                  )}
                  <div className="mt-2.5 border-t border-border pt-2.5">
                    <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Recent claims
                    </p>
                    {faucetHistoryLoading ? (
                      <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-arc-accent/30 border-t-arc-accent" />
                        Loading...
                      </div>
                    ) : faucetHistory.length === 0 ? (
                      <p className="py-2 text-center text-xs text-muted-foreground opacity-80">No claims yet</p>
                    ) : (
                      <div className="max-h-40 overflow-y-auto rounded-lg border border-border bg-muted/20">
                        <table className="w-full text-left text-[10px]">
                          <thead className="sticky top-0 border-b border-border bg-muted/40 text-muted-foreground">
                            <tr>
                              <th className="px-2 py-1.5 font-medium">Wallet</th>
                              <th className="px-2 py-1.5 font-medium">Token</th>
                              <th className="px-2 py-1.5 font-medium">Amount</th>
                              <th className="px-2 py-1.5 font-medium">Time</th>
                              <th className="px-2 py-1.5 font-medium">Tx</th>
                            </tr>
                          </thead>
                          <tbody>
                            {faucetHistory.map((claim, i) => (
                              <tr key={`${claim.txHash}-${i}`} className="border-b border-border/50 last:border-0">
                                <td className="px-2 py-1.5 font-mono text-foreground">{shortenAddress(claim.address)}</td>
                                <td className="px-2 py-1.5 text-foreground">{claim.token}</td>
                                <td className="px-2 py-1.5 text-foreground">{claim.amount}</td>
                                <td className="px-2 py-1.5 text-muted-foreground">{timeAgo(claim.timestamp)}</td>
                                <td className="px-2 py-1.5">
                                  <a
                                    href={`https://testnet.arcscan.app/tx/${claim.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-0.5 text-arc-accent hover:underline"
                                    title={claim.txHash}
                                  >
                                    {claim.txHash.slice(0, 8)}…
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="h-10 w-full rounded-lg border border-border bg-muted/30 text-xs font-medium text-muted-foreground transition-all duration-200 hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
              >
                {isConnected ? 'Disconnect' : 'Clear'}
              </Button>
            </div>
          )}
          </div>
      </div>
    </>
  )
}
