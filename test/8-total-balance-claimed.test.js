const { makeSut } = require('./helpers/mock-raffle')

contract('Raffle Contract', async (accounts) => {
  describe('Total balance claimed', async () => {
    it('should return total balance claimed', async () => {
      const contract = await makeSut()
      const totalBalanceClaimed = await contract.totalBalanceClaimed()
      assert.equal(totalBalanceClaimed)
    })
  })
})
