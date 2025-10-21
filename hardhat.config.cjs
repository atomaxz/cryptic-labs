// https://eth-sepolia.g.alchemy.com/v2/poW824z7baY51XHHw5_9oqfNZo7Mcnav

require("@nomiclabs/hardhat-waffle");
const dotenv = require("dotenv");
dotenv.config();

const customObject = {};
customObject[process.env.NETWORK] = {
  url: process.env.URL,
  accounts: [process.env.ACCOUNTS],
};

module.exports = {
  solidity: "0.8.0",
  networks: customObject
};
