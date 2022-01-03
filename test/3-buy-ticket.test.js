const { makeSut, mockCreateRaffleParams, makeRaffle } = require('./helpers/mock-raffle')
const truffleAssert = require('truffle-assertions')

contract('Raffle Contract', async (accounts) => {
  describe('Buy ticket', async () => {
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

    it('should buy a ticket', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await truffleAssert.passes(
        contract.buyTicket(raffleId, 1, {
          from: accounts[0],
          value: raffleParams.ticketPrice
        }),
        'revert',
        'Value is lower than ticket price'
      )
    })

    it('should split ticket value', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await truffleAssert.passes(
        contract.buyTicket(raffleId, 1, {
          from: accounts[0],
          value: raffleParams.ticketPrice
        }),
        'revert',
        'Value is lower than ticket price'
      )
    })
  })
})
