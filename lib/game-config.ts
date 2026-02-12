/**
 * Config for the memory puzzle game.
 */

import { LEADERBOARD_CONTRACT_ADDRESS } from './leaderboard-contract-address'

export const LEADERBOARD_GAME_CONTRACT = LEADERBOARD_CONTRACT_ADDRESS

export const ARC_TESTNET = {
  id: 5042002,
  name: 'Arc Testnet',
  network: 'arc-testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
  },
} as const

export const GAME_COLORS = ['red', 'blue', 'green', 'yellow'] as const
export type GameColor = (typeof GAME_COLORS)[number]
