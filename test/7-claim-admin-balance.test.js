const { makeSut, mockCreateRaffleParams, makeRaffle } = require('./helpers/mock-raffle')
const truffleAssert = require('truffle-assertions')

contract('Raffle Contract', async (accounts) => {
  describe('Claim admin balance', async () => {
    it('should return an exception if is not the contract admin', async () => {
      const contract = await makeSut()

      await truffleAssert.fails(
        contract.claimAdminBalance({ from: accounts[1] }),
        'revert',
        'This function is restricted to the admin'
      )
    })

    it('should return an exception if didnt have any balance', async () => {
      const contract = await makeSut()

      await truffleAssert.fails(
        contract.claimAdminBalance({ from: accounts[0] }),
        'revert',
        'You dont have any balance'
      )
    })

    it('should return an exception if didnt have any balance', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await contract.buyTicket(raffleId, 10, {
        from: accounts[0],
        value: raffleParams.ticketPrice * 10
      })

      await truffleAssert.passes(
        contract.claimAdminBalance({ from: accounts[0] })
      )
    })

    it('should pay fee to admin', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const adminBalance = await contract.adminBalance()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await contract.buyTicket(raffleId, 10, {
        from: accounts[0],
        value: raffleParams.ticketPrice * 10
      })

      const adminBalanceUpdated = await contract.adminBalance()

      assert(Number(adminBalanceUpdated) > Number(adminBalance))
    })
  })
})
