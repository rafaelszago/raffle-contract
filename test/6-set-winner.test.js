const { makeSut, mockCreateRaffleParams, makeRaffle } = require('./helpers/mock-raffle')
const truffleAssert = require('truffle-assertions')

contract('Raffle', async (accounts) => {
  describe('Set winner', async () => {
    it('Should return an exception if raffle is active', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)
      await truffleAssert.fails(
        contract.setWinner(
          raffleId,
          { from: accounts[1] }
        ),
        'revert',
        `Raffle is running`
      )
    });
    it('Should set the winner of the raffle', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await contract.buyTicket(raffleId, { from: accounts[1], value: raffleParams.ticketPrice })
      await contract.finishRaffle(raffleId, { from: accounts[0] })

      const response = await contract.setWinner(raffleId, { from: accounts[0] })

      truffleAssert.eventEmitted(response, 'WinnerDefined', (event) => {
        return accounts.includes(event.winner)
      })
    });
  })
});
