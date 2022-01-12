const { makeSut } = require('./helpers/mock-raffle')

contract('RaffleContract', async (accounts) => {
  describe('Test raffle contract', async () => {
    it('should deploy raffle contract and set correct admin', async () => {
      const contract = await makeSut()
      const admin = await contract.admin()
      assert.equal(admin, accounts[0])
    })
  })
})
