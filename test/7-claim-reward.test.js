const { makeSut, mockCreateRaffleParams, makeRaffle } = require('./helpers/mock-raffle')
const truffleAssert = require('truffle-assertions')

contract('Raffle', async (accounts) => {
  describe('Claim reward', async () => {
    it("Should return an exception if isnt the raffle's winner", async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await contract.buyTicket(raffleId, { from: accounts[1], value: raffleParams.ticketPrice })
      await contract.finishRaffle(raffleId, { from: accounts[0] })
      await contract.setWinner(raffleId, { from: accounts[0] })

      const raffle = await contract.getRaffle(raffleId)
      const loosers = accounts.filter(a => a !== raffle.winner)

      await truffleAssert.fails(
        contract.claimReward(raffleId, { from: loosers[0] }),
        'revert',
        `This function is restricted to the raffle's winner`
      )
    });

    it("Should claim reward if user is the winner", async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await contract.buyTicket(raffleId, { from: accounts[1], value: raffleParams.ticketPrice })
      await contract.finishRaffle(raffleId, { from: accounts[0] })
      await contract.setWinner(raffleId, { from: accounts[0] })

      const raffle = await contract.getRaffle(raffleId)
      const response = await contract.claimReward(raffleId, { from: raffle.winner })

      truffleAssert.eventEmitted(response, 'RewardClaimed', (event) => {
        return Number(event.raffleId) === Number(raffleId)
      })
    });
  })
});
