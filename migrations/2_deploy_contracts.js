const RaffleContract = artifacts.require('RaffleContract')

module.exports = (deployer) => {
  deployer.deploy(RaffleContract)
}
