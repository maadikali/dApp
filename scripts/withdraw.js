const hre = require("hardhat");
const path = require("path");

async function main() {
  try {
    // Get the path to WriteToEarn.json
    const filePath = path.join(__dirname, "../artifacts/contracts/WriteToEarn.sol/WriteToEarn.json");
    //console.log("File path:", filePath);

    // Load ABI from the file
    const jsonFile = require(filePath);
    //console.log("JSON File content:", jsonFile);

    // Ensure that 'abi' is present in the JSON file
    const abi = jsonFile.abi;
    if (!abi) {
      throw new Error("ABI not found in the JSON file");
    }
    // Get the node connection and wallet connection.
    const provider = new hre.ethers.providers.JsonRpcProvider("https://sepolia.infura.io/v3/2f8f691f0bcc41ee81bd4d181e959c9e"); // Replace with your Ethereum node URL
    const signer = new hre.ethers.Wallet("549e3f5888fe8549674700d630b69c7eefa592bbb636dafc41001095d064f7c7", provider); // Replace with your private key

    // Replace 'YourContractAddress' with the actual contract address
    const contractAddress = '0x5342e9EfbE991F8224050141e0fF0B49Bd342d2d';

    // Instantiate the connected contract.
    const writeToEarn = new hre.ethers.Contract(contractAddress, abi, signer);
    //console.log("WriteToEarn contract instance:", writeToEarn);

    // Check the writer's balance before withdrawal.
    const initialBalance = await writeToEarn.writerBalances(signer.address);
    console.log(`Initial balance of the writer: ${initialBalance} tokens`);


  // Withdraw funds if there are funds to withdraw.
  if (initialBalance > 0) {
    console.log("Withdrawing funds...");
    const withdrawTxn = await writeToEarn.withdrawBalance(initialBalance);
    await withdrawTxn.wait();
    console.log("Funds withdrawn successfully!");

    // Assuming your token contract has a transfer function
    // Replace 'YourTokenAddress' with the actual token contract address
    const tokenContractAddress = '0x5342e9EfbE991F8224050141e0fF0B49Bd342d2d';
    const tokenContractABI = ['function transfer(address to, uint256 amount) returns (bool)'];
    const tokenContract = new hre.ethers.Contract(tokenContractAddress, tokenContractABI, signer);

    // Transfer the withdrawn tokens to the writer's address
    const transferTxn = await tokenContract.transfer(signer.address, initialBalance);
    await transferTxn.wait();
    console.log("Tokens transferred successfully!");
  } else {
    console.log("No funds to withdraw.");
  }

  // Check the writer's balance after withdrawal.
  const finalBalance = await writeToEarn.writerBalances(signer.address);
  console.log(`Final balance of the writer: ${finalBalance} tokens`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
 catch (error) {
  console.error("Error:", error);
  process.exit(1);
}
}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});