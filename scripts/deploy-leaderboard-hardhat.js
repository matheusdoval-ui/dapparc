/**
 * @file deploy-leaderboard-hardhat.js
 * @description Script Hardhat para fazer deploy do contrato Leaderboard na Arc Testnet
 * 
 * COMANDO EXATO PARA EXECUTAR:
 * npx hardhat run scripts/deploy-leaderboard-hardhat.js --network arcTestnet
 * 
 * Requisitos:
 * - hardhat.config.js configurado
 * - PRIVATE_KEY no .env.local
 * - Contrato compilado (npx hardhat compile)
 */

const hre = require("hardhat");

async function main() {
  console.log('🚀 Deploy do contrato Leaderboard na Arc Testnet\n')
  
  // Owner address
  const OWNER_ADDRESS = '0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2'
  
  // Get signer (wallet from PRIVATE_KEY in hardhat.config.js)
  const [deployer] = await hre.ethers.getSigners()
  
  console.log('📝 Deploying with account:', deployer.address)
  console.log('👤 Owner Address:', OWNER_ADDRESS)
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address)
  console.log('💰 Account balance:', hre.ethers.formatEther(balance), 'ETH\n')
  
  if (balance === 0n) {
    throw new Error('❌ Saldo insuficiente. Você precisa de ETH para fazer o deploy.')
  }
  
  // Get contract factory
  const Leaderboard = await hre.ethers.getContractFactory("Leaderboard")
  
  console.log('📦 Fazendo deploy do contrato...')
  const leaderboard = await Leaderboard.deploy(OWNER_ADDRESS)
  
  console.log('⏳ Aguardando confirmação...')
  await leaderboard.waitForDeployment()
  
  const contractAddress = await leaderboard.getAddress()
  
  console.log('\n✅ Contrato deployado com sucesso!')
  console.log('📍 Contract Address:', contractAddress)
  console.log('🔗 Explorer:', `https://testnet.arcscan.app/address/${contractAddress}`)
  console.log('\n📝 ADICIONE AO .env.local:')
  console.log(`NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS=${contractAddress}`)
  console.log(`REGISTRY_CONTRACT_ADDRESS=${contractAddress}`)
  console.log('\n📝 OU configure na Vercel:')
  console.log('   Settings > Environment Variables')
  console.log(`   NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS = ${contractAddress}`)
  console.log(`   REGISTRY_CONTRACT_ADDRESS = ${contractAddress}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro no deploy:', error)
    process.exit(1)
  })
