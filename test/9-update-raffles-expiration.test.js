const { makeSut } = require('./helpers/mock-raffle')

contract('Raffle Contract', async (accounts) => {
  describe('Update raffles expiration', async () => {
    it('should return an exception if is not the contract admin', async () => {
      const contract = await makeSut()
      await contract.updateRafflesExpiration(100)
      const rafflesExpiration = await contract.rafflesExpiration()
      assert.equal(rafflesExpiration, 100)
    })
  })
})
