const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const solc = require('solc');

// ARC Testnet Configuration
const ARC_RPC_URL = 'https://rpc.testnet.arc.network';
const ARC_CHAIN_ID = 5042002;

async function compileContract() {
  console.log('📦 Compilando contrato...\n');
  
  const contractPath = path.join(__dirname, '../contracts/InteractionCounter.sol');
  const source = fs.readFileSync(contractPath, 'utf8');
  
  const input = {
    language: 'Solidity',
    sources: {
      'InteractionCounter.sol': {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode'],
        },
      },
    },
  };
  
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  
  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error');
    if (errors.length > 0) {
      console.error('❌ Erros de compilação:');
      errors.forEach(error => console.error('  ', error.message));
      throw new Error('Falha na compilação');
    }
  }
  
  const contract = output.contracts['InteractionCounter.sol']['InteractionCounter'];
  
  return {
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object,
  };
}

async function deployContract(privateKey) {
  try {
    console.log('🚀 Iniciando deploy do contrato InteractionCounter\n');
    console.log('🌐 Rede: ARC Testnet');
    console.log('🔗 RPC:', ARC_RPC_URL);
    console.log('📋 Chain ID:', ARC_CHAIN_ID, '\n');
    
    // Connect to ARC Testnet
    const provider = new ethers.JsonRpcProvider(ARC_RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log('📝 Endereço do deployer:', wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    const balanceEth = ethers.formatEther(balance);
    console.log('💰 Saldo:', balanceEth, 'ETH\n');
    
    if (balance === 0n) {
      console.log('❌ Saldo insuficiente!');
      console.log('💡 Você precisa de ETH na ARC Testnet para fazer o deploy.');
      console.log('💡 Use um faucet ou transfira ETH de teste.\n');
      return null;
    }
    
    // Compile contract
    const { abi, bytecode } = await compileContract();
    console.log('✅ Contrato compilado com sucesso!\n');
    
    // Deploy contract
    console.log('📤 Fazendo deploy...');
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy();
    
    console.log('⏳ Aguardando confirmação...');
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ CONTRATO DEPLOYADO COM SUCESSO!');
    console.log('='.repeat(50));
    console.log('📍 Endereço do contrato:');
    console.log(`   ${contractAddress}`);
    console.log('\n🔗 Explorer:');
    console.log(`   https://testnet.arcscan.app/address/${contractAddress}`);
    console.log('\n📋 ABI (salvo em contract-abi.json):');
    
    // Save ABI to file
    const abiPath = path.join(__dirname, '../contract-abi.json');
    fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
    console.log(`   ${abiPath}`);
    
    console.log('\n🎯 Próximos passos:');
    console.log('   1. Importe sua carteira no MetaMask/Rabby');
    console.log('   2. Conecte à ARC Testnet (Chain ID: 5042002)');
    console.log('   3. Use o contrato para criar interações');
    console.log('   4. Teste na aplicação!\n');
    
    return {
      contractAddress,
      abi,
      deployer: wallet.address,
    };
  } catch (error) {
    console.error('\n❌ Erro durante o deploy:');
    console.error('   ', error.message);
    
    if (error.message.includes('insufficient funds')) {
      console.error('\n💡 Você precisa de mais ETH na ARC Testnet.');
    } else if (error.message.includes('network')) {
      console.error('\n💡 Verifique sua conexão com a ARC Testnet.');
    }
    
    throw error;
  }
}

// Main execution
const privateKey = process.env.PRIVATE_KEY || process.argv[2];

if (!privateKey) {
  console.error('❌ Erro: Chave privada não fornecida!\n');
  console.log('Uso:');
  console.log('  node scripts/full-deploy.js <PRIVATE_KEY>');
  console.log('\nOu usando variável de ambiente:');
  console.log('  PRIVATE_KEY=<sua_chave_privada> node scripts/full-deploy.js\n');
  console.log('💡 Gere uma nova carteira primeiro:');
  console.log('   node scripts/generate-wallet.js\n');
  process.exit(1);
}

deployContract(privateKey)
  .then((result) => {
    if (result) {
      console.log('✅ Deploy concluído com sucesso!\n');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Falha no deploy');
    process.exit(1);
  });
