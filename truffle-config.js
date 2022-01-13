module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      // eslint-disable-next-line camelcase
      network_id: '*' // Match any network id
    }
  },
  compilers: {
    solc: {
      version: '^0.8.10'
    }
  },
  plugins: ['solidity-coverage']
}
