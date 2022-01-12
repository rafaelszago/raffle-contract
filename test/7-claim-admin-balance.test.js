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

    it('should claim admin balance', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await contract.buyTicket(raffleId, 10, {
        from: accounts[0],
        value: raffleParams.ticketPrice * 10
      })

      const accountBalance = await web3.eth.getBalance(accounts[0])
      const adminBalance = await contract.adminBalance()
      const reward = await contract.claimAdminBalance()
      const accountBalanceUpdated = await web3.eth.getBalance(accounts[0])
      const adminBalanceUpdated = await contract.adminBalance()

      assert.equal(
        accountBalanceUpdated,
        (Number(accountBalance) + Number(adminBalance)) - (reward.receipt.gasUsed * 20000000000)
      )

      assert.equal(adminBalanceUpdated, 0)
    })
  })
})
