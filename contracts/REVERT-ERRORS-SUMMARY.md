# Full Defensive Validation – Custom Errors Summary

## 1. Search result: `require(`, `revert(`, `assert(`

**No** `require(`, `revert(`, or `assert(` without a revert message or custom error exist in project Solidity files. All contracts use the pattern:

```solidity
if (condition) revert CustomError(...);
```

---

## 2. Custom errors defined (by contract)

### ArcLeaderboard.sol
- `ZeroAddress()` – invalid user/address
- `ZeroAmount()` – addPoints amount zero
- `AlreadyRegistered()` – registerUser duplicate
- `UserNotRegistered()` – addPoints target not registered
- `InvalidId(uint256 id)` – getUserAt index out of bounds  
- Permission: `onlyOwner` from OpenZeppelin Ownable → `OwnableUnauthorizedAccount(address)`

### MeuTokenARC.sol
- `ZeroAddress()` – generic zero address
- `ZeroAmount()` – transfer/transferFrom amount zero
- `TransferToZeroAddress()` – transfer/transferFrom to address(0)
- `ApproveToZeroAddress()` – approve spender address(0)
- `TransferFromZeroAddress()` – transferFrom from address(0)
- `InsufficientBalance(uint256 balance, uint256 required)` – before transfer/transferFrom
- `InsufficientAllowance(uint256 allowance, uint256 required)` – before transferFrom

### LeaderboardPayment.sol
- `NotAuthorized(address caller)` – onlyOwner modifier
- `ZeroAddress()` – constructor, transferOwnership, newOwner
- `ZeroAmount()` – payWithUSDC/payWithEURC amount == 0
- `AmountBelowMinimum()` – amount < MINIMUM_PAYMENT
- `InsufficientAllowance(uint256 allowance, uint256 required)` – before ERC20 transferFrom
- `InsufficientBalance(uint256 balance, uint256 required)` – payer balance before transferFrom
- `NoFundsToWithdraw()` – withdraw amount 0
- `InsufficientContractBalance(uint256 available, uint256 requested)` – withdraw > balance

### Leaderboard.sol
- `NotAuthorized(address caller)` – onlyOwner modifier
- `ZeroAddress()` – constructor, transferOwnership
- `UserAlreadyRegistered()` – mint() duplicate
- `InvalidId(uint256 id)` – getRegisteredUser index out of bounds

### LeaderboardRegistry.sol
- `NotAuthorized(address caller)` – onlyOwner modifier
- `ZeroAddress()` – constructor, transferOwnership
- `WalletAlreadyRegistered()` – register() duplicate

### ArcProofOfActivity.sol
- `TooSoonToProveActivity(uint256 earliestBlockAt)` – anti-spam cooldown

### InteractionCounter.sol
- `BatchSizeZero()` – batchInteract(times == 0)
- `BatchSizeTooLarge(uint256 provided, uint256 max)` – batchInteract(times > 100)

---

## 3. Where silent reverts existed before (pre-refactor)

Before the refactor, the following would have reverted with **no message** (e.g. "Revert reason: 0x") if the code had used bare `require(condition)` or `assert(condition)`:

