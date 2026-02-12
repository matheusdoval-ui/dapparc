// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LeaderboardRegistry
 * @dev Simple contract to register wallets for leaderboard participation
 * Requires a simple on-chain action (function call) to register
 * Generates events and changes state to prove real usage
 */
contract LeaderboardRegistry {
    // ---------- Custom errors (gas-efficient, explicit revert reasons) ----------
    error NotAuthorized(address caller);
    error ZeroAddress();
    error WalletAlreadyRegistered();

    // Owner address
    address public owner;

    // Track registered addresses: address => is registered
    mapping(address => bool) public isRegistered;

    // Track total registrations
    uint256 public totalRegistrations;

    // Track registration timestamp
    mapping(address => uint256) public registrationTimestamp;

    // Event emitted when a wallet registers
    event WalletRegistered(
        address indexed wallet,
        uint256 timestamp,
        uint256 blockNumber
    );

    // Modifier to restrict functions to owner (explicit revert for early failure)
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotAuthorized(msg.sender);
        _;
    }

    /**
     * @dev Constructor
     * @param _owner Owner address
     */
    constructor(address _owner) {
        if (_owner == address(0)) revert ZeroAddress();
        owner = _owner;
    }

    /**
     * @dev Register wallet for leaderboard
     * Simple on-chain action that generates event and changes state
     * No payment required, just gas for transaction
     */
    function register() external {
        // 1) State: not already registered
        if (isRegistered[msg.sender]) revert WalletAlreadyRegistered();

        // Change state
        isRegistered[msg.sender] = true;
        registrationTimestamp[msg.sender] = block.timestamp;
        totalRegistrations++;
        
        // Generate event
        emit WalletRegistered(msg.sender, block.timestamp, block.number);
    }
    
    /**
     * @dev Check if a wallet is registered
     * @param wallet Address to check
     * @return true if wallet is registered
     */
    function checkRegistration(address wallet) external view returns (bool) {
        return isRegistered[wallet];
    }
    
    /**
     * @dev Get registration info for a wallet
     * @param wallet Address to check
     * @return registered Whether wallet is registered
     * @return timestamp Registration timestamp (0 if not registered)
     */
    function getRegistrationInfo(address wallet) external view returns (bool registered, uint256 timestamp) {
        return (isRegistered[wallet], registrationTimestamp[wallet]);
    }
    
    /**
     * @dev Transfer ownership (owner only)
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        // 1) Permission: onlyOwner (modifier)
        if (newOwner == address(0)) revert ZeroAddress();
        owner = newOwner;
    }
}
