// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract RaffleContract {
  struct Ticket {
    address owner;
  }

  struct Raffle {
    uint256 raffleId;
    string raffleName;
    uint256 fee;
    uint256 bonus;
    uint256 bonusWinnersTotal;
    uint256 ticketPrice;
    uint256 balance;
    Ticket[] buyers;
    address payable winner;
    uint256 buyersCount;
    uint256 expireDate;
    bool active;
  }

  uint256 public rafflesCount;
  mapping(uint256 => Raffle) public allRaffles;

  function createRaffle (string memory _raffleName, uint256 _ticketPrice, uint256 _expireDate) external {
    rafflesCount++;
    Raffle memory newRaffle = allRaffles[rafflesCount];
    newRaffle.raffleId = rafflesCount;
    newRaffle.raffleName = _raffleName;
    newRaffle.ticketPrice = _ticketPrice;
    newRaffle.expireDate = _expireDate;
    newRaffle.active = true;
  }

  function buyRaffle (uint256 _raffleId) external payable {
    Raffle memory raffle = allRaffles[_raffleId];
    require(raffle.active = true);
    require(msg.value == raffle.ticketPrice);
    raffle.balance += msg.value;
    raffle.buyersCount++;
    Ticket memory ticket = raffle.buyers[raffle.buyersCount];
    ticket.owner = msg.sender;
  }
}