| Contract             | Location              | Previous risk (if require/assert had been used) | Custom error now used |
|----------------------|-----------------------|--------------------------------------------------|------------------------|
| ArcLeaderboard       | registerUser          | onlyOwner (via Ownable)                          | OwnableUnauthorizedAccount (OZ) |
| ArcLeaderboard       | registerUser          | user == address(0), already registered            | ZeroAddress, AlreadyRegistered |
| ArcLeaderboard       | addPoints             | onlyOwner, zero address/amount, not registered   | OZ + ZeroAddress, ZeroAmount, UserNotRegistered |
| ArcLeaderboard       | getUserAt             | index >= length                                  | InvalidId(index) |
| MeuTokenARC          | transfer              | to == 0, amount == 0, balance < amount           | TransferToZeroAddress, ZeroAmount, InsufficientBalance |
| MeuTokenARC          | transferFrom          | from/to == 0, amount == 0, balance, allowance   | TransferFromZeroAddress, TransferToZeroAddress, ZeroAmount, InsufficientBalance, InsufficientAllowance |
| LeaderboardPayment   | onlyOwner             | msg.sender != owner                              | NotAuthorized(msg.sender) |
| LeaderboardPayment   | payWithUSDC/EURC      | amount == 0, amount < min, balance, allowance    | ZeroAmount, AmountBelowMinimum, InsufficientBalance, InsufficientAllowance |
| LeaderboardPayment   | withdrawUSDC/EURC    | withdrawAmount == 0, withdrawAmount > balance    | NoFundsToWithdraw, InsufficientContractBalance |
| Leaderboard          | onlyOwner             | msg.sender != owner                              | NotAuthorized(msg.sender) |
| Leaderboard          | mint                  | already registered                               | UserAlreadyRegistered |
| Leaderboard          | getRegisteredUser     | index >= length                                  | InvalidId(index) |
| LeaderboardRegistry  | onlyOwner             | msg.sender != owner                              | NotAuthorized(msg.sender) |
| LeaderboardRegistry  | register              | already registered                               | WalletAlreadyRegistered |
| ArcProofOfActivity   | proveActivity         | cooldown not elapsed                             | TooSoonToProveActivity(earliestBlock) |
| InteractionCounter   | batchInteract         | times == 0, times > 100                          | BatchSizeZero, BatchSizeTooLarge(times, 100) |

---

## 4. Which failures cause a "low gas early revert"

These checks run at the **very start** of a function (or in a modifier), so they consume little gas and show up as early reverts on block explorers:

| Contract             | Function / modifier   | Custom error                          | Reason (low gas)      |
|----------------------|-----------------------|--------------------------------------|------------------------|
| ArcLeaderboard       | registerUser, addPoints | OwnableUnauthorizedAccount           | Modifier runs first    |
| ArcLeaderboard       | registerUser          | ZeroAddress, AlreadyRegistered       | First lines of body   |
| ArcLeaderboard       | addPoints             | ZeroAddress, ZeroAmount, UserNotRegistered | First lines of body   |
| ArcLeaderboard       | getUserAt             | InvalidId(index)                     | Single check at entry |
| MeuTokenARC          | transfer              | TransferToZeroAddress, ZeroAmount, InsufficientBalance | First lines |
| MeuTokenARC          | transferFrom         | Zero addresses, ZeroAmount, InsufficientBalance, InsufficientAllowance | First lines |
| LeaderboardPayment   | payWithUSDC, payWithEURC | ZeroAmount, AmountBelowMinimum       | First lines            |
| LeaderboardPayment   | payWithUSDC, payWithEURC | InsufficientBalance, InsufficientAllowance | Before transferFrom |
| LeaderboardPayment   | withdrawUSDC, withdrawEURC | NoFundsToWithdraw, InsufficientContractBalance | After onlyOwner |
| LeaderboardPayment   | transferOwnership     | NotAuthorized (modifier), ZeroAddress | Modifier + first line |
| Leaderboard          | mint                  | UserAlreadyRegistered                | First line             |
| Leaderboard          | getRegisteredUser     | InvalidId(index)                    | Single check           |
| Leaderboard          | transferOwnership     | NotAuthorized (modifier), ZeroAddress | Modifier + first line |
| LeaderboardRegistry  | register              | WalletAlreadyRegistered              | First line             |
| LeaderboardRegistry  | transferOwnership     | NotAuthorized (modifier), ZeroAddress | Modifier + first line |
| ArcProofOfActivity   | proveActivity         | TooSoonToProveActivity(earliestBlock) | Single state check    |
| InteractionCounter   | batchInteract         | BatchSizeZero, BatchSizeTooLarge     | First lines           |

---

## 5. Validation order (first lines of external/public functions)

Across all contracts, the intended order is:

1. **Caller permissions** – modifier (e.g. onlyOwner) or first check.
2. **Contract state** – e.g. paused, already registered, cooldown (proveActivity).
3. **msg.value** – not used (no payable functions).
4. **Zero address inputs** – e.g. user, to, from, newOwner, _owner.
5. **Zero or invalid amounts** – amount == 0, amount < minimum.
6. **ID / index bounds** – getUserAt, getRegisteredUser → InvalidId(index).
7. **ERC20** – balance then allowance before transferFrom (LeaderboardPayment, MeuTokenARC).

No business logic was changed; only validation and error reporting were tightened.
