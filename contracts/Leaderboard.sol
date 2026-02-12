// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Leaderboard
 * @dev Minimal contract for game scores. Emits ScoreSubmitted so the indexer can persist leaderboard.
 */
contract Leaderboard {
    event ScoreSubmitted(address indexed player, uint256 score);

    mapping(address => uint256) public bestScore;
    address[] private _players;

    function getAllPlayers() external view returns (address[] memory) {
        return _players;
    }

    function scores(address addr) external view returns (uint256) {
        return bestScore[addr];
    }

    function submitScore(uint256 score) external {
        if (score > bestScore[msg.sender]) {
            bestScore[msg.sender] = score;
        }
        bool found;
        for (uint256 i = 0; i < _players.length; i++) {
            if (_players[i] == msg.sender) {
                found = true;
                break;
            }
        }
        if (!found) _players.push(msg.sender);
        emit ScoreSubmitted(msg.sender, score);
    }
}
