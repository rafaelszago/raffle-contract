/* eslint-disable camelcase */
require('dotenv').config()

const HDWalletProvider = require('@truffle/hdwallet-provider')

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*' // Match any network id
    },
    bsc: {
      provider: () => new HDWalletProvider(
        process.env.BSC_SECRET,
        'https://bsc-dataseed1.binance.org'
      ),
      network_id: 56,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    }
  },
  compilers: {
    solc: {
      version: '^0.8.10'
    }
  },

  api_keys: {
    bscscan: process.env.BSCSCAN_API_KEY
  },
  plugins: [
    'solidity-coverage',
    'truffle-plugin-verify'
  ]
}
