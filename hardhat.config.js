require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config()
require("bcryptjs")
require("bcrypt")

/** @type import('hardhat/config').HardhatUserConfig */ 
const endpointUrl = "https://wiser-blissful-crater.matic-testnet.quiknode.pro/049cef510085e112d9904ec30e5bd339d81108f2/"; 
const privateKey = "549e3f5888fe8549674700d630b69c7eefa592bbb636dafc41001095d064f7c7"; 
 
module.exports = { 
  solidity: "0.8.20", 
  networks: {
    hardhat: {
      chainId: 1337
      },
    sepolia: { 
      url: endpointUrl, 
      accounts: [privateKey], 
    }, 
  }, 
  paths: { 
    artifacts: "./artifacts", // Set the path to your contract artifacts 
  }, 
};