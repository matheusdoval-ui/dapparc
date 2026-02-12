/**
 * @file arc-leaderboard.ts
<<<<<<< HEAD
 * @description ABI do contrato ArcLeaderboard
 *
 * Contrato: ArcLeaderboard.sol
 * Métodos: getUsersCount, getUserAt, getScore
=======
 * @description ABI do contrato ArcLeaderboard (addPoints + view)
>>>>>>> 3813cb1 (deploy)
 */

export const ARC_LEADERBOARD_ABI = [
  {
<<<<<<< HEAD
=======
    inputs: [
      { internalType: 'address', name: 'user', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'addPoints',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
>>>>>>> 3813cb1 (deploy)
    inputs: [],
    name: 'getUsersCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'index', type: 'uint256' }],
    name: 'getUserAt',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getScore',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
