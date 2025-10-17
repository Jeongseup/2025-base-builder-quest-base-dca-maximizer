# BTC Maximizer

A Bitcoin Dollar Cost Averaging (DCA) platform built with Next.js, integrated with Coinbase CDP wallets and Base Account spend permissions. Features automated BTC purchases with optimal swap rates using Enso Protocol.

## Features

- **Sign in with Base**: Secure authentication using Base Account
- **Flexible Spend Permissions**: Set daily spend permissions ($0.01-$1000) for automated BTC purchases
- **Automated DCA Strategy**: Set up daily Bitcoin purchases with customizable amounts and duration
- **Best Rate Optimization**: Automatically finds the best rates across CBBTC, LBTC, and WBTC using Enso Protocol
- **CDP Smart Accounts**: Server wallets with gas sponsorship for seamless transactions
- **Gas-Free Experience**: All transactions sponsored via CDP paymaster
- **Portfolio Management**: Track your BTC investments and performance
- **User-Friendly Interface**: Clean, modern UI with Bitcoin-focused design

## How It Works

1. **Base Account**: User signs in and grants spend permission to server wallet's smart account
2. **DCA Configuration**: User sets up daily investment amount and duration for automated BTC purchases
3. **Rate Optimization**: Platform automatically finds the best BTC swap rates using Enso Protocol
4. **Server Wallet**: CDP Smart Account executes spend calls, swaps USDC for BTC tokens (CBBTC, LBTC, WBTC)
5. **Automated Execution**: Platform automatically executes DCA purchases based on user's schedule
6. **Base Chain**: Transactions execute on-chain with gas sponsorship

## Key Components

- **🔐 Spend Permissions**: User grants limited spending authority to server wallet's smart account
- **⛽ Gas Sponsorship**: All transactions sponsored using CDP's paymaster - no ETH needed
- **📈 DCA Automation**: Automated daily Bitcoin purchases based on user configuration
- **🔄 Rate Optimization**: Enso Protocol integration for best swap rates across BTC tokens
- **💼 Portfolio Tracking**: Real-time tracking of BTC investments and performance

## Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Configure environment variables**:

   ```bash
   cp .env.example .env.local
   ```

   Fill in the required values:

   - `CDP_API_KEY_ID` - Your Coinbase Developer Platform API Key ID
   - `CDP_API_KEY_SECRET` - Your CDP API Key Secret
   - `CDP_WALLET_SECRET` - Your CDP Wallet Secret
   - `PAYMASTER_URL` - Your CDP Paymaster URL for gas sponsorship
   - `ZORA_API_KEY` - Your Zora API Key (optional, prevents rate limiting - get it from [Developer Settings on Zora](https://zora.co/settings/developer))

   **Optional for production:**

   - `SESSION_SECRET` - Only needed if implementing proper JWT sessions (generate with `openssl rand -hex 32`)

3. **Run the development server**:

   ```bash
   npm run dev
   ```

4. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Sign In**: Click "Sign in with Base" to connect your wallet
2. **Create Server Wallet**: Set up a server wallet for automated transactions
3. **Set Permissions**: Configure your daily spend permission ($0.01-$1000) for BTC purchases
4. **Configure DCA**: Set up your daily investment amount and duration
5. **Monitor Portfolio**: Track your BTC investments and performance
6. **View Activity**: Check your transactions at [account.base.app/activity](https://account.base.app/activity)

### DCA Configuration Options

- **Investment Amount**: $0.01 to $1000 per day
- **Duration**: Customizable (default 365 days)
- **BTC Tokens**: CBBTC, LBTC, WBTC (automatically optimized)
- **Frequency**: Daily, weekly, or monthly options

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Base Account with Sign in with Base
- **Smart Accounts**: Coinbase Developer Platform (CDP) SDK with gas sponsorship
- **Blockchain**: Base Mainnet (Ethereum L2)
- **Spend Permissions**: Base Account spend permission system
- **Rate Optimization**: Enso Protocol API integration
- **Database**: SQLite with better-sqlite3
- **BTC Tokens**: CBBTC, LBTC, WBTC support

## API Routes

- `POST /api/auth/verify` - Verify wallet signature and create session
- `GET/POST /api/wallet/create` - Create/retrieve server wallet and smart account for user
- `GET/POST /api/spend-permission` - Manage spend permissions for DCA transactions
- `GET/POST /api/dca` - Manage DCA configurations and execution
- `POST /api/zora/buy` - Execute BTC token purchase with spend permissions

## Security Features

- Server-side signature verification
- Session-based authentication
- Flexible spend permission limits ($0.01-$1000 daily)
- CDP Smart Account security
- Gas-sponsored transactions (no user ETH required)
- Automated DCA execution with spend permissions
- Transaction retry logic for reliability
- Database-stored permission management

## Architecture Details

### Flow

1. **Frontend** prepares spend permission calls using Base Account SDK
2. **Backend** receives calls and executes via CDP Smart Account
3. **Rate Optimization** finds best BTC swap rates using Enso Protocol
4. **CDP** handles USDC approval for Permit2 contract
5. **Swap** executed using CDP's built-in swap functionality for BTC tokens
6. **DCA Automation** executes scheduled purchases based on user configuration
7. **Portfolio Tracking** updates user's BTC investment records

### Key Technical Decisions

- **Gas Sponsorship**: Uses CDP paymaster for all transactions
- **Smart Accounts**: Server-managed CDP smart accounts for each user
- **Spend Permissions**: Frontend prepares calls, backend executes
- **DCA Automation**: Automated daily BTC purchases based on user configuration
- **Rate Optimization**: Enso Protocol integration for best swap rates
- **Database Storage**: SQLite for persistent DCA configurations and permissions
- **Retry Logic**: Up to 3 attempts for swap operations

## Development

To extend this application:

1. **Enhanced DCA Options**: Add more frequency options (hourly, weekly, monthly)
2. **Advanced Analytics**: Add performance tracking and portfolio analytics
3. **Multi-token support**: Extend beyond USDC for different token swaps
4. **Notification System**: Add email/push notifications for DCA execution
5. **Advanced UI**: Improve the portfolio management and DCA configuration interface

## License

MIT License - see LICENSE file for details.
