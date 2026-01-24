const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// ARC Testnet Configuration
const ARC_RPC_URL = 'https://rpc.testnet.arc.network';

// Contract addresses
const USDC_CONTRACT = '0x3910B7cbb3341f1F4bF4cEB66e4A2C8f204FE2b8';
const EURC_CONTRACT = '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a';
const DEVELOPER_WALLET = '0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2';

// Contract ABI (minimal for deployment)
const CONTRACT_ABI = [
  "constructor(address _usdc, address _eurc, address _owner)",
  "function payWithUSDC(uint256 amount)",
  "function payWithEURC(uint256 amount)",
  "function checkPayment(address payer) view returns (bool)",
  "function hasPaid(address) view returns (bool)",
  "function MINIMUM_PAYMENT() view returns (uint256)",
  "function totalPayments() view returns (uint256)",
  "event PaymentReceived(address indexed payer, address indexed token, uint256 amount, uint256 timestamp)"
];

// Contract bytecode (will be compiled)
const CONTRACT_BYTECODE = '0x608060405234801561001057600080fd5b506040516...'; // Placeholder - needs actual compilation

async function deployPaymentContract(privateKey) {
  console.log('\n🚀 Deploying LeaderboardPayment contract to ARC Testnet...\n');
  
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
  console.log('   USDC:', USDC_CONTRACT);
  console.log('   EURC:', EURC_CONTRACT);
  console.log('   Owner:', DEVELOPER_WALLET);
  console.log('   Minimum Payment: 0.5 USDC/EURC (500000)\n');
  
  // Note: This is a placeholder - actual deployment requires compiled bytecode
  console.log('⚠️  Note: This script requires compiled bytecode.');
  console.log('💡 To deploy:');
  console.log('   1. Compile LeaderboardPayment.sol using Remix or Hardhat');
  console.log('   2. Get the bytecode from compilation');
  console.log('   3. Update CONTRACT_BYTECODE in this script');
  console.log('   4. Run: node scripts/deploy-payment-contract.js <PRIVATE_KEY>\n');
  
  // For now, show the deployment command structure
  console.log('📋 Deployment command structure:');
  console.log(`
const factory = new ethers.ContractFactory(CONTRACT_ABI, CONTRACT_BYTECODE, wallet);
const contract = await factory.deploy(USDC_CONTRACT, EURC_CONTRACT, DEVELOPER_WALLET);
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
    console.log('Usage: node scripts/deploy-payment-contract.js <PRIVATE_KEY>');
    process.exit(1);
  }
  
  deployPaymentContract(privateKey).catch(console.error);
}

module.exports = { deployPaymentContract };
