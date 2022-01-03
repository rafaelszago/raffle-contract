// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./SafeMath.sol";

contract RaffleContract {
  using SafeMath for uint256;

  address public admin;
  uint256 public adminFeePercent;
  uint256 private adminBalance;
  uint256 public rafflesCount;
  uint256 public totalClaimedReward;
  uint256 public totalClaimedOwner;

  mapping(uint256 => Raffle) public raffles;

  enum Status {
    Active,
    Finished,
    Completed
  }

  struct Ticket {
    address owner;
    bool claimed;
    uint256 createdAt;
  }

  struct Raffle {
    uint256 id;
    Status status;
    string name;
    address owner;
    uint256 winner;
    uint256 ownerBalance;
    uint256 prizePercentage;
    uint256 prizeBalance;
    uint256 ticketPrice;
    uint256 ticketGoal;
    uint256 startDate;
    uint256 endDate;
    Ticket[] tickets;
  }

  // Raffle Events
  event RaffleCreated(uint256 id, string name);
  event RaffleFinished(uint256 id, string name);
  event TicketCreated(uint256 id, address owner);
  event WinnerDefined(uint256 raffleId, address winner);
  event RewardBalanceClaimed(uint256 raffleId, uint256 prizeBalance);
  event OwnerBalanceClaimed(uint256 raffleId, uint256 ownerBalance);

  constructor() {
    admin = msg.sender;
    adminFeePercent = 5;
    rafflesCount = 0;
    totalClaimedOwner = 0;
    totalClaimedReward = 0;
  }

  // Modifiers
  modifier onlyAdmin() {
    require(msg.sender == admin, "This function is restricted to the admin");
    _;
  }

  modifier onlyOwner(uint256 _raffleId) {
    require(
      msg.sender == raffles[_raffleId].owner,
      "This function is restricted to the raffle's owner"
    );
    _;
  }

  modifier onlyActive(uint256 _raffleId) {
    require(raffles[_raffleId].startDate <= block.timestamp, "The raffle didn't started");
    require(raffles[_raffleId].endDate >= block.timestamp, "The raffle already finished");
    require(raffles[_raffleId].status == Status.Active, "The raffle already finished");
    _;
  }

  modifier onlyFinished(uint256 _raffleId) {
    require(raffles[_raffleId].startDate <= block.timestamp, "Raffle didn't start yet");
    require(raffles[_raffleId].endDate <= block.timestamp, "Raffle is running");
    require(raffles[_raffleId].status == Status.Finished, "Raffle is running");
    _;
  }

  // Internal functions
  function generateRandomNumber(uint256 _maxValue) internal view returns (uint256) {
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

  function splitTicketValue(uint256 _raffleId, uint256 _value) internal {
    Raffle storage raffle = raffles[_raffleId];
    uint256 fee = _value.mul(adminFeePercent).div(100);
    adminBalance += fee;
    uint256 valueTotal = _value.sub(fee);
    uint256 prizeBalance = valueTotal.mul(raffle.prizePercentage).div(100);
    uint256 ownerBalance = valueTotal.sub(prizeBalance);
    raffle.prizeBalance += prizeBalance;
    raffle.ownerBalance += ownerBalance;
  }

  // Raffle functions
  function createRaffle(string memory _name, uint256 _prizePercentage, uint256 _ticketPrice, uint256 _ticketGoal) public {
    require(_prizePercentage <= 100, "Prize percentage must be 100 or lower");
    require(_prizePercentage >= 0, "Prize percentage must be 0 or greater");
    require(_ticketGoal >= 10, "Ticket goal must be 10 or greater");
    require(_ticketPrice >= 0.01 ether, "Ticket price must be 0.01 BNB or greater");

    rafflesCount++;

    Raffle storage raffle = raffles[rafflesCount];
    raffle.id = rafflesCount;
    raffle.status = Status.Active;
    raffle.name = _name;
    raffle.owner = msg.sender;
    raffle.ownerBalance = 0;
    raffle.prizePercentage = _prizePercentage;
    raffle.prizeBalance = 0;
    raffle.ticketPrice = _ticketPrice;
    raffle.ticketGoal = _ticketGoal;
    raffle.startDate = block.timestamp;
    raffle.endDate = block.timestamp + 30 days;
    raffle.tickets;

    emit RaffleCreated(raffle.id, raffle.name);
  }

  function getRaffle(uint256 _raffleId) public view returns(Raffle memory) {
    return raffles[_raffleId];
  }

  function finishRaffle(uint256 _raffleId) internal {
    require(raffles[_raffleId].tickets.length > 0, "Raffle didn't have any ticket");
    require(raffles[_raffleId].tickets.length == raffles[_raffleId].ticketGoal, "Raffle didn't have any ticket");

    Raffle storage raffle = raffles[_raffleId];
    raffle.status = Status.Finished;
    raffle.endDate = block.timestamp;

    emit RaffleFinished(_raffleId, raffle.name);
  }

  function setWinner(uint256 _raffleId) onlyFinished(_raffleId) internal {
    uint256 winnerId = generateRandomNumber(raffles[_raffleId].tickets.length);
    raffles[_raffleId].winner = winnerId;

    emit WinnerDefined(_raffleId, raffles[_raffleId].tickets[winnerId].owner);
  }

  function checkWinner(uint256 _raffleId) onlyFinished(_raffleId) public view returns (Ticket memory) {
    Raffle storage raffle = raffles[_raffleId];
    return raffles[_raffleId].tickets[raffle.winner];
  }

  // Ticket functions
  function getTicket(uint256 _raffleId, uint256 _ticketId) public view returns(Ticket memory) {
    Raffle memory raffle = raffles[_raffleId];
    return raffle.tickets[_ticketId];
  }

  function getTickets(uint256 _raffleId) public view returns(Ticket[] memory) {
    Raffle storage raffle = raffles[_raffleId];
    return raffle.tickets;
  }

  function buyTicket(uint256 _raffleId, uint256 _ticketsTotal) onlyActive(_raffleId) public payable {
    require(raffles[_raffleId].ticketPrice.mul(_ticketsTotal) <= msg.value, "Value is lower than ticket price");
    require(_ticketsTotal >= 1, "You must buy one ticket at least");
    require(_ticketsTotal <= raffles[_raffleId].ticketGoal.sub(raffles[_raffleId].tickets.length), "Insufficient tickets available");

    if (_ticketsTotal > 1) {
      for (uint256 i = 0; i < _ticketsTotal; i++) {
        addTicket(_raffleId, msg.sender);
        splitTicketValue(_raffleId, msg.value.div(_ticketsTotal));
      }
    } else {
      addTicket(_raffleId, msg.sender);
      splitTicketValue(_raffleId, msg.value);
    }
  }

  function addTicket(uint256 _raffleId, address _owner) internal {
    raffles[_raffleId].tickets.push(Ticket(_owner, false, block.timestamp));

    emit TicketCreated(raffles[_raffleId].tickets.length, msg.sender);

    uint256 raffleTicketsTotal = raffles[_raffleId].tickets.length;
    uint256 raffleTicketGoal = raffles[_raffleId].ticketGoal;

    if (raffleTicketsTotal == raffleTicketGoal) {
      finishRaffle(_raffleId);
      setWinner(_raffleId);
    }
  }

  function getTicketsCount(uint256 _raffleId) public view returns (uint256) {
    Raffle storage raffle = raffles[_raffleId];
    return raffle.tickets.length;
  }

  // Claim functions
  function claimReward(uint256 _raffleId) onlyFinished(_raffleId) public payable {
    Raffle storage raffle = raffles[_raffleId];
    Ticket storage ticket = raffle.tickets[raffle.winner];

    require(raffle.prizeBalance > 0, "This raffle hasn't prize");
    require(ticket.owner == msg.sender, "This function is restricted to the raffle's winner");
    require(ticket.claimed == false, "The reward already claimed");

    payable(ticket.owner).transfer(raffle.prizeBalance);

    ticket.claimed = true;
    totalClaimedReward += raffle.prizeBalance;

    emit RewardBalanceClaimed(_raffleId, raffle.prizeBalance);
  }

  function claimOwnerBalance(uint256 _raffleId) onlyOwner(_raffleId) onlyFinished(_raffleId) public {
    Raffle storage raffle = raffles[_raffleId];

    require(raffle.ownerBalance > 0, "This raffle hasn't prize");
    require(raffle.status == Status.Finished, "The raffle balance already claimed");

    payable(raffle.owner).transfer(raffle.ownerBalance);

    emit OwnerBalanceClaimed(_raffleId, raffle.ownerBalance);

    raffle.status = Status.Completed;
    totalClaimedOwner += raffle.ownerBalance;
  }

  function claimAdminBalance() onlyAdmin() public {
    require(adminBalance > 0, "Raffle didnt have any fee");
    payable(admin).transfer(adminBalance);
    adminBalance = 0;
  }
}
