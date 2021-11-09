const faker = require('faker')
const RaffleContract = artifacts.require('RaffleContract')
const truffleAssert = require('truffle-assertions')

const makeSut = async () => {
  const contract = await RaffleContract.deployed()
  return contract
}

const mockRaffle = () => ({
  name: faker.random.word(),
  prizePercentage: 10,
  ticketPrice: faker.datatype.number(),
  startDate: parseInt(faker.date.past().getTime() / 1000).toFixed(0),
  endDate: parseInt(faker.date.future().getTime() / 1000).toFixed(0)
})

contract('Raffle', async (accounts) => {
  const raffleParams = mockRaffle()

  describe('Test raffle contract', async () => {
    it('should deploy raffle contract and set correct owner', async () => {
      const contract = await makeSut()
      const owner = await contract.owner()
      assert.equal(owner, accounts[0])
    })
  })

  describe('Create raffle', async () => {
    it('should return an exception if prizePercentage is greater then 100', async () => {
      const contract = await makeSut()
      await truffleAssert.fails(
        contract.createRaffle(
          raffleParams.name,
          101,
          raffleParams.ticketPrice,
          raffleParams.startDate,
          raffleParams.endDate,
          { from: accounts[1] }
        ),
        'revert',
        'Value must be 100 or lower'
      )
    })
    it('should return an exception if ticketPrice is lower then 0.01 BNB', async () => {
      const contract = await makeSut()
      await truffleAssert.fails(
        contract.createRaffle(
          raffleParams.name,
          raffleParams.prizePercentage,
          raffleParams.ticketPrice - 10,
          raffleParams.startDate,
          raffleParams.endDate,
          { from: accounts[1] }
        ),
        'revert',
        'The minimum ticketPrice is 0.01 BNB'
      )
    })
  })
})
