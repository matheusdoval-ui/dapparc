// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ArcLeaderboard is Ownable {
    // ---------- Custom errors (full defensive validation, no silent reverts) ----------
    // Permission: onlyOwner from Ownable (OwnableUnauthorizedAccount)
    error ZeroAddress();
    error ZeroAmount();
    error AlreadyRegistered();
    error UserNotRegistered();
    error InvalidId(uint256 id);

    mapping(address => uint256) public score;
    mapping(address => bool) public registered;

    address[] public users;

    event UserRegistered(address indexed user);
    event ScoreUpdated(address indexed user, uint256 newScore);

    constructor() Ownable(msg.sender) {}

    function registerUser(address user) external onlyOwner {
        // 1) Permission: onlyOwner (modifier)
        // 2) Inputs: address and state
        if (user == address(0)) revert ZeroAddress();
        if (registered[user]) revert AlreadyRegistered();

        registered[user] = true;
        users.push(user);

        emit UserRegistered(user);
    }

    function addPoints(address user, uint256 amount) external onlyOwner {
<<<<<<< HEAD
        if (!registered[user]) {
            registered[user] = true;
            users.push(user);
            emit UserRegistered(user);
        }
=======
        // 1) Permission: onlyOwner (modifier)
        // 2) Inputs: address, amount, state
        if (user == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (!registered[user]) revert UserNotRegistered();
>>>>>>> 3813cb1 (deploy)

        score[user] += amount;
        emit ScoreUpdated(user, score[user]);
    }

    function getUsersCount() external view returns (uint256) {
        return users.length;
    }

    function getUserAt(uint256 index) external view returns (address) {
        if (index >= users.length) revert InvalidId(index);
        return users[index];
    }

    function getScore(address user) external view returns (uint256) {
        return score[user];
    }
}
