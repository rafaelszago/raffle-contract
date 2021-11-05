// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract RaffleContract {
  enum Status {
    NotStarted,
    Open,
    Closed,
    Completed
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
    uint256 startDate;
    uint256 endDate;
    uint256 ticketPrice;
    Ticket[] tickets;
  }

  address public owner;
  uint256 public rafflesCount;
  mapping(uint256 => Raffle) public raffles;

  constructor() {
    owner = msg.sender;
    rafflesCount = 0;
  }

  modifier onlyOwner(uint256 _raffleId) {
    Raffle storage raffle = raffles[_raffleId];

    require(
      msg.sender == raffle.owner,
      "This function is restricted to the raffle's owner"
    );
    _;
  }

  function createRaffle (
    string memory _name,
    uint256 _prizePercentage,
    uint256 _ticketPrice,
    uint256 _startDate,
    uint256 _endDate
  ) public {
    require(_prizePercentage <= 100, "Value must be 100 or lower");
    require(_prizePercentage >= 0, "Value must be 0 or greater");
    rafflesCount++;
    Raffle storage newRaffle = raffles[rafflesCount];
    newRaffle.id = rafflesCount;
    newRaffle.status = Status.NotStarted;
    newRaffle.name = _name;
    newRaffle.owner = msg.sender;
    newRaffle.winner = 0x0000000000000000000000000000000000000000;
    newRaffle.ownerBalance = 0;
    newRaffle.prizePercentage = _prizePercentage;
    newRaffle.prizeBalance = 0;
    newRaffle.startDate = _startDate;
    newRaffle.endDate = _endDate;
    newRaffle.ticketPrice = _ticketPrice;
    newRaffle.tickets;
  }

  function getRaffle (uint256 _raffleId) public view returns(Raffle memory) {
    return raffles[_raffleId];
  }

  function getTicket (
    uint256 _raffleId,
    uint256 _ticketId
  ) public
    view
    returns(Ticket memory) {
    Raffle memory raffle = raffles[_raffleId];
    return raffle.tickets[_ticketId];
  }

  function splitTicketValue (uint256 _raffleId, uint256 _value) internal {
    Raffle storage raffle = raffles[_raffleId];
    raffle.prizeBalance += (_value * raffle.prizePercentage) / 100;
    raffle.ownerBalance += _value - (_value * raffle.prizePercentage / 100);
  }

  function buyTicket (uint256 _raffleId) public payable {
    Raffle storage raffle = raffles[_raffleId];
    require(raffle.ticketPrice <= msg.value, "Value is lower than ticket price");
    require(raffle.startDate <= block.timestamp, "Raffle didn't start yet");
    require(raffle.endDate >= block.timestamp, "Raffle already finished");
    raffles[_raffleId].tickets.push(Ticket(msg.sender));
    splitTicketValue(_raffleId, msg.value);
  }

  function getTicketsCount (uint256 _raffleId) public view returns (uint256) {
    Raffle storage raffle = raffles[_raffleId];
    return raffle.tickets.length;
  }

  function setWinner (uint256 _raffleId) public {
    Raffle storage raffle = raffles[_raffleId];
    require(raffle.startDate <= block.timestamp, "Raffle didn't start yet");
    require(raffle.endDate <= block.timestamp, "Raffle is running");
    uint256 winnerId = random(raffle.tickets.length);
    raffle.winner = raffle.tickets[winnerId].owner;
    raffle.status = Status.Completed;
  }

  function finishRaffle (uint256 _raffleId) onlyOwner(_raffleId) public {
    Raffle storage raffle = raffles[_raffleId];
    raffle.endDate = block.timestamp;
    setWinner(_raffleId);
  }

  function claimReward (uint256 _raffleId) public payable {
    Raffle storage raffle = raffles[_raffleId];
    require(raffle.winner == msg.sender, "This function is restricted to the raffle's winner");
    require(raffle.prizeBalance > 0, "This raffle hasn't prize");
    payable(msg.sender).transfer(raffle.prizeBalance);
    raffle.prizeBalance = 0;
  }

  function random(uint _maxValue) internal view returns (uint) {
    return uint(
      keccak256(
        abi.encodePacked(
          block.timestamp,
          msg.sender,
          block.difficulty
        )
      )
    ) % _maxValue;
  }
}
