// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title InteractionCounter
 * @dev Simple contract to track interactions on ARC Network
 * This contract allows users to increment a counter, which creates transactions
 * that can be tracked by the dApp
 */
contract InteractionCounter {
    // ---------- Custom errors (gas-efficient, explicit revert reasons) ----------
    error BatchSizeZero();
    error BatchSizeTooLarge(uint256 provided, uint256 max);

    // Mapping to store interaction count per address
    mapping(address => uint256) public interactionCount;

    // Total interactions across all users
    uint256 public totalInteractions;

    // Event emitted when an interaction occurs
    event Interaction(address indexed user, uint256 newCount, uint256 total);

    /**
     * @dev Increment interaction count for the caller
     * This creates a transaction that will be counted by the dApp
     */
    function interact() public {
        interactionCount[msg.sender]++;
        totalInteractions++;
        
        emit Interaction(msg.sender, interactionCount[msg.sender], totalInteractions);
    }
    
    /**
     * @dev Get interaction count for a specific address
     * @param user Address to check
     * @return count Number of interactions
     */
    function getInteractionCount(address user) public view returns (uint256) {
        return interactionCount[user];
    }
    
    /**
     * @dev Batch interact - allows multiple interactions in one transaction
     * @param times Number of interactions to perform
     */
    function batchInteract(uint256 times) public {
        // 1) Inputs: bounds
        if (times == 0) revert BatchSizeZero();
        if (times > 100) revert BatchSizeTooLarge(times, 100);

        for (uint256 i = 0; i < times; i++) {
            interactionCount[msg.sender]++;
            totalInteractions++;
        }
        
        emit Interaction(msg.sender, interactionCount[msg.sender], totalInteractions);
    }
}
