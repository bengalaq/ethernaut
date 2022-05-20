import dotenv from "dotenv";
dotenv.config(); // load env vars from .env
import { task, HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "./tasks/index";

const { ARCHIVE_URL, MNEMONIC } = process.env;

if (!ARCHIVE_URL)
  throw new Error(
    `ARCHIVE_URL env var not set. Copy .env.template to .env and set the env var`
  );
if (!MNEMONIC)
  throw new Error(
    `MNEMONIC env var not set. Copy .env.template to .env and set the env var`
  );

const accounts = {
  // derive accounts from mnemonic, see tasks/create-key
  mnemonic: MNEMONIC,
};

// Go to https://hardhat.org/config/ to learn more
const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      { version: "0.8.4" },
      { version: "0.6.0" },
      { version: "0.7.3" },
      { version: "0.7.0" },
      { version: "0.8.0" },
      { version: "0.5.0" }
    ],
  },
  networks: {
    rinkeby: {
      url: ARCHIVE_URL,
      accounts,
    },
    hardhat: {
      accounts,
      forking: {
        url: ARCHIVE_URL, // https://eth-rinkeby.alchemyapi.io/v2/SECRET`,
        blockNumber: 10698573,
      },
    },
  },
  mocha: {
    timeout: 300 * 1e9,
  }
};

export default config;
