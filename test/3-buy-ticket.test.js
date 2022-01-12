const { makeSut, mockCreateRaffleParams, makeRaffle } = require('./helpers/mock-raffle')
const truffleAssert = require('truffle-assertions')

contract('Raffle Contract', async (accounts) => {
  describe('Buy ticket', async () => {
    it('should return an execption if value send is lower than ticketPrice', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await truffleAssert.fails(
        contract.buyTicket(raffleId, 2, {
          from: accounts[0],
          value: raffleParams.ticketPrice
        }),
        'revert',
        'Value is different than ticket price'
      )
    })

    it('should return an execption if ticketsTotal is lower than 0', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await truffleAssert.fails(
        contract.buyTicket(raffleId, 0, {
          from: accounts[0],
          value: '0'
        }),
        'revert',
        'You should buy one ticket at least'
      )
    })

    it('should return an execption if didnt have ticket available', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await truffleAssert.fails(
        contract.buyTicket(raffleId, 11, {
          from: accounts[0],
          value: (raffleParams.ticketPrice * 11).toString()
        }),
        'revert',
        'Insufficient tickets available'
      )
    })

    it('should buy a ticket', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await truffleAssert.passes(
        contract.buyTicket(raffleId, 1, {
          from: accounts[0],
          value: raffleParams.ticketPrice
        })
      )
    })

    it('should add a ticket with correct params', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await contract.buyTicket(raffleId, 1, {
        from: accounts[0],
        value: raffleParams.ticketPrice
      })

      const ticketsCount = await contract.getTicketsCount(raffleId)
      assert.equal(ticketsCount, 1)

      const ticket = await contract.getTicket(raffleId, 0)
      assert.equal(ticket.owner, accounts[0])
      assert.equal(ticket.claimed, false)
    })

    it('should pay a fee to contract admin when buy a ticket', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      const adminBalance = await contract.adminBalance()

      await contract.buyTicket(raffleId, 1, {
        from: accounts[0],
        value: raffleParams.ticketPrice
      })

      const adminFeePercent = await contract.adminFeePercent()
      const adminBalanceUpdated = await contract.adminBalance()

      assert.equal(
        (adminBalanceUpdated - adminBalance).toString(),
        ((raffleParams.ticketPrice * adminFeePercent) / 100).toString()
      )
    })

    it('should update prize and owner balance when buy a ticket', async () => {
      const contract = await makeSut()
      const raffleParams = mockCreateRaffleParams()
      const { raffleId } = await makeRaffle(contract, accounts[0], raffleParams)

      await contract.buyTicket(raffleId, 1, {
        from: accounts[0],
        value: raffleParams.ticketPrice
      })

      const adminFeePercent = await contract.adminFeePercent()
      const raffle = await contract.raffles(raffleId)

      const feeValue = raffleParams.ticketPrice * adminFeePercent / 100
      const totalValue = raffleParams.ticketPrice - feeValue
      const prizeValue = totalValue * raffleParams.prizePercentage / 100
      const ownerValue = totalValue - prizeValue

      assert.equal(raffle.prizeBalance, prizeValue)
      assert.equal(raffle.ownerBalance, ownerValue)
    })
  })
})
