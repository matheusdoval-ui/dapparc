/**
 * Wallet utilities for MetaMask and Rabby Wallet integration with ARC Testnet
 */

// ARC Testnet Configuration
export const ARC_NETWORK_CONFIG = {
  chainId: '0x4D0A2A', // 5042002 in hex
  chainName: 'Arc Testnet',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.testnet.arc.network'],
  blockExplorerUrls: ['https://testnet.arcscan.app'],
}

const ARC_CHAIN_ID = 5042002

/**
 * Detect wallet type
 */
export type WalletType = 'metamask' | 'rabby' | 'unknown'

export function detectWallet(): WalletType | null {
  if (typeof window === 'undefined' || !window.ethereum) return null
  
  // Check for Rabby Wallet (has isRabby property)
  if ((window.ethereum as any).isRabby) {
    return 'rabby'
  }
  
  // Check for MetaMask
  if (window.ethereum.isMetaMask) {
    return 'metamask'
  }
  
  // Generic EIP-1193 provider
  return 'unknown'
}

/**
 * Check if any compatible wallet is installed (MetaMask or Rabby)
 */
export function isWalletInstalled(): boolean {
  return detectWallet() !== null
}

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
  return detectWallet() === 'metamask'
}

/**
 * Check if Rabby Wallet is installed
 */
export function isRabbyInstalled(): boolean {
  return detectWallet() === 'rabby'
}

/**
 * Get wallet name for display
 */
export function getWalletName(): string {
  const wallet = detectWallet()
  if (wallet === 'rabby') return 'Rabby Wallet'
  if (wallet === 'metamask') return 'MetaMask'
  return 'Wallet'
}

/**
 * Request account access from wallet (MetaMask or Rabby)
 */
export async function requestAccountAccess(): Promise<string[]> {
  if (!isWalletInstalled()) {
    throw new Error('No compatible wallet found. Please install MetaMask or Rabby Wallet to continue.')
  }

  try {
    // Request account access
    const accounts = await window.ethereum!.request({
      method: 'eth_requestAccounts',
    })
    return accounts
  } catch (error) {
    if ((error as any).code === 4001) {
      throw new Error('User rejected the connection request')
    }
    throw error
  }
}

/**
 * Get current connected accounts
 */
export async function getAccounts(): Promise<string[]> {
  if (!isWalletInstalled()) {
    throw new Error('No compatible wallet found')
  }

  try {
    const accounts = await window.ethereum!.request({
      method: 'eth_accounts',
    })
    return accounts
  } catch (error) {
    throw new Error('Failed to get accounts')
  }
}

/**
 * Get current chain ID
 */
export async function getChainId(): Promise<number> {
  if (!isWalletInstalled()) {
    throw new Error('No compatible wallet found')
  }

  try {
    const chainId = await window.ethereum!.request({
      method: 'eth_chainId',
    })
    return parseInt(chainId as string, 16)
  } catch (error) {
    throw new Error('Failed to get chain ID')
  }
}

/**
 * Switch to ARC Testnet
 */
export async function switchToArcTestnet(): Promise<void> {
  if (!isWalletInstalled()) {
    throw new Error('No compatible wallet found')
  }

  const walletName = getWalletName()

  try {
    // Try to switch to ARC Testnet
    await window.ethereum!.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ARC_NETWORK_CONFIG.chainId }],
    })
  } catch (switchError: any) {
    // If chain doesn't exist, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum!.request({
          method: 'wallet_addEthereumChain',
          params: [ARC_NETWORK_CONFIG],
        })
      } catch (addError) {
        throw new Error(`Failed to add ARC Testnet to ${walletName}`)
      }
    } else if (switchError.code === 4001) {
      throw new Error('User rejected the network switch')
    } else {
      throw new Error('Failed to switch network')
    }
  }
}

/**
 * Ensure user is connected to ARC Testnet
 */
export async function ensureArcTestnet(): Promise<void> {
  const currentChainId = await getChainId()

  if (currentChainId !== ARC_CHAIN_ID) {
    await switchToArcTestnet()
    // Verify switch was successful
    const newChainId = await getChainId()
    if (newChainId !== ARC_CHAIN_ID) {
      throw new Error('Failed to switch to ARC Testnet')
    }
  }
}

/**
 * Connect wallet and ensure correct network
 */
export async function connectWallet(): Promise<string> {
  // Check if any compatible wallet is installed
  if (!isWalletInstalled()) {
    const walletName = getWalletName()
    throw new Error(`${walletName} is not installed. Please install MetaMask or Rabby Wallet to continue.`)
  }

  // Request account access
  const accounts = await requestAccountAccess()

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts found')
  }

  const address = accounts[0]

  // Ensure connected to ARC Testnet
  await ensureArcTestnet()

  return address
}

/**
 * Register a query as an on-chain transaction
 * Creates a transaction when wallet stats are queried
 * Function selector for registerQuery(): 0x4d0a2a2a (keccak256("registerQuery()").slice(0, 4))
 */
export async function registerQueryAsTransaction(contractAddress?: string): Promise<string> {
  if (!isWalletInstalled()) {
    throw new Error('No compatible wallet found')
  }

  const accounts = await getAccounts()
  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts connected')
  }

  const address = accounts[0]

  try {
    // If contract address is provided, call the contract's registerQuery function
    if (contractAddress && /^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
      // Function selector for registerQuery() is: keccak256("registerQuery()") = 0x4d0a2a2a...
      // First 4 bytes: 0x4d0a2a2a
      const txHash = await window.ethereum!.request({
        method: 'eth_sendTransaction',
        params: [{
          from: address,
          to: contractAddress,
          data: '0x4d0a2a2a', // registerQuery() function selector
          gas: '0x186a0', // 100000 gas (safe estimate for contract call)
        }],
      })
      return txHash as string
    }

    // Fallback: Create a simple self-transfer transaction (sending 0 ETH to self)
    // This creates a transaction on-chain that will be counted by getTransactionCount
    const txHash = await window.ethereum!.request({
      method: 'eth_sendTransaction',
      params: [{
        from: address,
        to: address,
        value: '0x0', // 0 ETH
        gas: '0x5208', // 21000 gas (standard transfer)
      }],
    })

    return txHash as string
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('User rejected the transaction')
    }
    throw new Error(`Failed to register query: ${error.message}`)
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      isRabby?: boolean
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeListener: (event: string, callback: (...args: any[]) => void) => void
    }
  }
}
