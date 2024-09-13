const hre = require("hardhat");

async function main() {
  // We get the contract to deploy.
  const WriteToEarn = await hre.ethers.getContractFactory("WriteToEarn");

  // Set the commission rate (e.g., 5 for 5%)
  const commissionRate = 10;

  const writeToEarn = await WriteToEarn.deploy(commissionRate);

  await writeToEarn.deployed();

  console.log("WriteToEarn deployed to:", writeToEarn.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
