const hre = require("hardhat");

async function main() {
  const initialSupply = hre.ethers.parseUnits("1000000", 18);

  const Token = await hre.ethers.getContractFactory("MeuTokenARC");
  const token = await Token.deploy(initialSupply);

  await token.waitForDeployment();
  const address = await token.getAddress();

  console.log("MeuTokenARC deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
