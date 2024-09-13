const { ethers } = require("hardhat");

async function main() {
  const [owner, writer1, writer2, writer3] = await ethers.getSigners();

  const WriteToEarn = await ethers.getContractFactory("WriteToEarn");
  const writeToEarn = await WriteToEarn.deploy(5); // Assuming 5% commission rate
  await writeToEarn.deployed();
  console.log("WriteToEarn deployed to:", writeToEarn.address);

  // Check writer balances before registration
  const writerAddresses = [owner.address, writer1.address, writer2.address, writer3.address];
  console.log("== Before Registration ==");
  await printBalances(writeToEarn, writerAddresses);

  // Register writers
  await writeToEarn.connect(writer1).registerWriter();
  await writeToEarn.connect(writer2).registerWriter();
  await writeToEarn.connect(writer3).registerWriter();

  // Check writer balances after registration
  console.log("== After Registration ==");
  await printBalances(writeToEarn, writerAddresses);

  // Writers earn tokens
  await writeToEarn.connect(writer1).earn();
  await writeToEarn.connect(writer2).earn();
  await writeToEarn.connect(writer3).earn();

  // Check writer balances after earning
  console.log("== After Earning Tokens ==");
  await printBalances(writeToEarn, writerAddresses);

  // Withdraw earnings
  await writeToEarn.connect(writer1).withdrawBalance(1);
  await writeToEarn.connect(writer2).withdrawBalance(1);
  await writeToEarn.connect(writer3).withdrawBalance(1);

  // Check writer balances after withdrawal
  console.log("== After Withdrawal ==");
  await printBalances(writeToEarn, writerAddresses);
}

async function printBalances(writeToEarn, addresses) {
  for (const address of addresses) {
    const balance = await writeToEarn.writerBalances(address);
    console.log(`Writer ${address} balance: ${balance}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
