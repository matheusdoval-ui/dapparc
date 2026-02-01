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

// Arc Testnet Configuration — Arc does NOT support ENS (ensAddress: null)
const ARC_RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network'
const ARC_NETWORK = { name: 'arc', chainId: 5042002, ensAddress: null as string | null }

function getRegistryAddress(): string | null {
  const raw =
    process.env.REGISTRY_CONTRACT_ADDRESS ||
    process.env.NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS ||
    ''
  const address = raw.trim().toLowerCase()
  if (!address || !address.startsWith('0x')) return null
  return address
}

const REGISTRY_CONTRACT_ADDRESS = getRegistryAddress()

// Private Key from .env (for provider)
// Usar a Private Key fornecida ou do .env
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0x231c6f6e09937af4ffa4a47cec3bc10c3210ad4486b8e98131c0f2aeacc61d8c'

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
    // Arc does not support ENS — use network config with ensAddress: null
    const provider = new JsonRpcProvider(ARC_RPC_URL, ARC_NETWORK)
    const resolvedProvider = PRIVATE_KEY
      ? new Wallet(PRIVATE_KEY, provider).provider as JsonRpcProvider
      : provider

    const contract = new Contract(REGISTRY_CONTRACT_ADDRESS!, REGISTRY_ABI, resolvedProvider)

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

  // Usar função direta que cria callData do register() (não 0x)
  const { sendRegisterUserOperation } = await import('./user-operation-direct')
  
  // Enviar UserOperation diretamente com callData do register()
  const userOpHash = await sendRegisterUserOperation(
    smartAccountAddress,
    signerAddress || smartAccountAddress
  )

  console.log('✅ Registration UserOperation sent with register() callData:', userOpHash)

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
