const { makeSut, mockCreateRaffleParams, makeRaffle } = require('./helpers/mock-raffle')
const truffleAssert = require('truffle-assertions')
const { toNumber } = require('web3-utils')

contract('RaffleContract', async (accounts) => {
  describe('Test raffle contract', async () => {
    it('should deploy raffle contract and set correct admin', async () => {
      const contract = await makeSut()
      const admin = await contract.admin()
      assert.equal(admin, accounts[0])
    })
    it('should create raffle', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const response = await contract.createRaffle(
        raffleParams.name,
        raffleParams.prizePercentage,
        raffleParams.ticketPrice,
        raffleParams.ticketGoal,
        { from: accounts[1] }
      )
      truffleAssert.eventEmitted(response, 'RaffleCreated', (event) => {
        return event.name === raffleParams.name
      })
    })
    it('should return an execption if value send is lower than ticketPrice', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await truffleAssert.fails(
        contract.buyTicket(raffleId, 2, {
          from: accounts[0],
          value: raffleParams.ticketPrice
        }),
        'revert',
        'Value is lower than ticket price'
      )
    })
  })
})
