const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// ARC Testnet Configuration
const ARC_RPC_URL = 'https://rpc.testnet.arc.network';

// Developer wallet address (owner)
const DEVELOPER_WALLET = '0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2';

// Contract ABI (minimal for deployment)
const CONTRACT_ABI = [
  "constructor(address _owner)",
  "function register()",
  "function isRegistered(address) view returns (bool)",
  "function checkRegistration(address) view returns (bool)",
  "function getRegistrationInfo(address) view returns (bool, uint256)",
  "function totalRegistrations() view returns (uint256)",
  "event WalletRegistered(address indexed wallet, uint256 timestamp, uint256 blockNumber)"
];

// Contract bytecode (will be compiled)
const CONTRACT_BYTECODE = '0x608060405234801561001057600080fd5b506040516...'; // Placeholder - needs actual compilation

async function deployRegistryContract(privateKey) {
  console.log('\n🚀 Deploying LeaderboardRegistry contract to ARC Testnet...\n');
  
  const provider = new ethers.JsonRpcProvider(ARC_RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log('📝 Deployer address:', wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log('💰 Balance:', ethers.formatEther(balance), 'ETH\n');
  
  if (balance === 0n) {
    console.log('❌ Insufficient balance!');
    console.log('💡 You need ETH on ARC Testnet to deploy.');
    return;
  }
  
  console.log('📦 Contract parameters:');
  console.log('   Owner:', DEVELOPER_WALLET);
  console.log('   Function: register() - Simple on-chain action\n');
  
  // Note: This is a placeholder - actual deployment requires compiled bytecode
  console.log('⚠️  Note: This script requires compiled bytecode.');
  console.log('💡 To deploy:');
  console.log('   1. Compile LeaderboardRegistry.sol using Remix or Hardhat');
  console.log('   2. Get the bytecode from compilation');
  console.log('   3. Update CONTRACT_BYTECODE in this script');
  console.log('   4. Run: node scripts/deploy-registry-contract.js <PRIVATE_KEY>\n');
  
  // For now, show the deployment command structure
  console.log('📋 Deployment command structure:');
  console.log(`
const factory = new ethers.ContractFactory(CONTRACT_ABI, CONTRACT_BYTECODE, wallet);
const contract = await factory.deploy(DEVELOPER_WALLET);
await contract.waitForDeployment();
const contractAddress = await contract.getAddress();
console.log('✅ Contract deployed:', contractAddress);
  `);
}

// Run if called directly
if (require.main === module) {
  const privateKey = process.env.PRIVATE_KEY || process.argv[2];
  
  if (!privateKey) {
    console.error('❌ Private key required!');
    console.log('Usage: node scripts/deploy-registry-contract.js <PRIVATE_KEY>');
    process.exit(1);
  }
  
  deployRegistryContract(privateKey).catch(console.error);
}

module.exports = { deployRegistryContract };
