// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract RaffleContract {
  struct Ticket {
    address owner;
  }

  struct Raffle {
    uint256 id;
    string name;
    string url;
    address owner;
    uint256 ownerBalance;
    uint256 prizePercentage;
    uint256 prizeWinnersCount;
    uint256 prizeBalance;
    uint256 startDate;
    uint256 endDate;
    uint256 ticketPrice;
    uint256 ticketsCount;
  }

  uint256 public rafflesCount;
  mapping(uint256 => Raffle) public raffles;
  mapping(uint256 => mapping (uint256 => Ticket)) public tickets;
  mapping(uint256 => mapping (uint256 => Ticket)) public winners;

  constructor() {
    rafflesCount = 0;
  }

  function createRaffle (
    string memory _name, 
    string memory _url, 
    uint256 _prizePercentage,
    uint256 _prizeWinnersCount,
    uint256 _ticketPrice, 
    uint256 _startDate,
    uint256 _endDate
  ) public {
    rafflesCount++;
    Raffle storage newRaffle = raffles[rafflesCount];
    newRaffle.id = rafflesCount;
    newRaffle.name = _name;
    newRaffle.url = _url;
    newRaffle.owner = msg.sender;
    newRaffle.ownerBalance = 0;
    newRaffle.prizePercentage = _prizePercentage;
    newRaffle.prizeWinnersCount = _prizeWinnersCount;
    newRaffle.prizeBalance = 0;
    newRaffle.startDate = _startDate;
    newRaffle.endDate = _endDate;
    newRaffle.ticketPrice = _ticketPrice;
    newRaffle.ticketsCount = 0;
  }

  function getRaffle (
    uint256 _raffleId
  ) public 
    view 
    returns(Raffle memory) {
    return raffles[_raffleId];
  }
  
  function getTicket (
    uint256 _raffleId, 
    uint256 _ticketId
  ) public 
    view 
    returns(Ticket memory) {
    return tickets[_raffleId][_ticketId];
  }

  function splitTicketValue (uint256 _raffleId, uint256 _value) internal {
    Raffle storage raffle = raffles[_raffleId];
    raffle.prizeBalance += (_value * raffle.prizePercentage) / 100;
    raffle.ownerBalance += _value - (_value * raffle.prizePercentage / 100);
  }

  function buyTicket (uint256 _raffleId) public payable {
    Raffle storage raffle = raffles[_raffleId];
    require(raffle.ticketPrice <= msg.value, "Value is lower than ticket price");
    require(raffle.endDate >= block.timestamp, "Raffle already finished");
    require(raffle.startDate <= block.timestamp, "Raffle didn't start yet");
    raffle.ticketsCount++;
    tickets[_raffleId][raffle.ticketsCount].owner = msg.sender;
    splitTicketValue(_raffleId, msg.value);
  }

  function setWinners () private {

  }
  
  function random(uint _maxValue) internal view {
    uint(
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
