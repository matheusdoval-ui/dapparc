/**
 * Minimal ERC20 ABI for balanceOf and decimals.
 */

export const ERC20_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
] as const
