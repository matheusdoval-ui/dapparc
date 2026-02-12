/**
 * In-memory faucet claim history. Server-side only.
 * For production at scale, replace with DB or Redis.
 */

export type FaucetClaim = {
  address: string
  token: string
  amount: string
  txHash: string
  timestamp: number
}

export const faucetHistory: FaucetClaim[] = []

const MAX_HISTORY = 200

export function addFaucetClaim(claim: FaucetClaim): void {
  faucetHistory.push(claim)
  if (faucetHistory.length > MAX_HISTORY) {
    faucetHistory.splice(0, faucetHistory.length - MAX_HISTORY)
  }
}

export function getRecentClaims(limit: number = 50): FaucetClaim[] {
  return faucetHistory.slice(-limit).reverse()
}
