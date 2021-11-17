const RaffleContract = artifacts.require('RaffleContract')
const faker = require('faker')
const { toWei } = require('web3-utils')

const makeSut = async () => {
  const contract = await RaffleContract.deployed()
  return contract
}

const makeRaffle = async (contract, account, raffleParams) => {
  await contract.createRaffle(
    raffleParams.name,
    raffleParams.prizePercentage,
    raffleParams.ticketPrice,
    raffleParams.ticketGoal,
    { from: account }
  )

  const raffleId = await contract.rafflesCount()
  const raffle = await contract.getRaffle(raffleId)

  return {
    raffleId,
    raffle
  }
}

const mockCreateRaffleParams = (
  name = faker.random.word(),
  prizePercentage = 10,
  ticketPrice = toWei('0.2'),
  ticketGoal = 10
) => {
  return {
    name,
    prizePercentage,
    ticketPrice,
    ticketGoal
  }
}

module.exports = {
  makeSut,
  makeRaffle,
  mockCreateRaffleParams
}
