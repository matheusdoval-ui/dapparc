/**
 * Token config for Arc Testnet (USDC / EUR).
 * Addresses can be overridden via env; fallbacks match faucet defaults.
 */

const USDC_DEFAULT = "0x3910B7cbb3341f1F4bF4cEB66e4A2C8f204FE2b8"
const EUR_DEFAULT = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a"

export const TOKENS = {
  USDC: {
    address: (process.env.NEXT_PUBLIC_USDC_ADDRESS || USDC_DEFAULT) as string,
    decimals: 6,
    symbol: "USDC",
  },
  EUR: {
    address: (process.env.NEXT_PUBLIC_EUR_ADDRESS || process.env.NEXT_PUBLIC_EURC_ADDRESS || EUR_DEFAULT) as string,
    decimals: 6,
    symbol: "EUR",
  },
} as const
