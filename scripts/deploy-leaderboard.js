const hre = require("hardhat");

async function main() {
  const Leaderboard = await hre.ethers.getContractFactory("ArcLeaderboard");
  const board = await Leaderboard.deploy();

  await board.waitForDeployment();

  console.log("ArcLeaderboard deployed to:", await board.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
