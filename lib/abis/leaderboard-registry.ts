/**
 * @file leaderboard-registry.ts
 * @description ABI do contrato LeaderboardRegistry
 * 
 * Contrato: LeaderboardRegistry.sol
 * Função principal: register() - Registra uma carteira no leaderboard
 */

export const LEADERBOARD_REGISTRY_ABI = [
  {
    inputs: [],
    name: 'register',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'wallet',
        type: 'address',
      },
    ],
    name: 'checkRegistration',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'wallet',
        type: 'address',
      },
    ],
    name: 'getRegistrationInfo',
    outputs: [
      {
        internalType: 'bool',
        name: 'registered',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const
