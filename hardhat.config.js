const { task } = require("hardhat/config");

require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  networks: {
    hardhat: {
      // Configuration for the local network
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      // No need to set the accounts key; Hardhat automatically uses the accounts from the local node
    },
  },
  solidity: "0.8.0",
};

// task action function receives the Hardhat Runtime Environment as second argument
task("accounts", "Prints accounts", async (_, { web3 }) => {
  console.log(await web3.eth.getAccounts());
});
