const { makeSut, mockCreateRaffleParams, makeRaffle } = require('./helpers/mock-raffle')
const truffleAssert = require('truffle-assertions')

contract('Raffle', async (accounts) => {
  describe('Claim owner balance', async () => {
    it("Should return an exception if isnt the raffle's owner", async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await contract.buyTicket(raffleId, { from: accounts[1], value: raffleParams.ticketPrice })
      await contract.finishRaffle(raffleId, { from: accounts[0] })

      await truffleAssert.fails(
        contract.claimOwnerBalance(raffleId, { from: accounts[1] }),
        'revert',
        `This function is restricted to the raffle's owner`
      )
    });

    it("Should claim the reward of the raffle's owner", async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await contract.buyTicket(raffleId, { from: accounts[1], value: raffleParams.ticketPrice })
      await contract.finishRaffle(raffleId, { from: accounts[0] })

      const response = await contract.claimOwnerBalance(raffleId, { from: accounts[0] })

      truffleAssert.eventEmitted(response, 'OwnerBalanceClaimed', (event) => {
        return Number(event.raffleId) === Number(raffleId)
      })
    });
  })
});
