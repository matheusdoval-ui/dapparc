/**
 * @file route.ts
 * @description API endpoint para listar usuários registrados no contrato Leaderboard
 * Suporta ArcLeaderboard (getUsersCount/getUserAt/getScore) e Leaderboard (getAllRegisteredUsers)
 */

import { NextRequest, NextResponse } from 'next/server'
import { JsonRpcProvider, Contract } from 'ethers'
import { LEADERBOARD_FULL_ABI } from '@/lib/abis/leaderboard-full'
import { ARC_LEADERBOARD_ABI } from '@/lib/abis/arc-leaderboard'

// Arc Testnet Configuration
const ARC_RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network'

const ARC_LEADERBOARD_ADDRESS = '0x7461Fc5EAf38693e98B06B042e37b4adF1453AbD'

// Registry Contract Address (legacy / alternate)
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
  score?: number
}

/**
 * GET /api/leaderboard-users
 * Lista usuários do ArcLeaderboard (getUsersCount/getUserAt/getScore) ou do Leaderboard (getAllRegisteredUsers)
 */
export async function GET(request: NextRequest) {
  try {
    const provider = new JsonRpcProvider(ARC_RPC_URL)
    const users: LeaderboardUser[] = []

    // 1) Try ArcLeaderboard (addPoints contract): getUsersCount, getUserAt, getScore
    try {
      const arcContract = new Contract(ARC_LEADERBOARD_ADDRESS, ARC_LEADERBOARD_ABI, provider)
      const count = Number(await arcContract.getUsersCount())
      for (let i = 0; i < count; i++) {
        const address = await arcContract.getUserAt(i)
        const score = await arcContract.getScore(address)
        users.push({
          address: String(address).toLowerCase(),
          timestamp: Date.now(), // ArcLeaderboard doesn't expose timestamp
          blockNumber: 0,
          index: i,
          score: Number(score),
        })
      }
      if (users.length > 0) {
        return NextResponse.json({
          success: true,
          users,
          total: users.length,
          contractAddress: ARC_LEADERBOARD_ADDRESS,
        })
      }
    } catch (arcError) {
      console.warn('ArcLeaderboard read failed (may be empty or not deployed):', arcError)
    }

    // 2) Fallback: Registry / Leaderboard contract (getAllRegisteredUsers)
    if (!REGISTRY_CONTRACT_ADDRESS) {
      return NextResponse.json({
        success: true,
        users,
        total: users.length,
        contractAddress: ARC_LEADERBOARD_ADDRESS,
      })
    }

    const contract = new Contract(REGISTRY_CONTRACT_ADDRESS, LEADERBOARD_FULL_ABI, provider)
    let totalUsers = 0
    try {
      totalUsers = Number(await contract.getTotalUsers())
    } catch (error) {
      console.warn('Could not get total users:', error)
    }

    try {
      const allUsers = await contract.getAllRegisteredUsers()
      for (let i = 0; i < allUsers.length; i++) {
        const address = allUsers[i]
        try {
          const info = await contract.getRegistrationInfo(address)
          users.push({
            address: address.toLowerCase(),
            timestamp: Number(info.timestamp) * 1000,
            blockNumber: 0,
            index: Number(info.index),
          })
        } catch (error) {
          console.warn(`Could not get info for user ${address}:`, error)
        }
      }
    } catch (error) {
      console.warn('Could not get all users from array, trying events:', error)
      try {
        const currentBlock = await provider.getBlockNumber()
        const fromBlock = Math.max(0, currentBlock - 10000)
        const filter = contract.filters.NewEntry()
        const events = await contract.queryFilter(filter, fromBlock, 'latest')
        for (const event of events) {
          if (event.args && event.args[0]) {
            const userAddress = event.args[0].toLowerCase()
            if (!users.find(u => u.address === userAddress)) {
              const block = event.blockNumber ? await provider.getBlock(event.blockNumber) : null
              users.push({
                address: userAddress,
                timestamp: block ? Number(block.timestamp) * 1000 : Date.now(),
                blockNumber: event.blockNumber || 0,
                index: users.length,
              })
            }
          }
        }
        users.sort((a, b) => (a.blockNumber && b.blockNumber ? a.blockNumber - b.blockNumber : a.index - b.index))
      } catch (eventError) {
        console.error('Could not filter events:', eventError)
      }
    }

    users.sort((a, b) => {
      if (a.timestamp && b.timestamp) return b.timestamp - a.timestamp
      return a.index - b.index
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
