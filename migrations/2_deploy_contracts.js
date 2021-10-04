const RaffleContract = artifacts.require("RaffleContract");

module.exports = function(deployer) {
  deployer.deploy(RaffleContract);
};
