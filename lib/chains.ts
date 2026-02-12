/**
 * Chain definitions for viem (e.g. createPublicClient).
 */

const RPC_URL = 'https://rpc.testnet.arc.network'

export const arcTestnet = {
  id: 11124,
  name: 'Arc Testnet',
  network: 'arc-testnet',
  nativeCurrency: { name: 'ARC', symbol: 'ARC', decimals: 18 },
  rpcUrls: {
    default: { http: [RPC_URL] },
  },
} as const
