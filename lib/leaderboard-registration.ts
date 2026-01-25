/**
 * @file leaderboard-registration.ts
 * @description Funções para verificar e registrar no leaderboard usando Account Abstraction (ERC-4337)
 * 
 * Funcionalidades:
 * - Verificar se endereço está registrado no contrato
 * - Registrar via UserOperation com Paymaster USDC
 * - Usar Private Key do .env para provider
 */

import { JsonRpcProvider, Contract, Wallet } from 'ethers'
import { type Address, type Hex, encodeFunctionData, parseAbi } from 'viem'
import {
  checkIsSmartAccount,
  getSmartAccountNonce,
  createContractCallUserOperation,
  sendUserOperationRPC,
} from './user-operation'

// Arc Testnet Configuration
const ARC_RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network'

// Registry Contract Address
const REGISTRY_CONTRACT_ADDRESS = (
  process.env.REGISTRY_CONTRACT_ADDRESS ||
  process.env.NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS ||
  ''
).toLowerCase()

// Private Key from .env (for provider)
const PRIVATE_KEY = process.env.PRIVATE_KEY || ''

// ABI do contrato LeaderboardRegistry
const REGISTRY_ABI = [
  'function register() external',
  'function isRegistered(address) view returns (bool)',
  'function checkRegistration(address) view returns (bool)',
  'function getRegistrationInfo(address) view returns (bool registered, uint256 timestamp)',
]

/**
 * Verifica se um endereço está registrado no contrato de leaderboard
 * @param walletAddress Endereço da carteira a verificar
 * @returns true se estiver registrado, false caso contrário
 */
export async function checkLeaderboardRegistration(
  walletAddress: string
): Promise<boolean> {
  if (!REGISTRY_CONTRACT_ADDRESS) {
    console.warn('⚠️ Registry contract address not configured')
    return false
  }

  const normalizedAddress = walletAddress.toLowerCase()

  try {
    // Criar provider usando Private Key (se disponível) ou RPC público
    let provider: JsonRpcProvider
    if (PRIVATE_KEY) {
      const wallet = new Wallet(PRIVATE_KEY, new JsonRpcProvider(ARC_RPC_URL))
      provider = wallet.provider as JsonRpcProvider
    } else {
      provider = new JsonRpcProvider(ARC_RPC_URL)
    }

    const contract = new Contract(REGISTRY_CONTRACT_ADDRESS, REGISTRY_ABI, provider)

    // Verificar registro
    const isRegistered = await contract.isRegistered(normalizedAddress)

    console.log(
      `🔍 Registration check for ${normalizedAddress}: ${isRegistered ? '✅ Registered' : '❌ Not registered'}`
    )

    return isRegistered
  } catch (error) {
    console.error(`❌ Error checking registration for ${normalizedAddress}:`, error)
    return false
  }
}

/**
 * Registra uma Smart Account no leaderboard via UserOperation
 * @param smartAccountAddress Endereço da Smart Account
 * @param signerAddress Endereço para assinar (pode ser o mesmo ou owner)
 * @returns Hash da UserOperation
 */
export async function registerLeaderboardViaUserOperation(
  smartAccountAddress: Address,
  signerAddress?: Address
): Promise<Hex> {
  if (!REGISTRY_CONTRACT_ADDRESS) {
    throw new Error('Registry contract address not configured')
  }

  // Verificar se é Smart Account
  const isSA = await checkIsSmartAccount(smartAccountAddress)
  if (!isSA) {
    throw new Error('Address is not a Smart Account')
  }

  // Verificar se já está registrado
  const isRegistered = await checkLeaderboardRegistration(smartAccountAddress)
  if (isRegistered) {
    console.log('✅ Wallet already registered')
    throw new Error('Wallet already registered')
  }

  // Obter nonce
  const nonce = await getSmartAccountNonce(smartAccountAddress)

  // Encodar função register()
  const registerAbi = parseAbi(['function register() external'])
  const functionData = encodeFunctionData({
    abi: registerAbi,
    functionName: 'register',
    args: [],
  })

  // Criar UserOperation
  const userOp = await createContractCallUserOperation(
    smartAccountAddress,
    REGISTRY_CONTRACT_ADDRESS as Address,
    functionData,
    nonce,
    0n, // value = 0
    signerAddress || smartAccountAddress // Usar signerAddress se fornecido, senão usar próprio endereço
  )

  // Enviar UserOperation
  const userOpHash = await sendUserOperationRPC(userOp)

  console.log('✅ Registration UserOperation sent:', userOpHash)

  return userOpHash
}

/**
 * Verifica se endereço específico está conectado e registrado
 * @param connectedAddress Endereço conectado
 * @param targetAddress Endereço alvo para verificar (0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2)
 * @returns true se endereço alvo estiver conectado
 */
export function isTargetAddressConnected(
  connectedAddress: string | null,
  targetAddress: string = '0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2'
): boolean {
  if (!connectedAddress) return false
  return connectedAddress.toLowerCase() === targetAddress.toLowerCase()
}
