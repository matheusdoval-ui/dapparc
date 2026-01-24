# ARCtx - ARC Network dApp

> the dapp that checks your onchain interaction

ARCtx é uma aplicação descentralizada (dApp) construída na ARC Testnet que permite visualizar e rastrear interações on-chain de carteiras. A aplicação exibe estatísticas de transações, saldo USDC e gráficos de crescimento de interações.

## 🚀 Características

- **Conexão de Carteira**: Suporte para MetaMask e Rabby Wallet
- **Estatísticas em Tempo Real**: Visualize transações, saldo e histórico de interações
- **Gráficos Interativos**: Acompanhe o crescimento de interações nos últimos 30 dias
- **Consulta Manual**: Verifique endereços sem precisar conectar carteira
- **Registro On-Chain**: Cada consulta pode ser registrada como transação na blockchain

## 📋 Pré-requisitos

- Node.js 18+ instalado
- MetaMask ou Rabby Wallet instalado
- ETH na ARC Testnet (para interações com contrato)

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd arc-network-d-app
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente (opcional):
```bash
cp .env.example .env.local
```

Edite `.env.local` e adicione:
- `NEXT_PUBLIC_CONTRACT_ADDRESS` (opcional - endereço do contrato deployado)
- `ARC_RPC_URL` (opcional - padrão: https://rpc.testnet.arc.network)

## 🏃 Executando Localmente

```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm start

# Lint
npm run lint
```

A aplicação estará disponível em `http://localhost:3000`

## 📦 Deploy do Contrato

Para usar o contrato `InteractionCounter.sol`:

1. Gere uma nova carteira (opcional):
```bash
node scripts/generate-wallet.js
```

2. Obtenha ETH de teste na ARC Testnet (use um faucet)

3. Faça o deploy do contrato:
```bash
node scripts/simple-deploy.js <PRIVATE_KEY>
```

4. Copie o endereço do contrato e adicione em `.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

## 🌐 Deploy no Vercel

1. Faça push do código para o GitHub

2. Acesse [Vercel](https://vercel.com) e importe o repositório

3. Configure:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

4. Adicione variáveis de ambiente:
   - `ARC_RPC_URL` (opcional)
   - `NEXT_PUBLIC_CONTRACT_ADDRESS` (opcional)

5. Conecte o domínio `arctx.xyz` nas configurações do projeto

## 📁 Estrutura do Projeto

```
arc-network-d-app/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── wallet-stats/  # Endpoint de estatísticas
│   │   └── register-query/# Endpoint de registro
│   ├── page.tsx           # Página principal
│   └── layout.tsx         # Layout raiz
├── components/            # Componentes React
│   ├── wallet-card.tsx   # Card principal da carteira
│   └── ui/               # Componentes UI (shadcn/ui)
├── contracts/            # Contratos Solidity
│   └── InteractionCounter.sol
├── lib/                  # Utilitários
│   ├── wallet.ts        # Funções de carteira
│   └── utils.ts         # Utilitários gerais
└── scripts/             # Scripts de deploy
    ├── simple-deploy.js # Deploy simples
    └── generate-wallet.js # Gerar carteira
```

## 🔧 Tecnologias

- **Next.js 16** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Ethers.js** - Interação com blockchain
- **Radix UI** - Componentes acessíveis
- **Recharts** - Gráficos

## 📚 Documentação Adicional

- [Guia de Deploy](./README-DEPLOY.md) - Instruções detalhadas de deploy
- [Quick Start](./app/QUICK-START.md) - Guia rápido
- [Próximos Passos Git](./PROXIMOS-PASSOS-GIT.md) - Configuração Git/Vercel

## 🔗 Links

- **Live Demo**: https://arctx.xyz
- **ARC Testnet Explorer**: https://testnet.arcscan.app
- **ARC Network Docs**: https://docs.arc.network

## 📝 Licença

Este projeto é privado.

## 👤 Autor

[@matheusdovalx](https://x.com/matheusdovalx)
