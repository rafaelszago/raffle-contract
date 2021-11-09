const faker = require('faker')
const RaffleContract = artifacts.require('RaffleContract')
const truffleAssert = require('truffle-assertions')

const makeSut = async () => {
  const contract = await RaffleContract.deployed()
  return contract
}

const mockRaffle = () => ({
  name: faker.random.word(),
  prizePercentage: 10,
  ticketPrice: faker.datatype.number(),
  startDate: parseInt(faker.date.past().getTime() / 1000).toFixed(0),
  endDate: parseInt(faker.date.future().getTime() / 1000).toFixed(0)
})

contract('Raffle', async (accounts) => {
  describe('Test raffle contract', async () => {
    it('should deploy raffle contract and set correct owner', async () => {
      const contract = await makeSut()
      const owner = await contract.owner()
      assert.equal(owner, accounts[0])
    })
  })
})
