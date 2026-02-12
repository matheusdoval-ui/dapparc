/**
 * Full Leaderboard ABI (for registry/leaderboard-users when using old contract with mint, getRegistrationInfo, etc.)
 * Game uses minimal LEADERBOARD_ABI; this is for REGISTRY_CONTRACT_ADDRESS if it points to a full Leaderboard.
 */

export const LEADERBOARD_FULL_ABI = [
  { inputs: [{ internalType: 'uint256', name: 'score', type: 'uint256' }], name: 'submitScore', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ internalType: 'address', name: '', type: 'address' }], name: 'bestScore', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'mint', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ internalType: 'address', name: '', type: 'address' }], name: 'isRegistered', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'getAllRegisteredUsers', outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'getTotalUsers', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getRegistrationInfo',
    outputs: [
      { internalType: 'bool', name: 'registered', type: 'bool' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'uint256', name: 'index', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  { inputs: [{ indexed: true, internalType: 'address', name: 'player', type: 'address' }, { indexed: false, internalType: 'uint256', name: 'score', type: 'uint256' }], name: 'ScoreSubmitted', type: 'event' },
] as const
