/**
 * @file deploy-leaderboard.js
 * @description Script para fazer deploy do contrato Leaderboard na Arc Testnet
 * 
 * Uso:
 * node scripts/deploy-leaderboard.js
 * 
 * Requisitos:
 * - PRIVATE_KEY no .env.local
 * - Owner address configurado (padrão: 0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2)
 */

const { ethers } = require('ethers')
require('dotenv').config({ path: '.env.local' })

// Arc Testnet Configuration
const ARC_RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network'
const ARC_CHAIN_ID = 5042002

// Owner address (developer wallet)
const OWNER_ADDRESS = process.env.OWNER_ADDRESS || '0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2'

// Private Key from .env
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0x231c6f6e09937af4ffa4a47cec3bc10c3210ad4486b8e98131c0f2aeacc61d8c'

// Leaderboard Contract ABI (only what we need for deployment)
const LEADERBOARD_ABI = [
  "constructor(address _owner)",
  "function mint() external",
  "function isRegistered(address) external view returns (bool)",
  "function getAllRegisteredUsers() external view returns (address[])",
  "function getTotalUsers() external view returns (uint256)",
  "event NewEntry(address indexed user, uint256 timestamp, uint256 blockNumber, uint256 index)"
]

// Contract bytecode (will be compiled)
const LEADERBOARD_BYTECODE = "0x608060405234801561001057600080fd5b50604051610..."

async function deployLeaderboard() {
  try {
    console.log('🚀 Iniciando deploy do contrato Leaderboard na Arc Testnet...\n')
    
    // Connect to Arc Testnet
    const provider = new ethers.JsonRpcProvider(ARC_RPC_URL)
    
    // Create wallet from private key
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
    
    console.log('📝 Wallet Address:', wallet.address)
    console.log('📍 Network: Arc Testnet (Chain ID:', ARC_CHAIN_ID, ')')
    console.log('👤 Owner Address:', OWNER_ADDRESS)
    
    // Check balance
    const balance = await provider.getBalance(wallet.address)
    console.log('💰 Balance:', ethers.formatEther(balance), 'ETH\n')
    
    if (balance === 0n) {
      throw new Error('Insufficient balance. You need ETH to deploy the contract.')
    }
    
    // Read contract source
    const fs = require('fs')
    const path = require('path')
    const contractPath = path.join(__dirname, '..', 'contracts', 'Leaderboard.sol')
    
    if (!fs.existsSync(contractPath)) {
      throw new Error(`Contract file not found: ${contractPath}`)
    }
    
    console.log('📄 Compilando contrato...')
    
    // For simplicity, we'll use a factory approach
    // In production, use Hardhat or Foundry for compilation
    console.log('⚠️  Nota: Este script requer compilação via Hardhat ou Remix')
    console.log('⚠️  Para deploy direto, use Remix IDE ou compile primeiro com Hardhat\n')
    
    // Contract factory (you'll need to compile first and get bytecode)
    // For now, we'll show the deployment structure
    
    console.log('📋 Estrutura do Deploy:')
    console.log('   1. Compile o contrato Leaderboard.sol')
    console.log('   2. Use o bytecode compilado')
    console.log('   3. Deploy com owner address:', OWNER_ADDRESS)
    console.log('\n💡 Alternativa: Use Remix IDE para deploy direto')
    console.log('   - Acesse: https://remix.ethereum.org')
    console.log('   - Cole o código de contracts/Leaderboard.sol')
    console.log('   - Compile com Solidity 0.8.20+')
    console.log('   - Deploy na Arc Testnet com owner:', OWNER_ADDRESS)
    
    // If you have the compiled bytecode, uncomment below:
    /*
    const LeaderboardFactory = new ethers.ContractFactory(
      LEADERBOARD_ABI,
      LEADERBOARD_BYTECODE,
      wallet
    )
    
    console.log('📦 Fazendo deploy...')
    const leaderboard = await LeaderboardFactory.deploy(OWNER_ADDRESS)
    
    console.log('⏳ Aguardando confirmação...')
    await leaderboard.waitForDeployment()
    
    const contractAddress = await leaderboard.getAddress()
    
    console.log('\n✅ Contrato deployado com sucesso!')
    console.log('📍 Contract Address:', contractAddress)
    console.log('🔗 Explorer:', `https://testnet.arcscan.app/address/${contractAddress}`)
    console.log('\n📝 Adicione ao .env.local:')
    console.log(`NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS=${contractAddress}`)
    console.log(`REGISTRY_CONTRACT_ADDRESS=${contractAddress}`)
    */
    
  } catch (error) {
    console.error('❌ Erro no deploy:', error.message)
    if (error.transaction) {
      console.error('Transaction:', error.transaction)
    }
    process.exit(1)
  }
}

// Run deployment
if (require.main === module) {
  deployLeaderboard()
    .then(() => {
      console.log('\n✅ Script concluído!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Erro fatal:', error)
      process.exit(1)
    })
}

module.exports = { deployLeaderboard }
