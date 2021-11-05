const faker = require('faker');
const RaffleContract = artifacts.require("RaffleContract");

const makeSut = async () => {
  contract = await RaffleContract.deployed();
  return { contract }
}

const mockRaffle = () => ({
  name: faker.random.word(),
  prizePercentage: 10,
  ticketPrice: faker.datatype.number(),
  startDate: parseInt(faker.date.past().getTime() / 1000).toFixed(0),
  endDate: parseInt(faker.date.future().getTime() / 1000).toFixed(0)
})

contract("Raffle", (accounts) => {
  describe("Test raffle contract", async () => {
    it("should deploy raffle contract and set correct owner", async () => {
      const { contract } = await makeSut()
      const owner = await contract.owner()
      assert.equal(owner, accounts[0])
    });

    it("should create a raffle with correct params", async () => {
      const { contract } = await makeSut()
      const raffleParams = mockRaffle()
      await contract.createRaffle(
        raffleParams.name,
        raffleParams.prizePercentage,
        raffleParams.ticketPrice,
        raffleParams.startDate,
        raffleParams.endDate,
        { from: accounts[1] }
      )
      const raffle = await contract.getRaffle(1)
      assert.equal(raffle.owner, accounts[1])
    });

    it("should buy a ticket and set correct owner", async () => {
      const { contract } = await makeSut()
      const raffle = await contract.getRaffle(1)
      await contract.buyTicket(raffle.id, {
        from: accounts[0], value: raffle.ticketPrice
      })
      const ticketsCount = await contract.getTicketsCount(1)
      const ticket = await contract.getTicket(raffle.id, 0)
      assert.equal(ticketsCount, 1)
      assert.equal(ticket.owner, accounts[0])
    });

    it("should split ticket value", async () => {
      const { contract } = await makeSut()
      const raffle = await contract.getRaffle(1)
      assert(raffle.prizeBalance > 0)
      assert(raffle.ownerBalance > 0)
    });

    it("should buy multiple tickets", async () => {
      const { contract } = await makeSut()
      const raffle = await contract.getRaffle(1)
      await contract.buyTicket(raffle.id, {
        from: accounts[0], value: raffle.ticketPrice
      })
      await contract.buyTicket(raffle.id, {
        from: accounts[1], value: raffle.ticketPrice
      })
      await contract.buyTicket(raffle.id, {
        from: accounts[2], value: raffle.ticketPrice
      })
      await contract.buyTicket(raffle.id, {
        from: accounts[3], value: raffle.ticketPrice
      })
      const ticketsCount = await contract.getTicketsCount(1)
      assert.equal(ticketsCount, 5)
    });

    it("should finish raffle", async () => {
      const { contract } = await makeSut()
      await contract.finishRaffle(1, { from: accounts[1] })
      const raffle = await contract.getRaffle(1)
      assert.equal(raffle.status, 3)
    });

    it("should define a winner", async () => {
      const { contract } = await makeSut()
      const raffle = await contract.getRaffle(1)
      assert(accounts.includes(raffle.winner))
    });

    it("should claim reward", async () => {
      const { contract } = await makeSut()
      const raffle = await contract.getRaffle(1)
      await contract.claimReward(1, { from: raffle.winner })
      const raffleUpdated = await contract.getRaffle(1)
      assert.equal(raffleUpdated.prizeBalance, 0)
    });
  });
});
