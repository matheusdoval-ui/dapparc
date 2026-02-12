// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArcProofOfActivity
 * @author ARCtx
 * @notice Sistema on-chain nativo de prova de atividade para Arc Network Testnet
 * @dev Event-driven, gas-optimized, sem NFTs, sem storage pesado
 * 
 * Conceito Arc PoA:
 * - Cada interação do usuário gera uma prova pública on-chain
 * - Prova verificável e barata (event-driven)
 * - Anti-spam: 1 prova por endereço a cada X blocos
 * - Preparado para dashboards, métricas e programas de incentivos
 * 
 * Gas Optimization:
 * - uint32/uint64 para contadores
 * - Sem strings (apenas bytes32)
 * - Sem loops
 * - Storage mínimo necessário
 */
contract ArcProofOfActivity {
    // ============ Storage ============
    
    // Último bloco em que o endereço provou atividade (anti-spam)
    mapping(address => uint64) public lastActivityBlock;
    
    // Contador de atividades por endereço
    mapping(address => uint32) public activityCount;
    
    // Total de carteiras únicas que já provaram atividade
    uint256 public totalActiveWallets;
    
    // Total de atividades provadas (global)
    uint256 public totalActivities;
    
    // Blocos mínimos entre provas (anti-spam)
    // 600 blocos ≈ 2 horas (assumindo ~12s por bloco)
    uint256 public constant MIN_BLOCKS_BETWEEN_PROOFS = 600;
    
    // Contextos conhecidos (pré-computados para gas savings)
    bytes32 public constant CONTEXT_WALLET_CONNECTED = keccak256("wallet_connected");
    bytes32 public constant CONTEXT_VIEW_TRANSACTIONS = keccak256("view_transactions");
    bytes32 public constant CONTEXT_USED_DAPP = keccak256("used_dapp");

    // ---------- Custom errors (gas-efficient, explicit revert reasons) ----------
    error TooSoonToProveActivity(uint256 earliestBlockAt);

    // ============ Events ============
    
    /**
     * @dev Emitido quando uma atividade é provada
     * @param user Endereço que provou a atividade
     * @param context Contexto da atividade (wallet_connected, view_transactions, etc)
     * @param blockNumber Bloco em que a prova foi registrada
     * @param activityIndex Índice global da atividade (totalActivities)
     * @param userActivityCount Contador de atividades do usuário
     */
    event ActivityProved(
        address indexed user,
        bytes32 indexed context,
        uint256 blockNumber,
        uint256 activityIndex,
        uint256 userActivityCount
    );
    
    /**
     * @dev Emitido quando um novo endereço prova atividade pela primeira vez
     * @param user Novo endereço ativo
     * @param totalWallets Total de carteiras ativas após este registro
     */
    event NewActiveWallet(
        address indexed user,
        uint256 totalWallets
    );
    
    // ============ Functions ============
    
    /**
     * @notice Prova uma atividade on-chain
     * @param context Contexto da atividade (deve ser keccak256 de uma string conhecida)
     * @dev 
     * - Verifica anti-spam (MIN_BLOCKS_BETWEEN_PROOFS)
     * - Incrementa contadores
     * - Emite eventos para tracking
     * - Primeira interação incrementa totalActiveWallets
     * 
     * Contextos suportados:
     * - keccak256("wallet_connected")
     * - keccak256("view_transactions")
     * - keccak256("used_dapp")
     */
    function proveActivity(bytes32 context) public {
        // 1) State: anti-spam (earliest block at which proof is allowed)
        address user = msg.sender;
        uint256 currentBlock = block.number;
        uint64 lastBlock = lastActivityBlock[user];
        uint256 earliestBlock = lastBlock + MIN_BLOCKS_BETWEEN_PROOFS;

        if (lastBlock != 0 && currentBlock < earliestBlock) {
            revert TooSoonToProveActivity(earliestBlock);
        }
        
        // Verificar se é primeira interação deste endereço
        bool isFirstActivity = (lastBlock == 0);
        
        // Atualizar storage
        lastActivityBlock[user] = uint64(currentBlock);
        activityCount[user] += 1;
        totalActivities += 1;
        
        // Se for primeira atividade, incrementar total de carteiras ativas
        if (isFirstActivity) {
            totalActiveWallets += 1;
            emit NewActiveWallet(user, totalActiveWallets);
        }
        
        // Emitir evento principal
        emit ActivityProved(
            user,
            context,
            currentBlock,
            totalActivities,
            activityCount[user]
        );
    }
    
    /**
     * @notice Versão conveniente para "wallet_connected"
     * @dev Chama proveActivity com CONTEXT_WALLET_CONNECTED
     */
    function proveWalletConnection() external {
        proveActivity(CONTEXT_WALLET_CONNECTED);
    }
    
    /**
     * @notice Versão conveniente para "view_transactions"
     * @dev Chama proveActivity com CONTEXT_VIEW_TRANSACTIONS
     */
    function proveViewTransactions() external {
        proveActivity(CONTEXT_VIEW_TRANSACTIONS);
    }
    
    /**
     * @notice Versão conveniente para "used_dapp"
     * @dev Chama proveActivity com CONTEXT_USED_DAPP
     */
    function proveUsedDApp() external {
        proveActivity(CONTEXT_USED_DAPP);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Retorna informações de um endereço
     * @param user Endereço a consultar
     * @return lastBlock Último bloco em que provou atividade
     * @return count Número de atividades provadas
     * @return isActive Se já provou atividade alguma vez
     */
    function getUserInfo(address user) external view returns (
        uint64 lastBlock,
        uint32 count,
        bool isActive
    ) {
        lastBlock = lastActivityBlock[user];
        count = activityCount[user];
        isActive = (lastBlock > 0);
    }
    
    /**
     * @notice Retorna estatísticas globais do contrato
     * @return totalWallets Total de carteiras únicas
     * @return totalActivities_ Total de atividades provadas
     * @return minBlocksBetweenProofs Blocos mínimos entre provas
     */
    function getGlobalStats() external view returns (
        uint256 totalWallets,
        uint256 totalActivities_,
        uint256 minBlocksBetweenProofs
    ) {
        return (
            totalActiveWallets,
            totalActivities,
            MIN_BLOCKS_BETWEEN_PROOFS
        );
    }
    
    /**
     * @notice Verifica se um endereço pode provar atividade agora
     * @param user Endereço a verificar
     * @return canProve Se pode provar atividade
     * @return blocksRemaining Blocos restantes até poder provar (0 se pode)
     */
    function canProveActivity(address user) external view returns (
        bool canProve,
        uint256 blocksRemaining
    ) {
        uint64 lastBlock = lastActivityBlock[user];
        uint256 currentBlock = block.number;
        
        if (lastBlock == 0) {
            // Primeira atividade sempre permitida
            return (true, 0);
        }
        
        if (currentBlock >= lastBlock + MIN_BLOCKS_BETWEEN_PROOFS) {
            return (true, 0);
        }
        
        blocksRemaining = (lastBlock + MIN_BLOCKS_BETWEEN_PROOFS) - currentBlock;
        return (false, blocksRemaining);
    }
}
