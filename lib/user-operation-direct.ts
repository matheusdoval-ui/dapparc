/**
 * @file user-operation-direct.ts
 * @description UserOperation com callData direto (sem execute()) para chamar register() do contrato
 * 
 * Esta versão envia o callData diretamente para o contrato, sem passar por execute()
 * O Raw input será a chamada do register() codificada
 */

import { type Address, type Hex, encodeFunctionData, parseAbi } from 'viem'
import { getGasPrices, getPaymasterData, signUserOperation, sendUserOperationRPC } from './user-operation'
import type { UserOperation } from './user-operation'

// Arc Testnet Configuration
const ARC_RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network'
const ARC_CHAIN_ID = 5042002

// Configuração do Bundler e Paymaster
const BUNDLER_URL = process.env.NEXT_PUBLIC_BUNDLER_URL || ARC_RPC_URL
const PAYMASTER_URL = process.env.NEXT_PUBLIC_PAYMASTER_URL || ''
const PAYMASTER_ADDRESS = process.env.NEXT_PUBLIC_PAYMASTER_ADDRESS || ''
const ENTRY_POINT_ADDRESS = process.env.NEXT_PUBLIC_ENTRY_POINT_ADDRESS || '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'

// Registry Contract Address
const REGISTRY_CONTRACT_ADDRESS = (
  process.env.REGISTRY_CONTRACT_ADDRESS ||
  process.env.NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS ||
  ''
).toLowerCase()

/**
 * Cria uma UserOperation que chama register() diretamente no contrato
 * O callData será a chamada do register() codificada (não 0x)
 * 
 * IMPORTANTE: Para Smart Accounts, o callData precisa chamar execute() da Smart Account
 * que por sua vez chama o contrato. O Raw input mostrará execute(), mas internamente
 * conterá a chamada do register().
 * 
 * @param senderAddress Endereço da Smart Account
 * @param nonce Nonce da Smart Account
 * @param signerAddress Endereço para assinar
 */
export async function createRegisterUserOperation(
  senderAddress: Address,
  nonce: bigint,
  signerAddress?: Address
): Promise<Partial<UserOperation>> {
  if (!REGISTRY_CONTRACT_ADDRESS) {
    throw new Error('Registry contract address not configured')
  }

  // Para Smart Accounts ERC-4337, precisamos usar execute() para chamar o contrato
  // O callData será: execute(registryContractAddress, 0, register() encoded)
  // Isso garantirá que a transação vá para o contrato, não para o próprio endereço
  
  // Primeiro, encodar função mint() do contrato Leaderboard
  // O contrato Leaderboard usa mint() em vez de register()
  const mintAbi = parseAbi(['function mint() external'])
  const mintCallData = encodeFunctionData({
    abi: mintAbi,
    functionName: 'mint',
    args: [],
  })
  
  // Depois, encodar execute() da Smart Account com o contrato como destino
  // O Raw input mostrará execute(), mas internamente conterá mint()
  const executeAbi = parseAbi([
    'function execute(address to, uint256 value, bytes calldata data) external',
  ])
  const callData = encodeFunctionData({
    abi: executeAbi,
    functionName: 'execute',
    args: [REGISTRY_CONTRACT_ADDRESS as Address, 0n, mintCallData], // to = contrato, value = 0, data = mint()
  })

  console.log('📝 CallData gerado usando encodeFunctionData:')
  console.log('  - execute(contrato, 0, mint())')
  console.log('  - CallData completo:', callData)
  console.log('📍 Contrato destino (to no execute):', REGISTRY_CONTRACT_ADDRESS)
  console.log('📋 Mint() callData interno:', mintCallData)
  console.log('✅ Transação será enviada para o contrato, não para próprio endereço')
  console.log('✅ Raw input será preenchido (não será 0x)')

  // Obter gas prices
  const gasPrices = await getGasPrices()

  const userOp: Partial<UserOperation> = {
    sender: senderAddress,
    nonce,
    initCode: '0x' as Hex,
    callData, // CallData direto do register() - não será 0x
    callGasLimit: 100000n, // Gas para chamada de contrato
    verificationGasLimit: 100000n,
    preVerificationGas: 21000n,
    maxFeePerGas: gasPrices.maxFeePerGas,
    maxPriorityFeePerGas: gasPrices.maxPriorityFeePerGas,
    paymasterAndData: '0x' as Hex,
    signature: '0x' as Hex,
  }

  // Obter dados do Paymaster - GARANTE PAGAMENTO EM USDC
  if (PAYMASTER_URL && PAYMASTER_ADDRESS) {
    userOp.paymasterAndData = await getPaymasterData(userOp)
    console.log('✅ Paymaster USDC configurado - Taxas serão pagas em USDC')
  } else {
    console.warn('⚠️ Paymaster não configurado - Taxas serão pagas em ETH')
  }

  // Assinar se signerAddress fornecido
  if (signerAddress) {
    userOp.signature = await signUserOperation(userOp, signerAddress)
  }

  return userOp
}

/**
 * Envia UserOperation de registro diretamente
 * @param senderAddress Endereço da Smart Account
 * @param signerAddress Endereço para assinar
 */
export async function sendRegisterUserOperation(
  senderAddress: Address,
  signerAddress?: Address
): Promise<Hex> {
  const { getSmartAccountNonce } = await import('./user-operation')
  
  // Obter nonce
  const nonce = await getSmartAccountNonce(senderAddress)

  // Criar UserOperation com callData do register()
  const userOp = await createRegisterUserOperation(
    senderAddress,
    nonce,
    signerAddress || senderAddress
  )

  // Enviar UserOperation
  const userOpHash = await sendUserOperationRPC(userOp)

  console.log('✅ Register UserOperation enviada:', userOpHash)
  console.log('📝 CallData usado:', userOp.callData)

  return userOpHash
}
