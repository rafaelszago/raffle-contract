const { makeSut, mockCreateRaffleParams, makeRaffle } = require('./helpers/mock-raffle')
const truffleAssert = require('truffle-assertions')

contract('Raffle Contract', async (accounts) => {
  describe('Claim reward', async () => {
    it('should return an exception if raffle is active', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await truffleAssert.fails(
        contract.claimReward(raffleId),
        'revert',
        'The raffle is running'
      )
    })
    it('should return an exception if is not the winner', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await contract.buyTicket(raffleId, 10, {
        from: accounts[0],
        value: raffleParams.ticketPrice * 10
      })

      await truffleAssert.fails(
        contract.claimReward(raffleId, { from: accounts[1] }),
        'revert',
        'This function is restricted to the winner'
      )
    })
    it('should return an exception if the prize already claimed', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await contract.buyTicket(raffleId, 10, {
        from: accounts[0],
        value: raffleParams.ticketPrice * 10
      })

      await truffleAssert.passes(
        contract.claimReward(raffleId)
      )

      await truffleAssert.fails(
        contract.claimReward(raffleId),
        'revert',
        'The reward already claimed'
      )
    })
    it('should claim reward if is winner and raffle is finished', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await contract.buyTicket(raffleId, 10, {
        from: accounts[0],
        value: raffleParams.ticketPrice * 10
      })

      await truffleAssert.passes(
        contract.claimReward(raffleId)
      )

    })
    it('should claim reward if is winner and raffle is finished', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await contract.buyTicket(raffleId, 10, {
        from: accounts[0],
        value: raffleParams.ticketPrice * 10
      })

      const accountBalance = await web3.eth.getBalance(accounts[0])
      const raffle = await contract.raffles(raffleId)
      const reward = await contract.claimReward(raffleId)
      const accountBalanceUpdated = await web3.eth.getBalance(accounts[0])

      assert.equal(
        accountBalanceUpdated,
        (Number(accountBalance) + Number(raffle.prizeBalance)) - (reward.receipt.gasUsed * 20000000000))

    })
  })
})
