const { makeSut, mockCreateRaffleParams, makeRaffle } = require('./helpers/mock-raffle')
const truffleAssert = require('truffle-assertions')
const { time } = require('@openzeppelin/test-helpers')

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

    it('should finish if owner claim his balance after reach deadline', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()

      await contract.updateRafflesExpiration(10)

      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await contract.buyTicket(raffleId, 1, {
        from: accounts[0],
        value: raffleParams.ticketPrice
      })
      await time.increase(10)
      await contract.claimOwnerBalance(raffleId)

      const raffle = await contract.raffles(raffleId)
      assert.equal(raffle.status, '1')
    })

    it('should return an exception if try to finish a raffle without tickets', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()

      await contract.updateRafflesExpiration(10)

      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await time.increase(10)

      await truffleAssert.fails(
        contract.tryToFinish(raffleId),
        'revert',
        'The raffle didnt have any tickets'
      )
    })

    it('should finish a raffle after reach deadline', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()

      await contract.updateRafflesExpiration(10)

      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await contract.buyTicket(raffleId, 1, {
        from: accounts[0],
        value: raffleParams.ticketPrice
      })

      await time.increase(10)
      await contract.tryToFinish(raffleId)

      const raffle = await contract.raffles(raffleId)
      assert.equal(raffle.status, '1')
    })
  })
})
