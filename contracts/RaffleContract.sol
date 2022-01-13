// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./SafeMath.sol";

contract RaffleContract {
  using SafeMath for uint256;

  address public admin;
  uint256 public adminFeePercent;
  uint256 public adminBalance;
  uint256 public rafflesCount;
  uint256 public rafflesExpiration;
  uint256 public totalClaimedReward;
  uint256 public totalClaimedOwner;

  enum Status {
    Active,
    Finished
  }

  struct Ticket {
    address owner;
    bool claimed;
    uint256 createdAt;
  }

  struct Raffle {
    Status status;
    string name;
    address owner;
    uint256 winner;
    uint256 ownerBalance;
    bool ownerBalanceClaimed;
    uint256 prizePercentage;
    uint256 prizeBalance;
    uint256 ticketPrice;
    uint256 ticketGoal;
    uint256 startDate;
    uint256 endDate;
    Ticket[] tickets;
  }

  mapping(uint256 => Raffle) public raffles;

  event RaffleCreated(uint256 id, string name);
  event RaffleFinished(uint256 id, string name);

  constructor() {
    admin = msg.sender;
    adminFeePercent = 5;
    rafflesCount = 0;
    rafflesExpiration = 30 days;
    totalClaimedOwner = 0;
    totalClaimedReward = 0;
  }

  modifier onlyAdmin() {
    require(msg.sender == admin, "This function is restricted to the admin");
    _;
  }

  modifier onlyOwner(uint256 _raffleId) {
    require(
      msg.sender == raffles[_raffleId].owner,
      "This function is restricted to the owner"
    );
    _;
  }

  modifier onlyActive(uint256 _raffleId) {
    require(
      raffles[_raffleId].status == Status.Active,
      "The raffle already finished"
    );
    _;
  }

  modifier onlyFinished(uint256 _raffleId) {
    require(
      raffles[_raffleId].status == Status.Finished,
      "The raffle is running"
    );
    _;
  }

  function generateRandomNumber(uint256 _maxValue)
    internal
    view
    returns(uint256) {
    return uint256(
      keccak256(
        abi.encodePacked(
          block.timestamp,
          msg.sender,
          block.difficulty
        )
      )
    ).mod(_maxValue);
  }

  function createRaffle(string memory _name, uint256 _prizePercentage, uint256 _ticketPrice, uint256 _ticketGoal) public {
    require(_prizePercentage <= 100, "Prize percentage must be 100 or lower");
    require(_prizePercentage >= 0, "Prize percentage must be 0 or greater");
    require(_ticketPrice >= 0.01 ether, "Ticket price must be 0.01 BNB or greater");
    require(_ticketGoal >= 10, "Ticket goal must be 10 or greater");
    Raffle storage raffle = raffles[rafflesCount++];
    raffle.status = Status.Active;
    raffle.name = _name;
    raffle.owner = msg.sender;
    raffle.ownerBalance = 0;
    raffle.ownerBalanceClaimed = false;
    raffle.prizePercentage = _prizePercentage;
    raffle.prizeBalance = 0;
    raffle.ticketPrice = _ticketPrice;
    raffle.ticketGoal = _ticketGoal;
    raffle.startDate = block.timestamp;
    raffle.endDate = block.timestamp + rafflesExpiration;
    raffle.tickets;
    emit RaffleCreated(rafflesCount, raffle.name);
  }

  function getRaffle(uint256 _raffleId) public view returns(Raffle memory) {
    return raffles[_raffleId];
  }

  function finishRaffle(uint256 _raffleId) internal {
    require(raffles[_raffleId].tickets.length > 0, "The raffle didnt have any tickets");
    Raffle storage raffle = raffles[_raffleId];
    uint256 winnerId = generateRandomNumber(raffle.tickets.length);
    raffle.status = Status.Finished;
    raffle.winner = winnerId;
    raffle.endDate = block.timestamp;
    emit RaffleFinished(_raffleId, raffle.name);
  }

  function checkWinner(uint256 _raffleId) public view returns (Ticket memory) {
    return raffles[_raffleId].tickets[raffles[_raffleId].winner];
  }

  function tryToFinish(uint256 _raffleId) onlyActive(_raffleId) public {
    if (raffles[_raffleId].tickets.length == raffles[_raffleId].ticketGoal) {
      finishRaffle(_raffleId);
    }
    if (raffles[_raffleId].endDate <= block.timestamp) {
      finishRaffle(_raffleId);
    }
  }

  function getTicket(uint256 _raffleId, uint256 _ticketId) public view returns(Ticket memory) {
    return raffles[_raffleId].tickets[_ticketId];
  }

  function getTickets(uint256 _raffleId) public view returns(Ticket[] memory) {
    return raffles[_raffleId].tickets;
  }

  function buyTicket(uint256 _raffleId, uint256 _ticketsTotal) onlyActive(_raffleId) public payable {
    require(_ticketsTotal >= 1, "You should buy one ticket at least");
    require(_ticketsTotal <= raffles[_raffleId].ticketGoal.sub(raffles[_raffleId].tickets.length), "Insufficient tickets available");
    require(msg.value >= raffles[_raffleId].ticketPrice.mul(_ticketsTotal), "Value is different than ticket price");

    Raffle storage raffle = raffles[_raffleId];
    uint256 fee = msg.value.mul(adminFeePercent).div(100);
    adminBalance += fee;
    uint256 totalBalance = msg.value.sub(fee);
    uint256 prizeBalance = totalBalance.mul(raffle.prizePercentage).div(100);
    uint256 ownerBalance = totalBalance.sub(prizeBalance);
    raffle.prizeBalance += prizeBalance;
    raffle.ownerBalance += ownerBalance;

    for (uint256 i = 0; i < _ticketsTotal; i++) {
      raffle.tickets.push(Ticket(msg.sender, false, block.timestamp));
    }

    tryToFinish(_raffleId);
  }

  function getTicketsCount(uint256 _raffleId) public view returns(uint256) {
    return raffles[_raffleId].tickets.length;
  }

  function claimReward(uint256 _raffleId) onlyFinished(_raffleId) public {
    Raffle storage raffle = raffles[_raffleId];
    Ticket storage ticket = raffle.tickets[raffle.winner];

    require(raffle.prizeBalance > 0, "This raffle hasn't prize");
    require(ticket.owner == msg.sender, "This function is restricted to the winner");
    require(ticket.claimed == false, "The reward already claimed");

    payable(ticket.owner).transfer(raffle.prizeBalance);

    ticket.claimed = true;
    totalClaimedReward += raffle.prizeBalance;
  }

  function claimOwnerBalance(uint256 _raffleId) onlyOwner(_raffleId) public {
    if (raffles[_raffleId].status == Status.Active) {
      tryToFinish(_raffleId);
    }

    require(raffles[_raffleId].status == Status.Finished, "The raffle is running");
    require(raffles[_raffleId].ownerBalance > 0, "This raffle hasn't prize");
    require(raffles[_raffleId].ownerBalanceClaimed == false, "The raffle balance already claimed");

    Raffle storage raffle = raffles[_raffleId];

    payable(raffle.owner).transfer(raffle.ownerBalance);

    raffle.ownerBalanceClaimed = true;
    totalClaimedOwner += raffle.ownerBalance;
  }

  function claimAdminBalance() onlyAdmin() public {
    require(adminBalance > 0, "You dont have any balance");
    payable(admin).transfer(adminBalance);
    adminBalance = 0;
  }

  function totalBalanceClaimed() public view returns(uint256) {
    return totalClaimedOwner + totalClaimedReward;
  }

  function updateRafflesExpiration(uint256 _newValue) onlyAdmin() public {
    rafflesExpiration = _newValue;
  }
}
