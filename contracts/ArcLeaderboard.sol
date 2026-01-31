// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ArcLeaderboard is Ownable {
    mapping(address => uint256) public score;
    mapping(address => bool) public registered;

    address[] public users;

    event UserRegistered(address indexed user);
    event ScoreUpdated(address indexed user, uint256 newScore);

    constructor() Ownable(msg.sender) {}

    function registerUser(address user) external onlyOwner {
        require(!registered[user], "Already registered");

        registered[user] = true;
        users.push(user);

        emit UserRegistered(user);
    }

    function addPoints(address user, uint256 amount) external onlyOwner {
        if (!registered[user]) {
            registered[user] = true;
            users.push(user);
            emit UserRegistered(user);
        }

        score[user] += amount;
        emit ScoreUpdated(user, score[user]);
    }

    function getUsersCount() external view returns (uint256) {
        return users.length;
    }

    function getUserAt(uint256 index) external view returns (address) {
        return users[index];
    }

    function getScore(address user) external view returns (uint256) {
        return score[user];
    }
}
