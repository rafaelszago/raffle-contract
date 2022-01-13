const { makeSut, mockCreateRaffleParams, makeRaffle } = require('./helpers/mock-raffle')
const truffleAssert = require('truffle-assertions')

contract('Raffle Contract', async (accounts) => {
  describe('Claim owner balance', async () => {
    it('should return an exception if raffle is active', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await truffleAssert.fails(
        contract.claimOwnerBalance(raffleId),
        'revert',
        'The raffle is running'
      )
    })

    it('should return an exception if is not raffle owner', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await contract.buyTicket(raffleId, 10, {
        from: accounts[0],
        value: raffleParams.ticketPrice * 10
      })

      await truffleAssert.fails(
        contract.claimOwnerBalance(raffleId, { from: accounts[1] }),
        'revert',
        'This function is restricted to the owner'
      )
    })

    it('should return an exception if balance already been claimed', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await contract.buyTicket(raffleId, 10, {
        from: accounts[0],
        value: raffleParams.ticketPrice * 10
      })

      await truffleAssert.passes(
        contract.claimOwnerBalance(raffleId)
      )

      await truffleAssert.fails(
        contract.claimOwnerBalance(raffleId),
        'revert',
        'The raffle balance already claimed'
      )
    })

    it('should claim owner balance', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)
      await contract.buyTicket(raffleId, 10, {
        from: accounts[0],
        value: raffleParams.ticketPrice * 10
      })
      const accountBalance = await web3.eth.getBalance(accounts[0])
      await contract.claimOwnerBalance(raffleId)
      const accountBalanceUpdated = await web3.eth.getBalance(accounts[0])

      assert(accountBalanceUpdated > accountBalance)
    })
  })
})
