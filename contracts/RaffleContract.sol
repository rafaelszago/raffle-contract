// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract RaffleContract {
  enum Status {
    Active,
    Finished
  }

  struct Ticket {
    address owner;
  }

  struct Raffle {
    uint256 id;
    Status status;
    string name;
    address owner;
    address winner;
    uint256 ownerBalance;
    uint256 balanceGoal;
    uint256 prizePercentage;
    uint256 prizeBalance;
    uint256 startDate;
    uint256 endDate;
    uint256 ticketPrice;
    Ticket[] tickets;
  }

  address public owner;
  uint256 public ownerFeePercent;
  uint256 public rafflesCount;
  mapping(uint256 => Raffle) public raffles;

  constructor() {
    owner = msg.sender;
    ownerFeePercent = 1;
    rafflesCount = 0;
  }

  event RaffleCreated(uint256 id, string name);
  event TicketCreated(uint256 id, address owner);

  modifier onlyOwner(uint256 raffleId) {
    require(
      msg.sender == raffles[raffleId].owner,
      "This function is restricted to the raffle's owner"
    );
    _;
  }

  modifier onlyActive(uint256 raffleId) {
    require(raffles[raffleId].startDate * 1 days <= block.timestamp, "The raffle didn't started");
    require(raffles[raffleId].endDate * 1 days >= block.timestamp, "The raffle already finished");
    _;
  }

  function random(uint maxValue) internal view returns (uint) {
    return uint(
      keccak256(
        abi.encodePacked(
          block.timestamp,
          msg.sender,
          block.difficulty
        )
      )
    ) % maxValue;
  }

  function splitTicketValue (uint256 raffleId, uint256 value) internal {
    Raffle storage raffle = raffles[raffleId];
    raffle.prizeBalance += (value * raffle.prizePercentage) / 100;
    raffle.ownerBalance += value - (value * raffle.prizePercentage / 100);
  }

  function createRaffle (string memory name, uint256 prizePercentage, uint256 ticketPrice, uint256 balanceGoal, uint256 startDate, uint256 endDate) public {
    require(prizePercentage <= 100, "Prize percentage must be 100 or lower");
    require(prizePercentage >= 0, "Prize percentage must be 0 or greater");
    require(ticketPrice >= 0.01 ether, "Ticket price must be 0.01 BNB or greater");
    require(startDate >= 0 days, "Start date must be after than today");
    require(endDate >= startDate + 7 days, "End date must be at least one week");
    rafflesCount++;
    Raffle storage newRaffle = raffles[rafflesCount];
    newRaffle.id = rafflesCount;
    newRaffle.status = Status.Active;
    newRaffle.name = name;
    newRaffle.owner = msg.sender;
    newRaffle.winner = 0x0000000000000000000000000000000000000000;
    newRaffle.ownerBalance = 0;
    newRaffle.balanceGoal = balanceGoal;
    newRaffle.prizePercentage = prizePercentage;
    newRaffle.prizeBalance = 0;
    newRaffle.startDate = startDate;
    newRaffle.endDate = endDate;
    newRaffle.ticketPrice = ticketPrice;
    newRaffle.tickets;

    emit RaffleCreated(newRaffle.id, newRaffle.name);
  }

  function getRaffle (uint256 raffleId) public view returns(Raffle memory) {
    return raffles[raffleId];
  }

  function getTicket (uint256 raffleId, uint256 ticketId) public view returns(Ticket memory) {
    Raffle memory raffle = raffles[raffleId];
    return raffle.tickets[ticketId];
  }

  function buyTicket (uint256 raffleId) public payable {
    require(raffles[raffleId].ticketPrice <= msg.value, "Value is lower than ticket price");
    require(block.timestamp <= block.timestamp + (raffles[raffleId].startDate * 1 days), "The raffle didn't started");
    require(block.timestamp <= block.timestamp + (raffles[raffleId].endDate * 1 days), "The raffle already finished");
    raffles[raffleId].tickets.push(Ticket(msg.sender));
    splitTicketValue(raffleId, msg.value);
    emit TicketCreated(raffles[raffleId].tickets.length, msg.sender);
  }

  function getTicketsCount (uint256 raffleId) public view returns (uint256) {
    Raffle storage raffle = raffles[raffleId];
    return raffle.tickets.length;
  }

  function setWinner (uint256 raffleId) public {
    Raffle storage raffle = raffles[raffleId];
    require(raffle.startDate <= block.timestamp, "Raffle didn't start yet");
    require(raffle.endDate <= block.timestamp, "Raffle is running");
    uint256 winnerId = random(raffle.tickets.length);
    raffle.winner = raffle.tickets[winnerId].owner;
    raffle.status = Status.Finished;
  }

  function finishRaffle (uint256 raffleId) onlyOwner(raffleId) public {
    Raffle storage raffle = raffles[raffleId];
    raffle.endDate = block.timestamp;
    setWinner(raffleId);
  }

  function claimReward (uint256 raffleId) public payable {
    Raffle storage raffle = raffles[raffleId];
    require(raffle.winner == msg.sender, "This function is restricted to the raffle's winner");
    require(raffle.prizeBalance > 0, "This raffle hasn't prize");
    payable(msg.sender).transfer(raffle.prizeBalance);
    raffle.prizeBalance = 0;
  }
}
