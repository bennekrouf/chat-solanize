# Solanize - AI-Powered Solana Wallet Chat Interface

A modern, responsive chat interface that provides natural language interaction with the Solana blockchain. Users can check balances, send transfers, perform swaps, and monitor transactions through conversational AI.

## Features

- 🤖 **AI Chat Interface**: Natural language commands for blockchain operations
- 💰 **Real-time Wallet Data**: Live balance updates, transaction history, and pending transactions
- 🔄 **Token Swaps**: Seamless token exchanges via Jupiter protocol integration
- 💸 **SOL Transfers**: Send SOL to any wallet address with natural language
- 📊 **Portfolio Tracking**: Real-time USD values and transaction monitoring
- 🌐 **Multi-language**: English and French localization
- 🌙 **Dark Mode**: Built-in theme switching
- 📱 **Responsive**: Mobile-first design
- ⚡ **Performance**: Next.js 15 with App Router
- 🔐 **Wallet Integration**: Phantom, Solflare wallet support
- 🎨 **Design System**: Complete CSS variables and Tailwind config
- 📊 **Real-time Updates**: Live transaction status and balance updates

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Wallet**: Solana Wallet Adapter
- **Styling**: Tailwind CSS with shadcn/ui design system
- **State Management**: React hooks with optimistic updates
- **API Integration**: RESTful Solana Gateway API
- **Internationalization**: next-intl
- **Theme**: next-themes with CSS variables
- **Icons**: React Icons (Feather)

## Architecture

### Components
- **ChatInterface**: Main conversational UI with wallet status bar
- **WalletButton**: Wallet connection and management
- **Transaction Cards**: Interactive transaction approval UI
- **Real-time Status**: Live balance and pending transaction monitoring

### Hooks
- **useAuth**: Wallet authentication and JWT management
- **useWalletData**: Real-time wallet balances, transactions, and prices
- **useTransactions**: Transaction preparation, signing, and submission
- **useChat**: Chat session management with transaction integration

### API Integration
- **SolanaApi**: Complete integration with Solana Gateway microservice
- **Transaction Parser**: Natural language transaction command parsing
- **Real-time Updates**: Automatic refresh of wallet data post-transaction

## Solana Features

### Implemented
- ✅ **Wallet Balance Checking**: Real-time SOL and SPL token balances
- ✅ **Transaction History**: Paginated transaction history with status
- ✅ **Pending Transactions**: Live monitoring of unconfirmed transactions
- ✅ **Token Prices**: Real-time USD pricing for all held tokens
- ✅ **Token Search**: Search and discover SPL tokens
- ✅ **SOL Transfers**: Prepare, sign, and submit SOL transfers
- ✅ **Token Swaps**: Jupiter protocol integration for token exchanges
- ✅ **Transaction Status**: Real-time confirmation and finalization tracking

### API Endpoints Used
- `POST /api/v1/balance` - Get SOL balance
- `POST /api/v1/wallet/tokens` - Get all SPL token balances
- `POST /api/v1/transactions/history` - Get transaction history
- `POST /api/v1/transactions/pending` - Get pending transactions
- `POST /api/v1/price` - Get token prices
- `POST /api/v1/tokens/search` - Search tokens
- `POST /api/v1/transaction/prepare` - Prepare SOL transfers
- `POST /api/v1/swap/prepare` - Prepare token swaps
- `POST /api/v1/transaction/submit` - Submit signed transactions

## Getting Started

### Prerequisites
- Node.js 18+ and Yarn
- Solana Gateway API running on port 8080
- Chat API running on port 5000

### Installation

```bash
# Install dependencies
yarn install

# Set up environment variables
cp .env.template .env.local
# Edit .env.local with your API endpoints

# Start development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start
```

### Configuration

Edit `config/site.yaml`:

```yaml
api:
  solana_gateway_url: "http://127.0.0.1:8080"  # Solana Gateway API
  chat_api_url: "http://127.0.0.1:5000"        # Chat API

solana:
  network: "devnet"                             # or mainnet-beta
  explorer_url: "https://solscan.io"

transactions:
  default_slippage: 1.0                         # 1%
  refresh_interval: 10000                       # ms
```

## Usage Examples

### Natural Language Commands

```
"Check my SOL balance"
→ Shows current SOL balance in chat + status bar

"Swap 1 SOL for USDC"
→ Prepares swap transaction with quote
→ Shows transaction card for approval
→ User signs and submits transaction

"Send 0.5 SOL to ABC123..."
→ Prepares transfer transaction
→ Shows transaction card with details
→ User approves and signs

"What tokens do I have?"
→ Lists all SPL tokens with balances and USD values

"Show my recent transactions"
→ Displays transaction history with Solscan links
```

### Wallet Status Bar
- **Real-time Balances**: Top 3 tokens with USD values
- **Pending Transactions**: Live count with status indicator
- **Recent Activity**: Quick access to latest transactions

## Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── [locale]/           # Internationalized routes
│   └── api/               # API routes for chat
├── components/
│   ├── chat/              # Chat interface components
│   ├── wallet/            # Wallet connection components
│   └── layout/            # Layout components
├── hooks/
│   ├── useAuth.ts         # Wallet auth and JWT management
│   ├── useWalletData.ts   # Real-time wallet data
│   ├── useTransactions.ts # Transaction management
│   └── useChat.ts         # Chat functionality
├── lib/
│   ├── solanaApi.ts       # Solana Gateway API client
│   ├── chatApi.ts         # Chat API client
│   └── transactionParser.ts # Natural language parsing
└── types/                 # TypeScript definitions
```

## Development Features

### Real-time Updates
- Automatic balance refresh after transactions
- Pending transaction polling every 10 seconds
- Optimistic UI updates for immediate feedback

### Error Handling
- Comprehensive API error handling with retry mechanisms
- User-friendly error messages in chat interface
- Graceful fallbacks for network issues

### Performance
- Efficient state management with minimal re-renders
- Optimistic updates for perceived performance
- Intelligent caching of wallet data and prices

## Deployment

### Environment Variables
```bash
NEXT_PUBLIC_SOLANA_API_URL=https://your-solana-gateway.com
NEXT_PUBLIC_CHAT_API_URL=https://your-chat-api.com
```

### Production Build
```bash
yarn build
yarn start
```

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
CMD ["yarn", "start"]
```

## Contributing

This codebase follows your preferences:
- ✅ **Rust-style Error Handling**: No unwrap(), clear error types
- ✅ **YAML Configuration**: All parameters in config/site.yaml
- ✅ **Trace Logging**: Comprehensive logging setup
- ✅ **Modern Design**: Developer-friendly with dark/light mode
- ✅ **Command Line Friendly**: Ready for CLI-based deployment

## Next Steps

1. **Enhanced AI**: Integrate with LLM for more sophisticated transaction parsing
2. **DeFi Integration**: Add support for lending, staking, and yield farming
3. **Portfolio Analytics**: Charts and performance tracking
4. **Mobile App**: React Native version with same API integration
5. **Multi-chain**: Extend to other blockchain networks

Built with modern Web3 best practices and production-ready architecture.
