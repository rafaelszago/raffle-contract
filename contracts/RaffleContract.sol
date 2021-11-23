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
    uint256 prizePercentage;
    uint256 prizeBalance;
    uint256 ticketPrice;
    uint256 ticketGoal;
    uint256 startDate;
    uint256 endDate;
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
  event RaffleFinished(uint256 id, string name);
  event TicketCreated(uint256 id, address owner);
  event WinnerDefined(uint256 raffleId, address winner);
  event RewardClaimed(uint256 raffleId, uint256 prizeBalance);
  event OwnerBalanceClaimed(uint256 raffleId, uint256 ownerBalance);

  modifier onlyOwner(uint256 raffleId) {
    require(
      msg.sender == raffles[raffleId].owner,
      "This function is restricted to the raffle's owner"
    );
    _;
  }

  modifier onlyActive(uint256 raffleId) {
    require(raffles[raffleId].startDate <= block.timestamp, "The raffle didn't started");
    require(raffles[raffleId].endDate >= block.timestamp, "The raffle already finished");
    _;
  }

  modifier onlyFinished(uint256 raffleId) {
    require(raffles[raffleId].startDate <= block.timestamp, "Raffle didn't start yet");
    require(raffles[raffleId].endDate <= block.timestamp, "Raffle is running");
    require(raffles[raffleId].status == Status.Finished, "Raffle is running");
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

  function createRaffle (string memory name, uint256 prizePercentage, uint256 ticketPrice, uint256 ticketGoal) public {
    require(prizePercentage <= 100, "Prize percentage must be 100 or lower");
    require(prizePercentage >= 0, "Prize percentage must be 0 or greater");
    require(ticketPrice >= 0.01 ether, "Ticket price must be 0.01 BNB or greater");
    rafflesCount++;
    Raffle storage newRaffle = raffles[rafflesCount];
    newRaffle.id = rafflesCount;
    newRaffle.status = Status.Active;
    newRaffle.name = name;
    newRaffle.owner = msg.sender;
    newRaffle.winner = 0x0000000000000000000000000000000000000000;
    newRaffle.ownerBalance = 0;
    newRaffle.prizePercentage = prizePercentage;
    newRaffle.prizeBalance = 0;
    newRaffle.ticketPrice = ticketPrice;
    newRaffle.ticketGoal = ticketGoal;
    newRaffle.startDate = block.timestamp;
    newRaffle.endDate = block.timestamp + 30 days;
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

  function buyTicket (uint256 raffleId) onlyActive(raffleId) public payable {
    require(raffles[raffleId].ticketPrice <= msg.value, "Value is lower than ticket price");
    raffles[raffleId].tickets.push(Ticket(msg.sender));
    splitTicketValue(raffleId, msg.value);
    emit TicketCreated(raffles[raffleId].tickets.length, msg.sender);
  }

  function getTicketsCount (uint256 raffleId) public view returns (uint256) {
    Raffle storage raffle = raffles[raffleId];
    return raffle.tickets.length;
  }

  function setWinner (uint256 raffleId) onlyFinished(raffleId) public {
    Raffle storage raffle = raffles[raffleId];
    uint256 winnerId = random(raffle.tickets.length);
    raffle.winner = raffle.tickets[winnerId].owner;

    emit WinnerDefined(raffleId, raffle.winner);
  }

  function finishRaffle (uint256 raffleId) onlyOwner(raffleId) public {
    require(raffles[raffleId].tickets.length > 0, "Raffle didn't have any ticket");

    Raffle storage raffle = raffles[raffleId];
    raffle.status = Status.Finished;
    raffle.endDate = block.timestamp;

    emit RaffleFinished(raffleId, raffle.name);
  }

  function claimReward (uint256 raffleId) public payable {
    require(raffles[raffleId].winner == msg.sender, "This function is restricted to the raffle's winner");
    require(raffles[raffleId].prizeBalance > 0, "This raffle hasn't prize");

    Raffle storage raffle = raffles[raffleId];

    payable(msg.sender).transfer(raffle.prizeBalance);

    emit RewardClaimed(raffleId, raffle.prizeBalance);

    raffle.prizeBalance = 0;
  }

  function claimOwnerBalance (uint256 raffleId) onlyOwner(raffleId) onlyFinished(raffleId) public payable {
    require(raffles[raffleId].ownerBalance > 0, "This raffle hasn't prize");

    Raffle storage raffle = raffles[raffleId];
    payable(msg.sender).transfer(raffle.prizeBalance);

    emit OwnerBalanceClaimed(raffleId, raffle.ownerBalance);

    raffle.ownerBalance = 0;
  }
}
