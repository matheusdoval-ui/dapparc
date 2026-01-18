# 🚀 Guia de Deploy e Teste

Este guia explica como gerar uma nova carteira, fazer deploy de um contrato inteligente e testar a aplicação completa.

## 📋 Pré-requisitos

1. Node.js instalado
2. MetaMask ou Rabby Wallet instalado
3. ETH na ARC Testnet (use um faucet se necessário)

## 🔐 Passo 1: Gerar Nova Carteira

Execute o script para gerar uma nova carteira:

```bash
node scripts/generate-wallet.js
```

Isso irá gerar:
- ✅ Endereço da carteira
- ✅ Chave privada
- ✅ Frase mnemônica (12 palavras)

**⚠️ IMPORTANTE:** Guarde essas informações com segurança! Nunca compartilhe sua chave privada.

## 💰 Passo 2: Obter ETH de Teste

Você precisa de ETH na ARC Testnet para fazer o deploy. Use um faucet ou transfira ETH de teste.

## 📦 Passo 3: Deploy do Contrato

### Opção A: Deploy Simples (Recomendado para testes rápidos)

```bash
node scripts/simple-deploy.js <SUA_CHAVE_PRIVADA>
```

Ou usando variável de ambiente:

```bash
PRIVATE_KEY=<sua_chave_privada> node scripts/simple-deploy.js
```

### Opção B: Usar Remix IDE (Recomendado para produção)

1. Acesse [Remix IDE](https://remix.ethereum.org)
2. Crie um novo arquivo `InteractionCounter.sol`
3. Cole o código do contrato em `contracts/InteractionCounter.sol`
4. Compile o contrato (Solidity 0.8.20+)
5. Vá para a aba "Deploy & Run"
6. Selecione "Injected Provider" (MetaMask/Rabby)
7. Certifique-se de estar conectado à ARC Testnet (Chain ID: 5042002)
8. Clique em "Deploy"

## 🧪 Passo 4: Interagir com o Contrato

Após o deploy, você pode interagir com o contrato para criar transações:

```bash
node scripts/interact-with-contract.js <SUA_CHAVE_PRIVADA> <ENDEREÇO_DO_CONTRATO>
```

Ou use Remix IDE para chamar as funções:
- `interact()` - Cria uma interação
- `batchInteract(uint256)` - Cria múltiplas interações
- `getInteractionCount(address)` - Verifica contagem

## 🎯 Passo 5: Testar na Aplicação

1. Importe a carteira gerada no MetaMask/Rabby usando a chave privada ou frase mnemônica
2. Certifique-se de estar conectado à ARC Testnet
3. Acesse a aplicação: `http://localhost:3000`
4. Conecte sua carteira
5. Faça algumas interações com o contrato para aumentar o número de transações
6. Veja suas estatísticas atualizadas na aplicação!

## 📝 Estrutura dos Arquivos

```
contracts/
  └── InteractionCounter.sol    # Contrato inteligente

scripts/
  ├── generate-wallet.js         # Gera nova carteira
  ├── simple-deploy.js           # Deploy simples
  └── interact-with-contract.js  # Interage com contrato
```

## 🔒 Segurança

- ⚠️ **NUNCA** compartilhe sua chave privada
- ⚠️ Use apenas para testes
- ⚠️ Não use carteiras de teste com fundos reais
- ✅ Faça backup da frase mnemônica
- ✅ Use carteiras diferentes para teste e produção

## 🆘 Troubleshooting

### Erro: "Saldo insuficiente"
- Você precisa de ETH na ARC Testnet
- Use um faucet para obter ETH de teste

### Erro: "Rede incorreta"
- Certifique-se de estar conectado à ARC Testnet (Chain ID: 5042002)
- Adicione a rede manualmente se necessário

### Contrato não aparece no explorer
- Aguarde alguns segundos para o explorer atualizar
- Verifique o endereço do contrato

## 📚 Recursos Úteis

- [ARC Testnet Explorer](https://testnet.arcscan.app)
- [Remix IDE](https://remix.ethereum.org)
- [ARC Network Docs](https://docs.arc.network)
