const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const ARC_RPC_URL = 'https://rpc.testnet.arc.network';

async function testInteractions(privateKey, contractAddress) {
  console.log('\n🧪 Testando interações com o contrato\n');
  
  const provider = new ethers.JsonRpcProvider(ARC_RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  // Load ABI
  const abiPath = path.join(__dirname, '../contract-abi.json');
  let abi;
  
  if (fs.existsSync(abiPath)) {
    abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
  } else {
    // Fallback ABI
    abi = [
      "function interact() public",
      "function getInteractionCount(address) public view returns (uint256)",
      "function batchInteract(uint256) public",
      "function totalInteractions() public view returns (uint256)",
      "event Interaction(address indexed user, uint256 newCount, uint256 total)"
    ];
  }
  
  const contract = new ethers.Contract(contractAddress, abi, wallet);
  
  console.log('📝 Endereço da carteira:', wallet.address);
  console.log('📍 Endereço do contrato:', contractAddress);
  console.log('💰 Saldo:', ethers.formatEther(await provider.getBalance(wallet.address)), 'ETH\n');
  
  // Get current count
  try {
    const currentCount = await contract.getInteractionCount(wallet.address);
    console.log('📊 Interações atuais:', currentCount.toString());
  } catch (e) {
    console.log('⚠️  Não foi possível ler contagem atual');
  }
  
  // Make some interactions
  const numInteractions = parseInt(process.argv[3]) || 3;
  console.log(`\n🔄 Criando ${numInteractions} interação(ões)...\n`);
  
  for (let i = 0; i < numInteractions; i++) {
    try {
      console.log(`   [${i + 1}/${numInteractions}] Enviando transação...`);
      const tx = await contract.interact();
      console.log(`       Hash: ${tx.hash}`);
      
      console.log(`       Aguardando confirmação...`);
      await tx.wait();
      console.log(`       ✅ Confirmada!\n`);
    } catch (error) {
      console.error(`       ❌ Erro: ${error.message}\n`);
    }
  }
  
  // Check final count
  try {
    const finalCount = await contract.getInteractionCount(wallet.address);
    console.log('📊 Interações finais:', finalCount.toString());
    console.log('✅ Teste concluído!\n');
    console.log('🎯 Agora você pode conectar esta carteira na aplicação');
    console.log('   e ver suas estatísticas atualizadas!\n');
  } catch (e) {
    console.log('⚠️  Não foi possível ler contagem final\n');
  }
}

const privateKey = process.env.PRIVATE_KEY || process.argv[2];
const contractAddress = process.argv[3];

if (!privateKey || !contractAddress) {
  console.error('❌ Erro: Parâmetros insuficientes!\n');
  console.log('Uso:');
  console.log('  node scripts/test-interactions.js <PRIVATE_KEY> <CONTRACT_ADDRESS> [NUM_INTERACTIONS]\n');
  console.log('Exemplo:');
  console.log('  node scripts/test-interactions.js 0x123... 0xabc... 5\n');
  process.exit(1);
}

testInteractions(privateKey, contractAddress)
  .catch((error) => {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  });
