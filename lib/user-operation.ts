/**
 * @file user-operation.ts
 * @description Funções para enviar User Operations (ERC-4337) na Arc Testnet
 * 
 * Suporta:
 * - Smart Accounts com Paymaster USDC
 * - callData vazio (0x) = check-in simples
 * - Chamadas de contrato reais
 */

import { type Address, type Hex, encodeFunctionData, parseAbi } from 'viem'

// Arc Testnet Configuration
const ARC_RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network'
const ARC_CHAIN_ID = 5042002

// Configuração do Bundler e Paymaster
const BUNDLER_URL = process.env.NEXT_PUBLIC_BUNDLER_URL || ARC_RPC_URL
const PAYMASTER_URL = process.env.NEXT_PUBLIC_PAYMASTER_URL || ''
const PAYMASTER_ADDRESS = process.env.NEXT_PUBLIC_PAYMASTER_ADDRESS || ''
const ENTRY_POINT_ADDRESS = process.env.NEXT_PUBLIC_ENTRY_POINT_ADDRESS || '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'

/**
 * Interface para User Operation (ERC-4337)
 */
export interface UserOperation {
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
  signature: Hex
}

/**
 * Envia uma User Operation via RPC
 * @param userOp User Operation a enviar (deve estar assinada)
 */
export async function sendUserOperationRPC(userOp: Partial<UserOperation>): Promise<Hex> {
  // Formatar User Operation para RPC
  const formattedUserOp: Record<string, string> = {
    sender: userOp.sender!,
    nonce: `0x${userOp.nonce!.toString(16)}`,
    initCode: userOp.initCode || '0x',
    callData: userOp.callData || '0x',
    callGasLimit: `0x${userOp.callGasLimit!.toString(16)}`,
    verificationGasLimit: `0x${userOp.verificationGasLimit!.toString(16)}`,
    preVerificationGas: `0x${userOp.preVerificationGas!.toString(16)}`,
    maxFeePerGas: `0x${userOp.maxFeePerGas!.toString(16)}`,
    maxPriorityFeePerGas: `0x${userOp.maxPriorityFeePerGas!.toString(16)}`,
    paymasterAndData: userOp.paymasterAndData || '0x',
    signature: userOp.signature || '0x',
  }

  const response = await fetch(BUNDLER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_sendUserOperation',
      params: [formattedUserOp, ENTRY_POINT_ADDRESS],
    }),
  })

  const data = await response.json()

  if (data.error) {
    throw new Error(`User Operation failed: ${data.error.message || JSON.stringify(data.error)}`)
  }

  return data.result as Hex
}

/**
 * Obtém informações do Paymaster para uma User Operation
 * @param userOp User Operation (sem signature ainda)
 */
export async function getPaymasterData(userOp: Partial<UserOperation>): Promise<Hex> {
  if (!PAYMASTER_URL || !PAYMASTER_ADDRESS) {
    return '0x' as Hex
  }

  try {
    // Formatar User Operation para Paymaster
    const formattedUserOp: Record<string, string> = {
      sender: userOp.sender!,
      nonce: `0x${userOp.nonce!.toString(16)}`,
      initCode: userOp.initCode || '0x',
      callData: userOp.callData || '0x',
      callGasLimit: `0x${userOp.callGasLimit!.toString(16)}`,
      verificationGasLimit: `0x${userOp.verificationGasLimit!.toString(16)}`,
      preVerificationGas: `0x${userOp.preVerificationGas!.toString(16)}`,
      maxFeePerGas: `0x${userOp.maxFeePerGas!.toString(16)}`,
      maxPriorityFeePerGas: `0x${userOp.maxPriorityFeePerGas!.toString(16)}`,
      paymasterAndData: '0x',
      signature: '0x', // Sem signature ainda
    }

    const response = await fetch(PAYMASTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'pm_sponsorUserOperation',
        params: [formattedUserOp, { chainId: ARC_CHAIN_ID }],
      }),
    })

    const data = await response.json()

    if (data.error) {
      console.warn('Paymaster error:', data.error)
      return '0x' as Hex
    }

    // Retornar paymasterAndData (formato: paymasterAddress + validUntil + validAfter + signature)
    return (data.result?.paymasterAndData || '0x') as Hex
  } catch (error) {
    console.warn('Erro ao obter dados do Paymaster:', error)
    return '0x' as Hex
  }
}

/**
 * Assina uma User Operation usando MetaMask
 * @param userOp User Operation (sem signature)
 * @param userAddress Endereço do usuário (para assinar)
 */
export async function signUserOperation(
  userOp: Partial<UserOperation>,
  userAddress: Address
): Promise<Hex> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask não encontrado')
  }

  try {
    // Calcular hash da User Operation
    const { getUserOperationHash } = await import('@/lib/user-operation-helpers')
    const userOpHash = getUserOperationHash(userOp as any)

    // Assinar hash usando MetaMask (eth_sign)
    const signature = await window.ethereum.request({
      method: 'eth_sign',
      params: [userAddress, userOpHash],
    })

    return signature as Hex
  } catch (error: any) {
    // Se eth_sign falhar, tentar personal_sign
    if (error.code === -32602 || error.message?.includes('eth_sign')) {
      const { getUserOperationHash } = await import('@/lib/user-operation-helpers')
      const userOpHash = getUserOperationHash(userOp as any)
      
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [userOpHash, userAddress],
      })
      
      return signature as Hex
    }
    throw error
  }
}

/**
 * Cria uma User Operation de check-in (callData vazio)
 * @param senderAddress Endereço da Smart Account
 * @param nonce Nonce da Smart Account
 * @param signerAddress Endereço para assinar (opcional, se não fornecido, não assina)
 */
