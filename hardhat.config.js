require("@nomiclabs/hardhat-waffle");

// If you are using MetaMask, be sure to change the chainId to 1337
module.exports = {
  solidity: "0.8.9",
  networks: {
    hardhat: {
      chainId: 31337,
    },
  },
};
