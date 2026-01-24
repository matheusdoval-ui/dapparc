/**
 * Payment verification for leaderboard access
 * Checks if a wallet has paid the required fee to appear in the leaderboard
 */

import { JsonRpcProvider } from 'ethers'

// ARC Testnet Configuration
const ARC_RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network'

// Developer wallet address (recipient of payment)
export const DEVELOPER_WALLET = '0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2'.toLowerCase()

// Token contract addresses (USDC and EURC on ARC Testnet)
const USDC_CONTRACT = '0x3910B7cbb3341f1F4bF4cEB66e4A2C8f204FE2b8'.toLowerCase()
const EURC_CONTRACT = '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a'.toLowerCase()

// Minimum payment required: 0.5 USDC or EURC (6 decimals, so 0.5 * 1e6)
const MINIMUM_PAYMENT_AMOUNT = BigInt('500000') // 0.5 * 10^6 = 500000 (6 decimals)

// ERC-20 Transfer event signature: Transfer(address,address,uint256)
const TRANSFER_EVENT_SIGNATURE = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

// Cache for payment verification (to avoid repeated RPC calls)
const paymentCache = new Map<string, { paid: boolean; timestamp: number }>()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

/**
 * Check if a wallet has paid the required fee to the developer wallet
 * Verifies by checking transaction history for transfers to developer address
 */
export async function hasPaidLeaderboardFee(walletAddress: string): Promise<boolean> {
  const normalizedAddress = walletAddress.toLowerCase()
  
  // Check cache first
  const cached = paymentCache.get(normalizedAddress)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`💾 Using cached payment status for ${normalizedAddress}: ${cached.paid}`)
    return cached.paid
  }

  try {
    const provider = new JsonRpcProvider(ARC_RPC_URL)
    
    // Get the latest block number
    const latestBlock = await provider.getBlockNumber()
    
    // Check last 5000 blocks for token transfers (approximately last few days)
    const blocksToScan = Math.min(5000, latestBlock)
    const scanStartBlock = Math.max(0, latestBlock - blocksToScan)
    
    console.log(`🔍 Checking payment for ${normalizedAddress} from block ${scanStartBlock} to ${latestBlock}`)
    
    let hasPaid = false
    
    // Check both USDC and EURC token contracts
    const tokenContracts = [
      { address: USDC_CONTRACT, name: 'USDC' },
      { address: EURC_CONTRACT, name: 'EURC' }
    ]
    
    // Pad addresses for topic filtering (32 bytes, 64 hex chars)
    const fromAddressTopic = `0x${normalizedAddress.slice(2).padStart(64, '0')}`
    const toAddressTopic = `0x${DEVELOPER_WALLET.slice(2).padStart(64, '0')}`
    
    // Check each token contract
    for (const token of tokenContracts) {
      if (hasPaid) break
      
      try {
        console.log(`🔍 Checking ${token.name} transfers from ${normalizedAddress} to ${DEVELOPER_WALLET}`)
        
        // Query Transfer events: Transfer(address indexed from, address indexed to, uint256 value)
        const logs = await provider.send('eth_getLogs', [{
          fromBlock: `0x${scanStartBlock.toString(16)}`,
          toBlock: 'latest',
          address: token.address,
          topics: [
            TRANSFER_EVENT_SIGNATURE, // Transfer event signature
            fromAddressTopic,          // from address (indexed)
            toAddressTopic,            // to address (indexed)
          ]
        }])
        
        if (logs && Array.isArray(logs) && logs.length > 0) {
          console.log(`📋 Found ${logs.length} ${token.name} Transfer event(s)`)
          
          // Check each transfer event
          for (const log of logs) {
            try {
              // Decode the value from the data field (last 32 bytes)
              // Transfer event data is just the value (uint256)
              const valueHex = log.data || '0x0'
              const value = BigInt(valueHex)
              
              console.log(`💰 ${token.name} transfer amount: ${value.toString()} (${Number(value) / 1e6} ${token.name})`)
              
              if (value >= MINIMUM_PAYMENT_AMOUNT) {
                console.log(`✅ Found valid payment: ${Number(value) / 1e6} ${token.name} in tx ${log.transactionHash}`)
                hasPaid = true
                break
              }
            } catch (err) {
              console.warn(`⚠️ Error decoding transfer log:`, err)
              continue
            }
          }
        }
      } catch (tokenError: any) {
        console.warn(`⚠️ Error checking ${token.name} transfers:`, tokenError.message || tokenError)
        // Continue checking other tokens
        continue
      }
    }
    
    // Cache the result
    paymentCache.set(normalizedAddress, { paid: hasPaid, timestamp: Date.now() })
    
    if (hasPaid) {
      console.log(`✅ Payment verified for ${normalizedAddress}`)
    } else {
      console.log(`❌ No payment found for ${normalizedAddress}`)
    }
    
    return hasPaid
  } catch (error) {
    console.error(`❌ Error checking payment for ${normalizedAddress}:`, error)
    // On error, assume not paid (fail secure)
    paymentCache.set(normalizedAddress, { paid: false, timestamp: Date.now() })
    return false
  }
}

/**
 * Clear payment cache (useful for testing or forced refresh)
 */
export function clearPaymentCache(): void {
  paymentCache.clear()
  console.log('🗑️ Payment cache cleared')
}