export async function createCheckInUserOperation(
  senderAddress: Address,
  nonce: bigint,
  signerAddress?: Address
): Promise<Partial<UserOperation>> {
  // Check-in: enviar para o próprio endereço com callData vazio
  const callData = '0x' as Hex

  // Obter gas prices
  const gasPrices = await getGasPrices()

  const userOp: Partial<UserOperation> = {
    sender: senderAddress,
    nonce,
    initCode: '0x' as Hex, // Sem initCode (Smart Account já existe)
    callData,
    callGasLimit: 21000n, // Gas mínimo
    verificationGasLimit: 100000n,
    preVerificationGas: 21000n,
    maxFeePerGas: gasPrices.maxFeePerGas,
    maxPriorityFeePerGas: gasPrices.maxPriorityFeePerGas,
    paymasterAndData: '0x' as Hex,
    signature: '0x' as Hex,
  }

  // Obter dados do Paymaster (se configurado)
  if (PAYMASTER_URL && PAYMASTER_ADDRESS) {
    userOp.paymasterAndData = await getPaymasterData(userOp)
  }

  // Assinar se signerAddress fornecido
  if (signerAddress) {
    userOp.signature = await signUserOperation(userOp, signerAddress)
  }

  return userOp
}

/**
 * Cria uma User Operation para chamar uma função de contrato
 * @param senderAddress Endereço da Smart Account
 * @param contractAddress Endereço do contrato
 * @param functionData Dados da função (ABI encoded)
 * @param nonce Nonce da Smart Account
 * @param value Valor em wei (opcional)
 * @param signerAddress Endereço para assinar (opcional)
 */
export async function createContractCallUserOperation(
  senderAddress: Address,
  contractAddress: Address,
  functionData: Hex,
  nonce: bigint,
  value: bigint = 0n,
  signerAddress?: Address
): Promise<Partial<UserOperation>> {
  // Criar callData para chamar o contrato
  // Para Smart Accounts, precisamos usar execute() ou executeBatch()
  // Assumindo que a Smart Account tem execute(address, uint256, bytes)
  const { encodeFunctionData, parseAbi } = await import('viem')
  
  const executeAbi = parseAbi([
    'function execute(address to, uint256 value, bytes calldata data) external',
  ])

  const callData = encodeFunctionData({
    abi: executeAbi,
    functionName: 'execute',
    args: [contractAddress, value, functionData],
  })

  const gasPrices = await getGasPrices()

  const userOp: Partial<UserOperation> = {
    sender: senderAddress,
    nonce,
    initCode: '0x' as Hex,
    callData,
    callGasLimit: 100000n, // Estimativa para chamada de contrato
    verificationGasLimit: 100000n,
    preVerificationGas: 21000n,
    maxFeePerGas: gasPrices.maxFeePerGas,
    maxPriorityFeePerGas: gasPrices.maxPriorityFeePerGas,
    paymasterAndData: '0x' as Hex,
    signature: '0x' as Hex,
  }

  // Obter dados do Paymaster
  if (PAYMASTER_URL && PAYMASTER_ADDRESS) {
    userOp.paymasterAndData = await getPaymasterData(userOp)
  }

  // Assinar se signerAddress fornecido
  if (signerAddress) {
    userOp.signature = await signUserOperation(userOp, signerAddress)
  }

  return userOp
}

/**
 * Obtém preços de gas atuais
 */
async function getGasPrices(): Promise<{
  maxFeePerGas: bigint
  maxPriorityFeePerGas: bigint
}> {
  try {
    const response = await fetch(ARC_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_gasPrice',
        params: [],
      }),
    })

    const data = await response.json()
    const gasPrice = BigInt(data.result || '0x0')

    return {
      maxFeePerGas: gasPrice,
      maxPriorityFeePerGas: gasPrice / 2n,
    }
  } catch {
    // Valores padrão
    return {
      maxFeePerGas: 1000000000n, // 1 gwei
      maxPriorityFeePerGas: 500000000n, // 0.5 gwei
    }
  }
}

/**
 * Verifica se um endereço é uma Smart Account
 * @param address Endereço a verificar
 */
export async function checkIsSmartAccount(address: Address): Promise<boolean> {
  try {
    const response = await fetch(ARC_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getCode',
        params: [address, 'latest'],
      }),
    })

    const data = await response.json()
    const code = data.result

    // Smart Accounts são contratos (têm código)
    return code !== undefined && code !== null && code !== '0x' && code !== '0x0'
  } catch {
    return false
  }
}

/**
 * Obtém o nonce de uma Smart Account
 * @param address Endereço da Smart Account
 */
export async function getSmartAccountNonce(address: Address): Promise<bigint> {
  try {
    // Tentar obter nonce via bundler (método padrão ERC-4337)
    const response = await fetch(BUNDLER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getUserOperationCount',
        params: [address, ENTRY_POINT_ADDRESS],
      }),
    })

    const data = await response.json()

    if (data.error || !data.result) {
      throw new Error('Bundler não suporta getUserOperationCount')
    }

    return BigInt(data.result || '0x0')
  } catch (error) {
    // Fallback: usar transaction count (pode não ser preciso para Smart Accounts)
    console.warn('Usando fallback para nonce:', error)
    const txCountResponse = await fetch(ARC_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getTransactionCount',
        params: [address, 'latest'],
      }),
    })

    const txCountData = await txCountResponse.json()
    return BigInt(txCountData.result || '0x0')
  }
}
