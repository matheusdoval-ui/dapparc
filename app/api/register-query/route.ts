import { NextRequest, NextResponse } from 'next/server'
import { JsonRpcProvider, Wallet, Contract } from 'ethers'

// ARC Testnet Configuration
const ARC_RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network'
const ARC_CHAIN_ID = 5042002

// Contract ABI for registerQuery function
const CONTRACT_ABI = [
  "function registerQuery() public",
  "function getInteractionCount(address) public view returns (uint256)",
  "function totalInteractions() public view returns (uint256)"
]

/**
 * API endpoint to register a query as an on-chain transaction
 * POST /api/register-query
 * Body: { address: string, privateKey: string, contractAddress?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, privateKey, contractAddress } = body

    // Validate inputs
    if (!address || !privateKey) {
      return NextResponse.json(
        { error: 'Address and privateKey are required' },
        { status: 400 }
      )
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400 }
      )
    }

    // Validate private key format
    if (!/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
      return NextResponse.json(
        { error: 'Invalid private key format' },
        { status: 400 }
      )
    }

    // Connect to ARC Testnet
    const provider = new JsonRpcProvider(ARC_RPC_URL)
    const wallet = new Wallet(privateKey, provider)

    // Verify wallet address matches
    if (wallet.address.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json(
        { error: 'Address does not match private key' },
        { status: 400 }
      )
    }

    // Check balance
    const balance = await provider.getBalance(address)
    if (balance === 0n) {
      return NextResponse.json(
        { error: 'Insufficient balance. You need ETH to create transactions.' },
        { status: 400 }
      )
    }

    // If contract address is provided, use it; otherwise create a simple transaction
    if (contractAddress && /^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
      try {
        // Call contract's registerQuery function
        const contract = new Contract(contractAddress, CONTRACT_ABI, wallet)
        const tx = await contract.registerQuery()
        
        // Wait for transaction confirmation
        const receipt = await tx.wait()

        return NextResponse.json({
          success: true,
          transactionHash: receipt.hash,
          address: address,
          contractAddress: contractAddress,
          message: 'Query registered as on-chain transaction',
        })
      } catch (contractError: any) {
        console.error('Contract call error:', contractError)
        // Fallback to simple transaction if contract call fails
      }
    }

    // Fallback: Create a simple transaction (sending 0 ETH to self)
    // This creates a transaction on-chain that will be counted
    const tx = await wallet.sendTransaction({
      to: address,
      value: 0n,
    })

    const receipt = await tx.wait()

    return NextResponse.json({
      success: true,
      transactionHash: receipt.hash,
      address: address,
      message: 'Query registered as on-chain transaction (self-transfer)',
    })
  } catch (error) {
    console.error('Error registering query:', error)

    if (error instanceof Error) {
      // Handle specific errors
      if (error.message.includes('insufficient funds') || error.message.includes('balance')) {
        return NextResponse.json(
          { error: 'Insufficient balance. You need ETH to create transactions.' },
          { status: 400 }
        )
      }

      if (error.message.includes('network') || error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'RPC connection failed. Please try again later.' },
          { status: 503 }
        )
      }

      return NextResponse.json(
        { error: error.message || 'Failed to register query' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
