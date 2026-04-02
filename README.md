# NucleusX

A decentralized exchange (DEX) and liquidity management interface for the **QF Network** — a Polkadot-based EVM-compatible chain. Built with React, TypeScript, and Vite.

## Overview

NucleusX is a full-featured DeFi frontend that bridges Polkadot's Substrate account model with EVM smart contracts via the **Revive pallet**. Users can swap tokens, provide and remove liquidity, farm yield with LP tokens, and stake NCL governance tokens — all from a single interface.

## Features

- **Token Swaps** — UniswapV2-style swaps with real-time quotes, configurable slippage (default 0.5%) and deadline (default 20 min)
- **Liquidity Pools** — Browse active pools; add and remove liquidity positions
- **Yield Farms** — Stake LP tokens to earn NCL rewards
- **Governance Staking** — Stake NCL tokens for protocol revenue and on-chain governance
- **User Dashboard** — Portfolio view with native token balances, EVM address, and SS58 address

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript (strict) |
| Build | Vite |
| Styling | Tailwind CSS 4 + DaisyUI |
| State | XState Store atoms |
| Blockchain | Polkadot API (PAPI) v1.23+ |
| EVM encoding | Viem 2.47+ |
| Wallet | Talisman Connect + Polkadot-JS injected extensions |

## Network & Contracts

**QF Network**
- RPC: `wss://mainnet.qfnode.net`
- Chain ID: 3426

| Contract | Address |
|---|---|
| UniswapV2Factory | `0xf44c7411bb141a0e1036c92639e9ac64e8dc37fd` |
| UniswapV2Router02 | `0xcabe3ecba478b17a9b11d15e208f0d7390f3264d` |
| WQF Token | `0x3e3a42e7e25d5004282ce13a96695c2805224f30` |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/         # UI components (SwapForm, TokenModal, AddLiquidityForm, etc.)
├── hooks/              # Custom hooks
│   ├── useSwap.ts      # Full swap flow: quote → approve → execute
│   ├── useConnect.ts   # Wallet connection and account selection
│   ├── useTokenBalances.ts  # ERC20 balance queries
│   ├── useTransaction.ts    # Transaction status tracking
│   └── useCurrentBlock.ts   # Block finalization subscription
├── pages/              # Route-level page components
│   ├── Home.tsx
│   ├── Swap.tsx
│   ├── Pools.tsx
│   ├── AddLiquidity.tsx
│   ├── RemoveLiquidity.tsx
│   ├── Farms.tsx
│   ├── Staking.tsx
│   └── UserDashboard.tsx
├── store/
│   └── swapSettings.ts # Global slippage + deadline settings atom
├── utils/
│   ├── sdk.ts          # PAPI client factory and singleton management
│   ├── sdk-interface.ts # High-level wrappers: reviveCall, reviveTransaction, reviveEstimateGas
│   ├── revive.ts       # Revive pallet integration: encode/decode, account mapping, gas estimation
│   ├── contracts.ts    # Contract addresses and ABIs (Factory, Router, ERC20)
│   └── formatters.ts   # Number and address formatting utilities
├── descriptors/        # Auto-generated PAPI chain type descriptors
└── App.tsx             # React Router setup and root layout
```

## How the Revive Bridge Works

QF Network runs EVM smart contracts through the **Revive pallet** rather than a native EVM. This means:

1. **ABI encoding** uses Viem (`encodeFunctionData` / `decodeFunctionResult`)
2. **Execution** goes through `api.apis.ReviveApi.call` (read-only) or `api.tx.Revive.call` (state-changing)
3. **Account mapping** — Substrate SS58 accounts are linked to EVM H160 addresses on-chain via `ReviveApi.address`. If no on-chain mapping exists, the H160 is derived deterministically from the last 20 bytes of the SS58 public key.

The `src/utils/revive.ts` and `src/utils/sdk-interface.ts` modules abstract this entirely — `useSwap` and other hooks never deal with raw Revive types.

### Swap Flow

```
1. fetchQuote   → encodeContractCall(ROUTER_ABI, 'getAmountsOut', ...)
                → reviveCall (dry-run) → decodeContractResult
                → apply slippage bps → set amountOutMin

2. swap         → check ERC20 allowance (reviveCall)
                → approve Router if allowance < amountIn (reviveTransaction)
                → encodeContractCall(ROUTER_ABI, 'swapExactTokensForTokens', ...)
                → reviveEstimateGas
                → reviveTransaction → onTxHash, onFinalized
```

## Configuration

### Swap Settings

Default values are set in `src/store/swapSettings.ts`:

```typescript
export const swapSettings = createAtom({ slippage: '0.5', deadline: '20' })
// slippage: percentage (e.g. '0.5' = 0.5%)
// deadline: minutes until transaction expires
```

### Chain / RPC

Edit `src/utils/sdk.ts` to change or add RPC endpoints:

```typescript
const config = {
  qf_network: {
    descriptor: qf_network,
    providers: ['wss://mainnet.qfnode.net'],
  },
}
```

To add a fallback, pass multiple providers — the client will use the first available.

### Adding a New Chain

1. Generate descriptors:
   ```bash
   npx papi add <chain_key> -w wss://your-rpc-endpoint
   npx papi
   ```

2. Import and register in `sdk.ts`:
   ```typescript
   import { your_chain } from '../descriptors'

   const config = {
     // ...existing
     your_chain: {
       descriptor: your_chain,
       providers: ['wss://your-rpc-endpoint'],
     },
   }
   ```

## References

- [PAPI Documentation](https://papi.how/)
- [Revive Pallet](https://github.com/paritytech/revive)
- [Polkadot Developer Portal](https://wiki.polkadot.network/)
- [Viem](https://viem.sh/)
- [Talisman Connect](https://github.com/TalismanSociety/talisman-connect)
