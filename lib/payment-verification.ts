/**
 * Payment verification for leaderboard access
 * Checks if a wallet has paid the required fee to appear in the leaderboard
 */

import { JsonRpcProvider } from 'ethers'

// ARC Testnet Configuration
const ARC_RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network'

// Developer wallet address (recipient of payment)
export const DEVELOPER_WALLET = '0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2'.toLowerCase()

// Minimum payment required: 1 USDC (native token on ARC, so 1e18 wei)
const MINIMUM_PAYMENT_WEI = BigInt('1000000000000000000') // 1 USDC = 1e18 wei

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
    
    // Check last 1000 blocks for transactions (approximately last few hours)
    // This is a reasonable range for testnet activity
    const blocksToCheck = Math.min(1000, latestBlock)
    const startBlock = Math.max(0, latestBlock - blocksToCheck)
    
    console.log(`🔍 Checking payment for ${normalizedAddress} from block ${startBlock} to ${latestBlock}`)
    
    // Get all transactions sent from this wallet
    // We'll check if any transaction sent at least 1 USDC to developer wallet
    let hasPaid = false
    
    // Check recent transactions by getting transaction history
    // Since we can't easily query all transactions, we'll use a different approach:
    // Check the balance difference or use event logs
    
    // Alternative approach: Check if there's a direct transfer
    // We'll check the last 100 transactions from this address
    // by looking at transaction receipts
    
    // For now, let's use a simpler approach: check if the wallet has sent
    // a transaction with value >= 1 USDC to the developer address
    // by querying transaction history via block scanning
    
    // Get transaction count to know how many transactions to check
    const txCount = await provider.getTransactionCount(normalizedAddress, 'latest')
    
    // If wallet has no transactions, it hasn't paid
    if (txCount === 0) {
      console.log(`❌ Wallet ${normalizedAddress} has no transactions`)
      paymentCache.set(normalizedAddress, { paid: false, timestamp: Date.now() })
      return false
    }
    
    // More efficient approach: Use eth_getLogs to find transactions
    // Check last 1000 blocks for transactions from wallet to developer
    const blocksToScan = 1000
    const scanStartBlock = Math.max(0, latestBlock - blocksToScan)
    
    console.log(`🔍 Checking payment: scanning blocks ${scanStartBlock} to ${latestBlock}`)
    
    // Use eth_getLogs to find transactions more efficiently
    // This is faster than scanning individual blocks
    try {
      const logs = await provider.send('eth_getLogs', [{
        fromBlock: `0x${scanStartBlock.toString(16)}`,
        toBlock: 'latest',
        address: DEVELOPER_WALLET,
        topics: [
          null, // Any event
          `0x${normalizedAddress.slice(2).padStart(64, '0')}`, // from address (indexed)
        ]
      }])
      
      // Check if any log represents a payment
      // For native transfers, we need to check transaction receipts
      if (logs && Array.isArray(logs) && logs.length > 0) {
        // Check transaction receipts for these logs
        for (const log of logs.slice(0, 10)) { // Check first 10 matches
          try {
            const receipt = await provider.getTransactionReceipt(log.transactionHash)
            if (receipt) {
              const tx = await provider.getTransaction(log.transactionHash)
              if (tx && 
                  tx.from?.toLowerCase() === normalizedAddress &&
                  tx.to?.toLowerCase() === DEVELOPER_WALLET &&
                  tx.value >= MINIMUM_PAYMENT_WEI) {
                console.log(`✅ Found payment in tx ${log.transactionHash}: ${tx.value.toString()} wei`)
                hasPaid = true
                break
              }
            }
          } catch (err) {
            continue
          }
        }
      }
    } catch (logsError) {
      console.warn('⚠️ eth_getLogs failed, falling back to block scanning:', logsError)
      
      // Fallback: Check recent blocks (last 200 blocks for speed)
      const fallbackBlocks = 200
      const fallbackStart = Math.max(0, latestBlock - fallbackBlocks)
      
      for (let blockNum = latestBlock; blockNum >= fallbackStart && !hasPaid; blockNum--) {
        try {
          const block = await provider.getBlock(blockNum, true)
          if (block && block.transactions) {
            // Check first 50 transactions in block
            const txHashes = Array.isArray(block.transactions) 
              ? block.transactions.slice(0, 50)
              : []
            
            for (const txHash of txHashes) {
              try {
                const tx = typeof txHash === 'string' 
                  ? await provider.getTransaction(txHash)
                  : txHash
                
                if (tx && 
                    tx.from?.toLowerCase() === normalizedAddress &&
                    tx.to?.toLowerCase() === DEVELOPER_WALLET &&
                    tx.value >= MINIMUM_PAYMENT_WEI) {
                  console.log(`✅ Found payment in block ${blockNum}`)
                  hasPaid = true
                  break
                }
              } catch {
                continue
              }
            }
          }
        } catch {
          continue
        }
        if (hasPaid) break
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
