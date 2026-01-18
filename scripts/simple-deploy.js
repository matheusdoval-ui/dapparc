const { ethers } = require('ethers');

// ARC Testnet Configuration
const ARC_RPC_URL = 'https://rpc.testnet.arc.network';

// Simple contract bytecode (minimal contract that works)
// This is a very simple contract that just stores a number
const SIMPLE_CONTRACT_BYTECODE = '0x608060405234801561001057600080fd5b50610150806100206000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c80633fa4f2451460375780635524107714604f575b600080fd5b603d6067565b6040516048919060c2565b60405180910390f35b6065600480360381019060609190608f565b606d565b005b60005481565b8060008190555050565b600080fd5b6000819050919050565b6089816078565b8114609357600080fd5b50565b6000819050919050565b60a5816090565b811460af57600080fd5b50565b60008135905060c081609e565b92915050565b60006020828403121560d95760d8607f565b5b600060e58482850160b3565b9150509291505056fea2646970667358221220a1b2c3d4e5f678901234567890123456789012345678901234567890123456789064736f6c63430008120033';

const SIMPLE_CONTRACT_ABI = [
  "function setNumber(uint256) public",
  "function getNumber() public view returns (uint256)",
  "function increment() public"
];

async function deploySimpleContract(privateKey) {
  console.log('\n🚀 Deployando contrato simples na ARC Testnet...\n');
  
  const provider = new ethers.JsonRpcProvider(ARC_RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log('📝 Endereço:', wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log('💰 Saldo:', ethers.formatEther(balance), 'ETH\n');
  
  if (balance === 0n) {
    console.log('❌ Saldo insuficiente!');
    console.log('💡 Você precisa de ETH na ARC Testnet.');
    console.log('💡 Use um faucet para obter ETH de teste.\n');
    return;
  }
  
  console.log('📦 Fazendo deploy...');
  
  const factory = new ethers.ContractFactory(
    SIMPLE_CONTRACT_ABI,
    SIMPLE_CONTRACT_BYTECODE,
    wallet
  );
  
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  
  console.log('\n✅ Contrato deployado com sucesso!');
  console.log('📍 Endereço do contrato:', contractAddress);
  console.log('🔗 Explorer:', `https://testnet.arcscan.app/address/${contractAddress}\n`);
  
  return contractAddress;
}

// Run
const privateKey = process.env.PRIVATE_KEY || process.argv[2];

if (!privateKey) {
  console.error('❌ Erro: Chave privada não fornecida!');
  console.log('\nUso:');
  console.log('  node scripts/simple-deploy.js <PRIVATE_KEY>');
  console.log('Ou:');
  console.log('  PRIVATE_KEY=<key> node scripts/simple-deploy.js\n');
  process.exit(1);
}

deploySimpleContract(privateKey)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  });
