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
    raffleParams.balanceGoal,
    raffleParams.startDate,
    raffleParams.endDate,
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
  balanceGoal = 10,
  startDate = parseInt(new Date().getTime() / 1000).toFixed(0),
  endDate = parseInt(faker.date.soon(20).getTime() / 1000).toFixed(0)
) => {
  return {
    name,
    prizePercentage,
    ticketPrice,
    balanceGoal,
    startDate,
    endDate
  }
}

module.exports = {
  makeSut,
  makeRaffle,
  mockCreateRaffleParams
}
