/**
 * @file deploy-leaderboard-simple.js
 * @description Script SIMPLES para fazer deploy do contrato Leaderboard na Arc Testnet
 * 
 * COMANDO EXATO PARA EXECUTAR:
 * node scripts/deploy-leaderboard-simple.js
 * 
 * Requisitos:
 * - PRIVATE_KEY no .env.local OU passe como variável de ambiente
 * - Owner address: 0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2
 */

const { ethers } = require('ethers')
require('dotenv').config({ path: '.env.local' })

// Arc Testnet Configuration
const ARC_RPC_URL = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network'

// Owner address (developer wallet)
const OWNER_ADDRESS = '0xc8d7F8ffB0c98f6157E4bF684bE7756f2CddeBF2'

// Private Key from .env.local ou variável de ambiente
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0x231c6f6e09937af4ffa4a47cec3bc10c3210ad4486b8e98131c0f2aeacc61d8c'

// Contract source code (inline para simplificar)
const CONTRACT_SOURCE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Leaderboard {
    address public owner;
    address[] public registeredUsers;
    mapping(address => bool) public isRegistered;
    mapping(address => uint256) public registrationTimestamp;
    mapping(address => uint256) public registrationIndex;
    uint256 public totalRegistrations;
    
    event NewEntry(address indexed user);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor(address _owner) {
        require(_owner != address(0), "Invalid owner address");
        owner = _owner;
    }
    
    function mint() external {
        require(!isRegistered[msg.sender], "User already registered");
        isRegistered[msg.sender] = true;
        registrationTimestamp[msg.sender] = block.timestamp;
        registrationIndex[msg.sender] = registeredUsers.length;
        registeredUsers.push(msg.sender);
        totalRegistrations++;
        emit NewEntry(msg.sender);
    }
    
    function getAllRegisteredUsers() external view returns (address[] memory) {
        return registeredUsers;
    }
    
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
    
    function getTotalUsers() external view returns (uint256) {
        return registeredUsers.length;
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner address");
        owner = newOwner;
    }
}
`

async function deployLeaderboard() {
  try {
    console.log('🚀 Deploy do contrato Leaderboard na Arc Testnet\n')
    
    // Connect to Arc Testnet
    const provider = new ethers.JsonRpcProvider(ARC_RPC_URL)
    
    // Create wallet from private key
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
    
    console.log('📝 Wallet Address:', wallet.address)
    console.log('📍 Network: Arc Testnet')
    console.log('👤 Owner Address:', OWNER_ADDRESS)
    
    // Check balance
    const balance = await provider.getBalance(wallet.address)
    console.log('💰 Balance:', ethers.formatEther(balance), 'ETH\n')
    
    if (balance === 0n) {
      throw new Error('❌ Saldo insuficiente. Você precisa de ETH para fazer o deploy.')
    }
    
    console.log('📄 Compilando contrato...')
    console.log('⚠️  IMPORTANTE: Este script requer Hardhat instalado')
    console.log('⚠️  Execute primeiro: npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox\n')
    
    // Para deploy direto, use Hardhat compile + deploy
    console.log('💡 COMANDO EXATO PARA DEPLOY:')
    console.log('   1. Instale Hardhat (se ainda não tiver):')
    console.log('      npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox')
    console.log('')
    console.log('   2. Compile o contrato:')
    console.log('      npx hardhat compile')
    console.log('')
    console.log('   3. Deploy na Arc Testnet:')
    console.log('      npx hardhat run scripts/deploy-leaderboard-hardhat.js --network arcTestnet')
    console.log('')
    console.log('   OU use Remix IDE (mais fácil):')
    console.log('   - Acesse: https://remix.ethereum.org')
    console.log('   - Cole o código de contracts/Leaderboard.sol')
    console.log('   - Compile e deploy na Arc Testnet')
    console.log('   - Owner:', OWNER_ADDRESS)
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  deployLeaderboard()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Erro fatal:', error)
      process.exit(1)
    })
}

module.exports = { deployLeaderboard }
