const { makeSut } = require('./helpers/mock-raffle')

contract('Raffle', async (accounts) => {
  describe('Test raffle contract', async () => {
    it('should deploy raffle contract and set correct owner', async () => {
      const contract = await makeSut()
      const owner = await contract.owner()
      assert.equal(owner, accounts[0])
    })
  })
})
