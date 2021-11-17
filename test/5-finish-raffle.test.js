const { makeSut, mockCreateRaffleParams, makeRaffle } = require('./helpers/mock-raffle')
const truffleAssert = require('truffle-assertions')

contract('Raffle', async (accounts) => {
  describe('Finish raffle', async () => {
    it('Should return an exception if user isn`t the raffle`s owner', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)
      await truffleAssert.fails(
        contract.finishRaffle(
          raffleId,
          { from: accounts[1] }
        ),
        'revert',
        `This function is restricted to the raffle's owner`
      )
    });
    it('Should return an exception if raffle didnt have any ticket', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)
      await truffleAssert.fails(
        contract.finishRaffle(
          raffleId,
          { from: accounts[0] }
        ),
        'revert',
        `Raffle didn't have any ticket`
      )
    });
    it('Should finish the raffle', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await contract.buyTicket(
        raffleId,
        { from: accounts[1], value: raffleParams.ticketPrice }
      )

      const response = await contract.finishRaffle(
        raffleId,
        { from: accounts[0] }
      )

      truffleAssert.eventEmitted(response, 'RaffleFinished', (event) => {
        return event.name === raffleParams.name
      })
    });
  })
});
