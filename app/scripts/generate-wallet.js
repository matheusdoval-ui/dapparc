/**
 * Script to generate a new wallet address and private key
 * WARNING: This is for testing only. Never share your private key!
 */

const { ethers } = require('ethers');

function generateWallet() {
  // Generate a new random wallet
  const wallet = ethers.Wallet.createRandom();
  
  console.log('\n========================================');
  console.log('🔐 NOVA CARTEIRA GERADA');
  console.log('========================================\n');
  console.log('⚠️  ATENÇÃO: Guarde estas informações com segurança!\n');
  console.log('📝 Endereço da Carteira:');
  console.log(`   ${wallet.address}\n`);
  console.log('🔑 Chave Privada:');
  console.log(`   ${wallet.privateKey}\n`);
  console.log('📄 Frase Mnemônica (12 palavras):');
  console.log(`   ${wallet.mnemonic.phrase}\n`);
  console.log('========================================\n');
  console.log('⚠️  IMPORTANTE:');
  console.log('   - NUNCA compartilhe sua chave privada');
  console.log('   - Use esta carteira apenas para testes');
  console.log('   - Faça backup da frase mnemônica\n');
  
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic.phrase
  };
}

// Run if executed directly
if (require.main === module) {
  generateWallet();
}

module.exports = { generateWallet };
