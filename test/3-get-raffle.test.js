const truffleAssert = require('truffle-assertions')
const { makeSut, mockCreateRaffleParams } = require('./helpers/mock-raffle')

contract('Raffle', async (accounts) => {
  const raffleParams = mockCreateRaffleParams()

  describe('Get raffle', async () => {
    it('should get raffle by id', async () => {
      const contract = await makeSut()
      await truffleAssert.passes(
        contract.getRaffle(1)
      )
    })
  })
})
