const { makeSut } = require('./helpers/mock-raffle')

contract('Raffle Contract', async (accounts) => {
  describe('Update raffles expiration', async () => {
    it('should update raffles expiration', async () => {
      const contract = await makeSut()
      await contract.updateRafflesExpiration(100)
      const rafflesExpiration = await contract.rafflesExpiration()
      assert.equal(rafflesExpiration, 100)
    })
  })
})
