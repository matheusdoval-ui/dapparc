/**
 * @file user-operation-helpers.ts
 * @description Funções auxiliares para User Operations (ERC-4337)
 * 
 * Helpers para criar e assinar User Operations manualmente
 */

import { type Address, type Hex, keccak256, encodePacked, toHex } from 'viem'

const ENTRY_POINT_ADDRESS = process.env.NEXT_PUBLIC_ENTRY_POINT_ADDRESS || '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'

/**
 * Calcula o hash de uma User Operation (conforme ERC-4337)
 * @param userOp User Operation
 */
export function getUserOperationHash(userOp: {
  sender: Address
  nonce: bigint
  initCode: Hex
  callData: Hex
  callGasLimit: bigint
  verificationGasLimit: bigint
  preVerificationGas: bigint
  maxFeePerGas: bigint
  maxPriorityFeePerGas: bigint
  paymasterAndData: Hex
}): Hex {
  // Pack user operation
  const packed = encodePacked(
    [
      'address', // sender
      'uint256', // nonce
      'bytes32', // initCode hash
      'bytes32', // callData hash
      'uint256', // callGasLimit
      'uint256', // verificationGasLimit
      'uint256', // preVerificationGas
      'uint256', // maxFeePerGas
      'uint256', // maxPriorityFeePerGas
      'bytes32', // paymasterAndData hash
    ],
    [
      userOp.sender,
      userOp.nonce,
      keccak256(userOp.initCode || '0x'),
      keccak256(userOp.callData || '0x'),
      userOp.callGasLimit,
      userOp.verificationGasLimit,
      userOp.preVerificationGas,
      userOp.maxFeePerGas,
      userOp.maxPriorityFeePerGas,
      keccak256(userOp.paymasterAndData || '0x'),
    ]
  )

  // Hash com EntryPoint e chainId
  const chainId = 5042002n // Arc Testnet
  const entryPointHash = keccak256(
    encodePacked(
      ['bytes32', 'address', 'uint256'],
      [keccak256(packed), ENTRY_POINT_ADDRESS as Address, chainId]
    )
  )

  return entryPointHash
}

/**
 * Formata User Operation para envio via RPC
 */
export function formatUserOperationForRPC(userOp: {
  sender: Address
  nonce: bigint
  initCode?: Hex
  callData: Hex
  callGasLimit: bigint
  verificationGasLimit: bigint
  preVerificationGas: bigint
  maxFeePerGas: bigint
  maxPriorityFeePerGas: bigint
  paymasterAndData?: Hex
  signature?: Hex
}): Record<string, string> {
  return {
    sender: userOp.sender,
    nonce: toHex(userOp.nonce),
    initCode: userOp.initCode || '0x',
    callData: userOp.callData,
    callGasLimit: toHex(userOp.callGasLimit),
    verificationGasLimit: toHex(userOp.verificationGasLimit),
    preVerificationGas: toHex(userOp.preVerificationGas),
    maxFeePerGas: toHex(userOp.maxFeePerGas),
    maxPriorityFeePerGas: toHex(userOp.maxPriorityFeePerGas),
    paymasterAndData: userOp.paymasterAndData || '0x',
    signature: userOp.signature || '0x',
  }
}
