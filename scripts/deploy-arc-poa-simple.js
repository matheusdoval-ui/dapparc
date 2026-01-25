const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Configuração da Arc Testnet
const ARC_RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network';
const CHAIN_ID = 5042002;

// Bytecode do contrato (será gerado após compilação)
// Por enquanto, vamos usar um script que compila e faz deploy

async function deploy() {
  console.log('\n🚀 Deploy do ArcProofOfActivity na Arc Testnet\n');

  // Verificar PRIVATE_KEY
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ Erro: PRIVATE_KEY não encontrada no .env');
    console.log('\nCrie um arquivo .env com:');
    console.log('PRIVATE_KEY=sua_chave_privada_aqui\n');
    process.exit(1);
  }

  // Conectar à rede
  const provider = new ethers.JsonRpcProvider(ARC_RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log('📝 Endereço do deployer:', wallet.address);

  // Verificar saldo
  const balance = await provider.getBalance(wallet.address);
  console.log('💰 Saldo:', ethers.formatEther(balance), 'ETH\n');

  if (balance === 0n) {
    console.error('❌ Saldo insuficiente! Você precisa de ETH na Arc Testnet.');
    console.log('💡 Use um faucet para obter ETH de teste.\n');
    process.exit(1);
  }

  // Ler bytecode compilado (se existir)
  const artifactsPath = path.join(__dirname, '../artifacts/contracts/ArcProofOfActivity.sol/ArcProofOfActivity.json');
  
  if (!fs.existsSync(artifactsPath)) {
    console.error('❌ Contrato não compilado!');
    console.log('\nExecute primeiro:');
    console.log('  npx hardhat compile\n');
    console.log('Ou use Remix IDE para compilar e fazer deploy:\n');
    console.log('1. Acesse: https://remix.ethereum.org');
    console.log('2. Cole o código de contracts/ArcProofOfActivity.sol');
    console.log('3. Compile (Solidity 0.8.20)');
    console.log('4. Deploy na Arc Testnet (Chain ID: 5042002)\n');
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
  const bytecode = artifact.bytecode;
  const abi = artifact.abi;

  console.log('📦 Fazendo deploy...\n');

  // Criar factory e deployar
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  
  console.log('⏳ Aguardando confirmação...');
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  
  console.log('\n✅ Contrato deployado com sucesso!');
  console.log('📍 Endereço:', contractAddress);
  console.log('🔗 Explorer:', `https://testnet.arcscan.app/address/${contractAddress}\n`);

  // Salvar informações
  const deployInfo = {
    network: 'arcTestnet',
    chainId: CHAIN_ID,
    contractAddress,
    deployerAddress: wallet.address,
    deployTimestamp: new Date().toISOString(),
    explorer: `https://testnet.arcscan.app/address/${contractAddress}`,
  };

  console.log('💾 Informações do deploy:');
  console.log(JSON.stringify(deployInfo, null, 2));
  console.log('\n📋 Configure no .env:');
  console.log(`NEXT_PUBLIC_ARC_POA_ADDRESS=${contractAddress}\n`);

  return contractAddress;
}

deploy().catch(console.error);
