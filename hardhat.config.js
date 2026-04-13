require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const NODEREAL_API_KEY = process.env.NODEREAL_API_KEY || "";
const BSCSCAN_API_KEY  = process.env.BSCSCAN_API_KEY  || "";

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    bsc: {
      url: process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org",
      chainId: 56,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000, // 1 gwei
    },
    opbnb: {
      url: process.env.OPBNB_RPC_URL || "https://opbnb-mainnet-rpc.bnbchain.org",
      chainId: 204,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
    },
    opbnbTestnet: {
      url: process.env.OPBNB_TESTNET_RPC_URL || "https://opbnb-testnet-rpc.bnbchain.org:8545",
      chainId: 5611,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
    },
  },
  paths: {
    sources:   "./contracts",
    artifacts: "./artifacts",
    cache:     "./cache",
  },
  etherscan: {
    apiKey: {
      bsc:   BSCSCAN_API_KEY,
      opbnb: NODEREAL_API_KEY,
    },
    customChains: [
      {
        network: "opbnb",
        chainId: 204,
        urls: {
          apiURL:     `https://open-platform.nodereal.io/${NODEREAL_API_KEY}/op-bnb-mainnet/contract/`,
          browserURL: "https://opbnbscan.com/",
        },
      },
    ],
  },
};
