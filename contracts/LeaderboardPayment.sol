// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LeaderboardPayment
 * @dev Contract to receive payments for leaderboard access
 * Accepts USDC and EURC tokens with minimum payment of 0.5 tokens
 */
contract LeaderboardPayment {
    // Developer wallet address (owner)
    address public owner;
    
    // Minimum payment amount: 0.5 USDC/EURC (6 decimals = 500000)
    uint256 public constant MINIMUM_PAYMENT = 500000; // 0.5 * 10^6
    
    // Accepted token addresses
    address public immutable USDC;
    address public immutable EURC;
    
    // Track payments: address => has paid
    mapping(address => bool) public hasPaid;
    
    // Track total payments received
    uint256 public totalPayments;
    
    // Event emitted when a payment is received
    event PaymentReceived(
        address indexed payer,
        address indexed token,
        uint256 amount,
        uint256 timestamp
    );
    
    // Event emitted when owner withdraws funds
    event FundsWithdrawn(
        address indexed token,
        uint256 amount,
        address indexed to
    );
    
    // Modifier to restrict functions to owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    /**
     * @dev Constructor
     * @param _usdc USDC token contract address
     * @param _eurc EURC token contract address
     * @param _owner Owner address (developer wallet)
     */
    constructor(address _usdc, address _eurc, address _owner) {
        require(_usdc != address(0), "Invalid USDC address");
        require(_eurc != address(0), "Invalid EURC address");
        require(_owner != address(0), "Invalid owner address");
        
        USDC = _usdc;
        EURC = _eurc;
        owner = _owner;
    }
    
    /**
     * @dev Pay leaderboard fee with USDC
     * @param amount Amount of USDC to pay (must be >= MINIMUM_PAYMENT)
     */
    function payWithUSDC(uint256 amount) external {
        require(amount >= MINIMUM_PAYMENT, "Amount below minimum payment");
        
        // Transfer USDC from sender to this contract
        // Using standard ERC-20 transferFrom pattern
        // User must approve this contract first
        IERC20(USDC).transferFrom(msg.sender, address(this), amount);
        
        // Mark as paid
        if (!hasPaid[msg.sender]) {
            hasPaid[msg.sender] = true;
            totalPayments++;
        }
        
        emit PaymentReceived(msg.sender, USDC, amount, block.timestamp);
    }
    
    /**
     * @dev Pay leaderboard fee with EURC
     * @param amount Amount of EURC to pay (must be >= MINIMUM_PAYMENT)
     */
    function payWithEURC(uint256 amount) external {
        require(amount >= MINIMUM_PAYMENT, "Amount below minimum payment");
        
        // Transfer EURC from sender to this contract
        IERC20(EURC).transferFrom(msg.sender, address(this), amount);
        
        // Mark as paid
        if (!hasPaid[msg.sender]) {
            hasPaid[msg.sender] = true;
            totalPayments++;
        }
        
        emit PaymentReceived(msg.sender, EURC, amount, block.timestamp);
    }
    
    /**
     * @dev Check if an address has paid
     * @param payer Address to check
     * @return true if address has paid at least once
     */
    function checkPayment(address payer) external view returns (bool) {
        return hasPaid[payer];
    }
    
    /**
     * @dev Withdraw USDC funds (owner only)
     * @param amount Amount to withdraw (0 = all)
     */
    function withdrawUSDC(uint256 amount) external onlyOwner {
        uint256 balance = IERC20(USDC).balanceOf(address(this));
        uint256 withdrawAmount = amount == 0 ? balance : amount;
        
        require(withdrawAmount > 0, "No funds to withdraw");
        require(withdrawAmount <= balance, "Insufficient balance");
        
        IERC20(USDC).transfer(owner, withdrawAmount);
        
        emit FundsWithdrawn(USDC, withdrawAmount, owner);
    }
    
    /**
     * @dev Withdraw EURC funds (owner only)
     * @param amount Amount to withdraw (0 = all)
     */
    function withdrawEURC(uint256 amount) external onlyOwner {
        uint256 balance = IERC20(EURC).balanceOf(address(this));
        uint256 withdrawAmount = amount == 0 ? balance : amount;
        
        require(withdrawAmount > 0, "No funds to withdraw");
        require(withdrawAmount <= balance, "Insufficient balance");
        
        IERC20(EURC).transfer(owner, withdrawAmount);
        
        emit FundsWithdrawn(EURC, withdrawAmount, owner);
    }
    
    /**
     * @dev Get contract balance for a token
     * @param token Token address (USDC or EURC)
     * @return balance Token balance
     */
    function getBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
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

// Minimal ERC-20 interface
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}
