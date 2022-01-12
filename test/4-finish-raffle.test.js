const { makeSut, mockCreateRaffleParams, makeRaffle } = require('./helpers/mock-raffle')
const truffleAssert = require('truffle-assertions')

contract('Raffle Contract', async (accounts) => {
  describe('Finish raffle', async () => {
    it('should not finish a raffle if not reach tickets goal', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await contract.buyTicket(raffleId, 1, {
        from: accounts[0],
        value: raffleParams.ticketPrice
      })

      const raffle = await contract.raffles(raffleId)

      assert.equal(raffle.status, '0')
    })

    it('should return an exception if try to finish a raffle without tickets', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()

      await contract.updateRafflesExpiration(0)

      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await truffleAssert.fails(
        contract.claimOwnerBalance(raffleId),
        'revert',
        'The raffle didnt have any tickets'
      )
    })

    it('should finish a raffle after reach tickets goal', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await contract.buyTicket(raffleId, 10, {
        from: accounts[0],
        value: raffleParams.ticketPrice * 10
      })

      const raffle = await contract.raffles(raffleId)

      assert.equal(raffle.status, '1')
    })
  })
})
