const { makeSut, mockCreateRaffleParams, makeRaffle } = require('./helpers/mock-raffle')
const { toBN } = require('web3-utils')
const truffleAssert = require('truffle-assertions')

contract('Raffle', async (accounts) => {
  const raffleParams = mockCreateRaffleParams()

  describe('Buy ticket', async () => {
    it('should return an execption if value send is lower than ticketPrice', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)
      await truffleAssert.fails(
        contract.buyTicket(raffleId, { from: accounts[0], value: 0 }),
        'revert',
        'Value is lower than ticket price'
      )
    })
    it('should buy a ticket', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)
      const response = await contract.buyTicket(
        raffleId,
        { from: accounts[0], value: raffleParams.ticketPrice }
      )

      truffleAssert.eventEmitted(response, 'TicketCreated', (event) => {
        return event.owner === accounts[0]
      })
    })
  })
})
