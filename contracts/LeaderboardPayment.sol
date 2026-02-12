// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LeaderboardPayment
 * @dev Contract to receive payments for leaderboard access
 * Accepts USDC and EURC tokens with minimum payment of 0.5 tokens
 */
contract LeaderboardPayment {
    // ---------- Custom errors (full defensive validation, no silent reverts) ----------
    error NotAuthorized(address caller);
    error ZeroAddress();
    error ZeroAmount();
    error AmountBelowMinimum();
    error InsufficientAllowance(uint256 allowance, uint256 required);
    error InsufficientBalance(uint256 balance, uint256 required);
    error NoFundsToWithdraw();
    error InsufficientContractBalance(uint256 available, uint256 requested);

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

    // Modifier to restrict functions to owner (explicit revert for early failure)
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotAuthorized(msg.sender);
        _;
    }

    /**
     * @dev Constructor
     * @param _usdc USDC token contract address
     * @param _eurc EURC token contract address
     * @param _owner Owner address (developer wallet)
     */
    constructor(address _usdc, address _eurc, address _owner) {
        if (_usdc == address(0)) revert ZeroAddress();
        if (_eurc == address(0)) revert ZeroAddress();
        if (_owner == address(0)) revert ZeroAddress();

        USDC = _usdc;
        EURC = _eurc;
        owner = _owner;
    }

    /**
     * @dev Pay leaderboard fee with USDC
     * @param amount Amount of USDC to pay (must be >= MINIMUM_PAYMENT)
     */
    function payWithUSDC(uint256 amount) external {
        // 1) Input: amount (zero then minimum)
        if (amount == 0) revert ZeroAmount();
        if (amount < MINIMUM_PAYMENT) revert AmountBelowMinimum();
        // 2) ERC20: balance then allowance (before transferFrom)
        uint256 balance = IERC20(USDC).balanceOf(msg.sender);
        if (balance < amount) revert InsufficientBalance(balance, amount);
        uint256 allowed = IERC20(USDC).allowance(msg.sender, address(this));
        if (allowed < amount) revert InsufficientAllowance(allowed, amount);

        // Transfer USDC from sender to this contract
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
        // 1) Input: amount (zero then minimum)
        if (amount == 0) revert ZeroAmount();
        if (amount < MINIMUM_PAYMENT) revert AmountBelowMinimum();
        // 2) ERC20: balance then allowance (before transferFrom)
        uint256 balance = IERC20(EURC).balanceOf(msg.sender);
        if (balance < amount) revert InsufficientBalance(balance, amount);
        uint256 allowed = IERC20(EURC).allowance(msg.sender, address(this));
        if (allowed < amount) revert InsufficientAllowance(allowed, amount);

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
        // 1) Permission: onlyOwner (modifier)
        uint256 balance = IERC20(USDC).balanceOf(address(this));
        uint256 withdrawAmount = amount == 0 ? balance : amount;

        if (withdrawAmount == 0) revert NoFundsToWithdraw();
        if (withdrawAmount > balance) revert InsufficientContractBalance(balance, withdrawAmount);

        IERC20(USDC).transfer(owner, withdrawAmount);
        
        emit FundsWithdrawn(USDC, withdrawAmount, owner);
    }
    
    /**
     * @dev Withdraw EURC funds (owner only)
     * @param amount Amount to withdraw (0 = all)
     */
    function withdrawEURC(uint256 amount) external onlyOwner {
        // 1) Permission: onlyOwner (modifier)
        uint256 balance = IERC20(EURC).balanceOf(address(this));
        uint256 withdrawAmount = amount == 0 ? balance : amount;

        if (withdrawAmount == 0) revert NoFundsToWithdraw();
        if (withdrawAmount > balance) revert InsufficientContractBalance(balance, withdrawAmount);

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
        if (newOwner == address(0)) revert ZeroAddress();
        owner = newOwner;
    }
}

// Minimal ERC-20 interface (includes allowance for explicit pre-transfer checks)
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}
