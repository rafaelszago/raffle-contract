const truffleAssert = require('truffle-assertions')
const faker = require('faker')
const { makeSut, mockCreateRaffleParams } = require('./helpers/mock-raffle')

contract('Raffle', async (accounts) => {
  describe('Create raffle', async () => {
    it('should return an exception if prizePercentage is greater than 100', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      await truffleAssert.fails(
        contract.createRaffle(
          raffleParams.name,
          101,
          raffleParams.ticketPrice,
          raffleParams.balanceGoal,
          raffleParams.startDate,
          raffleParams.endDate,
          { from: accounts[1] }
        ),
        'revert',
        'Prize percentage must be 100 or lower'
      )
    })
    it('should return an exception if ticketPrice is lower than 0.01 BNB', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      await truffleAssert.fails(
        contract.createRaffle(
          raffleParams.name,
          raffleParams.prizePercentage,
          100,
          raffleParams.balanceGoal,
          raffleParams.startDate,
          raffleParams.endDate,
          { from: accounts[1] }
        ),
        'revert',
        'Ticket price must be 0.01 BNB or greater'
      )
    })
    it('should return an exception if endDate is after than today', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      await truffleAssert.fails(
        contract.createRaffle(
          raffleParams.name,
          raffleParams.prizePercentage,
          raffleParams.ticketPrice,
          raffleParams.balanceGoal,
          raffleParams.startDate,
          parseInt(faker.date.past().getTime() / 1000).toFixed(0),
          { from: accounts[1] }
        ),
        'revert',
        'End date must be at least one week'
      )
    })
    it('should create a raffle if send correct params', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const response = await contract.createRaffle(
        raffleParams.name,
        raffleParams.prizePercentage,
        raffleParams.ticketPrice,
        raffleParams.balanceGoal,
        raffleParams.startDate,
        raffleParams.endDate,
        { from: accounts[1] }
      )
      truffleAssert.eventEmitted(response, 'RaffleCreated', (event) => {
        return event.name === raffleParams.name
      })
    })
  })
})
