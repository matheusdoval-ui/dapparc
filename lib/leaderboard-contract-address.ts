/**
 * Single source of truth for the Leaderboard contract address (submitScore + ScoreSubmitted).
 * Set NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS in .env and Vercel. No fallback.
 */

export const LEADERBOARD_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_LEADERBOARD_CONTRACT_ADDRESS!
