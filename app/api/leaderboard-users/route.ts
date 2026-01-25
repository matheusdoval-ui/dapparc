/**
 * @file route.ts
 * @description API endpoint para listar usuários registrados no contrato Leaderboard
 * Filtra eventos NewEntry do contrato para listar usuários
 */

import { NextRequest, NextResponse } from 'next/server'
import { JsonRpcProvider, Contract } from 'ethers'
import { LEADERBOARD_ABI } from '@/lib/abis/leaderboard'

// Arc Testnet Configuration
const ARC_RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network'

// Registry Contract Address
const REGISTRY_CONTRACT_ADDRESS = (
  process.env.REGISTRY_CONTRACT_ADDRESS ||
  process.env.NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS ||
  ''
)

interface LeaderboardUser {
  address: string
  timestamp: number
  blockNumber: number
  index: number
}

/**
 * GET /api/leaderboard-users
 * Lista todos os usuários registrados no contrato Leaderboard
 * Filtra eventos NewEntry do contrato
 */
export async function GET(request: NextRequest) {
  try {
    if (!REGISTRY_CONTRACT_ADDRESS) {
      return NextResponse.json(
        { 
          error: 'Registry contract address not configured',
          users: [],
          total: 0
        },
        { status: 200 } // Return empty list instead of error
      )
    }

    const provider = new JsonRpcProvider(ARC_RPC_URL)
    const contract = new Contract(REGISTRY_CONTRACT_ADDRESS, LEADERBOARD_ABI, provider)

    // Get total users
    let totalUsers = 0
    try {
      totalUsers = Number(await contract.getTotalUsers())
    } catch (error) {
      console.warn('Could not get total users:', error)
    }

    // Get all registered users from array
    const users: LeaderboardUser[] = []
    
    try {
      // Method 1: Get all users from array (if contract supports it)
      const allUsers = await contract.getAllRegisteredUsers()
      
      for (let i = 0; i < allUsers.length; i++) {
        const address = allUsers[i]
        try {
          const info = await contract.getRegistrationInfo(address)
          users.push({
            address: address.toLowerCase(),
            timestamp: Number(info.timestamp) * 1000, // Convert to milliseconds
            blockNumber: 0, // Not available from getRegistrationInfo
            index: Number(info.index),
          })
        } catch (error) {
          console.warn(`Could not get info for user ${address}:`, error)
        }
      }
    } catch (error) {
      console.warn('Could not get all users from array, trying events:', error)
      
      // Method 2: Filter events (fallback)
      try {
        const currentBlock = await provider.getBlockNumber()
        const fromBlock = Math.max(0, currentBlock - 10000) // Last ~10k blocks
        
        const filter = contract.filters.NewEntry()
        const events = await contract.queryFilter(filter, fromBlock, 'latest')
        
        for (const event of events) {
          if (event.args) {
            users.push({
              address: event.args.user.toLowerCase(),
              timestamp: Number(event.args.timestamp) * 1000,
              blockNumber: Number(event.args.blockNumber),
              index: Number(event.args.index),
            })
          }
        }
        
        // Sort by index
        users.sort((a, b) => a.index - b.index)
      } catch (eventError) {
        console.error('Could not filter events:', eventError)
      }
    }

    // Sort by timestamp (newest first) or index
    users.sort((a, b) => {
      if (a.timestamp && b.timestamp) {
        return b.timestamp - a.timestamp // Newest first
      }
      return a.index - b.index // Fallback to index
    })

    return NextResponse.json({
      success: true,
      users,
      total: users.length,
      contractAddress: REGISTRY_CONTRACT_ADDRESS,
    })
  } catch (error) {
    console.error('Error fetching leaderboard users:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: error.message || 'Failed to fetch leaderboard users',
          users: [],
          total: 0
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        users: [],
        total: 0
      },
      { status: 500 }
    )
  }
}
