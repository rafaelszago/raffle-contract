const { makeSut, mockCreateRaffleParams, makeRaffle } = require('./helpers/mock-raffle')
const truffleAssert = require('truffle-assertions')

contract('RaffleContract', async (accounts) => {
  describe('Test raffle contract', async () => {
    it('should deploy raffle contract and set correct admin', async () => {
      const contract = await makeSut()
      const admin = await contract.admin()
      assert.equal(admin, accounts[0])
    })

    it('should return an execption if try claim reward and raffle is active', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await truffleAssert.fails(
        contract.claimReward(raffleId, {
          from: accounts[0]
        }),
        'revert',
        'Raffle is running'
      )
    })
  })
})
