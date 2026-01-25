const { ethers } = require("hardhat");

/**
 * Script de deploy do contrato ArcProofOfActivity na Arc Testnet
 * 
 * Uso:
 *   npx hardhat run scripts/deploy-arc-poa.js --network arcTestnet
 * 
 * Variáveis de ambiente necessárias:
 *   - PRIVATE_KEY: Chave privada da carteira que fará o deploy
 */
async function main() {
  console.log("\n🚀 Iniciando deploy do ArcProofOfActivity na Arc Testnet...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Saldo:", ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    throw new Error("❌ Saldo insuficiente! Você precisa de ETH na Arc Testnet para fazer o deploy.");
  }

  console.log("📦 Fazendo deploy do contrato ArcProofOfActivity...");
  const ArcProofOfActivity = await ethers.getContractFactory("ArcProofOfActivity");
  const poa = await ArcProofOfActivity.deploy();

  console.log("⏳ Aguardando confirmação...");
  await poa.waitForDeployment();

  const poaAddress = await poa.getAddress();
  console.log("\n✅ Contrato deployado com sucesso!");
  console.log("📍 Endereço do contrato:", poaAddress);
  console.log("🔗 Explorer:", `https://testnet.arcscan.app/address/${poaAddress}\n`);

  // Verificar informações do contrato
  try {
    const stats = await poa.getGlobalStats();
    console.log("📊 Estatísticas iniciais:");
    console.log("   Total Wallets:", stats.totalWallets.toString());
    console.log("   Total Activities:", stats.totalActivities.toString());
    console.log("   Min Blocks Between Proofs:", stats.minBlocksBetweenProofs.toString());
    console.log("");
  } catch (error) {
    console.log("⚠️  Não foi possível obter estatísticas:", error.message);
  }

  // Salvar informações do deploy
  const deployInfo = {
    network: "arcTestnet",
    chainId: 5042002,
    contractAddress: poaAddress,
    deployerAddress: deployer.address,
    deployTimestamp: new Date().toISOString(),
    explorer: `https://testnet.arcscan.app/address/${poaAddress}`,
    contractName: "ArcProofOfActivity",
    minBlocksBetweenProofs: 600,
  };

  console.log("💾 Informações do deploy (salve estas informações):");
  console.log(JSON.stringify(deployInfo, null, 2));
  console.log("\n");

  // ABI do contrato
  const abi = ArcProofOfActivity.interface.format("json");
  console.log("📄 ABI do contrato (salve para uso no frontend):");
  console.log(abi);
  console.log("\n");

  return poaAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Erro no deploy:", error.message);
    process.exit(1);
  });
