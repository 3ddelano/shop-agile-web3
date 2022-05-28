require("dotenv").config();
require("@nomiclabs/hardhat-waffle");

// Plugins
require("hardhat-tracer");
require("hardhat-gas-trackooor");
let { removeConsoleLog } = require("hardhat-preprocessor");

// If you are using MetaMask, be sure to change the chainId to 1337
module.exports = {
    solidity: {
        version: "0.8.9",
        optimizer: {
            enabled: true,
            runs: 200,
        },
    },
    preprocess: {
        eachLine: removeConsoleLog(
            (hre) =>
                hre.network.name !== "hardhat" &&
                hre.network.name !== "localhost"
        ),
    },
    // defaultNetwork: "matic",
    networks: {
        // matic: {
        // url: "https://rpc-mumbai.maticvigil.com",
        // accounts: [process.env.PRIVATE_KEY],
        // },
        hardhat: {
            chainId: 80001,
        },
    },
};
