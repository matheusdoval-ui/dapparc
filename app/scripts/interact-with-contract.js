const { ethers } = require('ethers');

const ARC_RPC_URL = 'https://rpc.testnet.arc.network';

async function interactWithContract(privateKey, contractAddress) {
  const provider = new ethers.JsonRpcProvider(ARC_RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  const contractABI = [
    "function increment() public",
    "function getNumber() public view returns (uint256)"
  ];
  
  const contract = new ethers.Contract(contractAddress, contractABI, wallet);
  
  console.log('🔄 Fazendo interação com o contrato...');
  
  const tx = await contract.increment();
  console.log('📝 Transação enviada:', tx.hash);
  
  await tx.wait();
  console.log('✅ Transação confirmada!');
  
  const count = await contract.getNumber();
  console.log('📊 Número atual:', count.toString());
}

const privateKey = process.env.PRIVATE_KEY || process.argv[2];
const contractAddress = process.argv[3];

if (!privateKey || !contractAddress) {
  console.error('Uso: node scripts/interact-with-contract.js <PRIVATE_KEY> <CONTRACT_ADDRESS>');
  process.exit(1);
}

interactWithContract(privateKey, contractAddress)
  .catch(console.error);
