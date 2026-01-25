// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Leaderboard
 * @dev Simple contract to register users in the leaderboard
 * Each user can call mint() to register themselves
 * Emits events for frontend filtering
 */
contract Leaderboard {
    // Owner address
    address public owner;
    
    // Array of registered addresses
    address[] public registeredUsers;
    
    // Mapping to check if user is registered
    mapping(address => bool) public isRegistered;
    
    // Mapping to store registration timestamp
    mapping(address => uint256) public registrationTimestamp;
    
    // Mapping to store registration index in array
    mapping(address => uint256) public registrationIndex;
    
    // Total registrations
    uint256 public totalRegistrations;
    
    // Event emitted when a new user registers
    event Registered(address indexed user);
    
    // Evento adicional para compatibilidade (mantém NewEntry também)
    event NewEntry(
        address indexed user,
        uint256 timestamp,
        uint256 blockNumber,
        uint256 index
    );
    
    // Modifier to restrict functions to owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    /**
     * @dev Constructor
     * @param _owner Owner address
     */
    constructor(address _owner) {
        require(_owner != address(0), "Invalid owner address");
        owner = _owner;
    }
    
    /**
     * @dev Register user in leaderboard (mint function)
     * Can be called by any address to register themselves
     * Emits NewEntry event for frontend filtering
     */
    function mint() external {
        require(!isRegistered[msg.sender], "User already registered");
        
        // Register user
        isRegistered[msg.sender] = true;
        registrationTimestamp[msg.sender] = block.timestamp;
        registrationIndex[msg.sender] = registeredUsers.length;
        registeredUsers.push(msg.sender);
        totalRegistrations++;
        
        // Emit simple Registered event (as requested)
        emit Registered(msg.sender);
        
        // Also emit NewEntry for compatibility
        emit NewEntry(
            msg.sender,
            block.timestamp,
            block.number,
            registrationIndex[msg.sender]
        );
    }
    
    /**
     * @dev Get all registered users
     * @return Array of registered addresses
     */
    function getAllRegisteredUsers() external view returns (address[] memory) {
        return registeredUsers;
    }
    
    /**
     * @dev Get registered user at index
     * @param index Index in the array
     * @return User address at index
     */
    function getRegisteredUser(uint256 index) external view returns (address) {
        require(index < registeredUsers.length, "Index out of bounds");
        return registeredUsers[index];
    }
    
    /**
     * @dev Get registration info for a user
     * @param user Address to check
     * @return registered Whether user is registered
     * @return timestamp Registration timestamp (0 if not registered)
     * @return index Registration index in array (0 if not registered)
     */
    function getRegistrationInfo(address user) external view returns (
        bool registered,
        uint256 timestamp,
        uint256 index
    ) {
        return (
            isRegistered[user],
            registrationTimestamp[user],
            registrationIndex[user]
        );
    }
    
    /**
     * @dev Get total number of registered users
     * @return Total count
     */
    function getTotalUsers() external view returns (uint256) {
        return registeredUsers.length;
    }
    
    /**
     * @dev Transfer ownership (owner only)
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner address");
        owner = newOwner;
    }
}
