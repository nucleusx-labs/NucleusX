import { assign, fromPromise, setup } from 'xstate'
import type { Token } from './dexStore'

export interface SwapQuote {
  amountOut: bigint
  amountOutMin: bigint
  amountOutFormatted: string
}

interface SwapMachineContext {
  tokenIn: Token | null
  tokenOut: Token | null
  amountIn: bigint
  quote: SwapQuote | null
  txHash: string | null
  error: string | null
  evmAddress: `0x${string}` | null
}

export type SwapMachineEvent =
  | { type: 'QUOTE'; tokenIn: Token; tokenOut: Token; amountIn: bigint }
  | { type: 'APPROVE_AND_SWAP' }
  | { type: 'RESET' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_EVM_ADDRESS'; evmAddress: `0x${string}` }

// Actor input/output types — exported so useSwap.ts can type its overrides
export interface QuoteActorInput {
  tokenIn: Token
  tokenOut: Token
  amountIn: bigint
  slippage: string
}

export interface CheckAllowanceActorInput {
  tokenIn: Token
  tokenOut: Token
  amountIn: bigint
  evmAddress: `0x${string}`
}

export interface CheckAllowanceActorOutput {
  needsApproval: boolean
}

export interface ApproveActorInput {
  tokenIn: Token
  amountIn: bigint
}

export interface SwapActorInput {
  tokenIn: Token
  tokenOut: Token
  amountIn: bigint
  amountOutMin: bigint
  evmAddress: `0x${string}`
  deadline: string
}

export interface SwapActorOutput {
  txHash: string
}

const initialContext: SwapMachineContext = {
  tokenIn: null,
  tokenOut: null,
  amountIn: 0n,
  quote: null,
  txHash: null,
  error: null,
  evmAddress: null,
}

export const swapMachine = setup({
  types: {
    context: {} as SwapMachineContext,
    events: {} as SwapMachineEvent,
  },

  actors: {
    // Stub actors — overridden at useMachine call site in useSwap.ts
    // so actor implementations can close over live swapSettings atom values.
    fetchQuote: fromPromise<SwapQuote, QuoteActorInput>(async () => {
      throw new Error('fetchQuote actor not provided')
    }),
    checkAllowance: fromPromise<CheckAllowanceActorOutput, CheckAllowanceActorInput>(async () => {
      throw new Error('checkAllowance actor not provided')
    }),
    approveToken: fromPromise<void, ApproveActorInput>(async () => {
      throw new Error('approveToken actor not provided')
    }),
    executeSwap: fromPromise<SwapActorOutput, SwapActorInput>(async () => {
      throw new Error('executeSwap actor not provided')
    }),
  },

  guards: {
    hasEvmAddress: ({ context }) => context.evmAddress !== null,
    needsApproval: (_, params: { needsApproval: boolean }) => params.needsApproval,
  },

  actions: {
    assignTokensAndAmount: assign((_, params: { tokenIn: Token; tokenOut: Token; amountIn: bigint }) => ({
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn,
      quote: null,
      error: null,
    })),
    assignQuote: assign((_, params: SwapQuote) => ({ quote: params })),
    assignTxHash: assign((_, params: { txHash: string }) => ({ txHash: params.txHash })),
    assignError: assign((_, params: { message: string }) => ({ error: params.message })),
    clearError: assign({ error: () => null }),
    clearAll: assign(initialContext),
  },
}).createMachine({
  id: 'swap',
  initial: 'idle',
  context: initialContext,

  // Top-level: handle EVM address update from any state
  on: {
    SET_EVM_ADDRESS: {
      actions: assign({ evmAddress: ({ event }) => event.evmAddress }),
    },
  },

  states: {
    idle: {
      on: {
        QUOTE: {
          target: 'quoting',
          guard: 'hasEvmAddress',
          actions: {
            type: 'assignTokensAndAmount',
            params: ({ event }) => ({
              tokenIn: event.tokenIn,
              tokenOut: event.tokenOut,
              amountIn: event.amountIn,
            }),
          },
        },
        RESET: { actions: 'clearAll' },
      },
    },

    quoting: {
      invoke: {
        src: 'fetchQuote',
        input: ({ context }) => ({
          tokenIn: context.tokenIn!,
          tokenOut: context.tokenOut!,
          amountIn: context.amountIn,
          slippage: '0.5', // overridden in useSwap.ts via actor closure
        }),
        onDone: {
          target: 'quoted',
          actions: {
            type: 'assignQuote',
            params: ({ event }) => event.output,
          },
        },
        onError: {
          target: 'idle',
          actions: {
            type: 'assignError',
            params: ({ event }) => ({ message: String(event.error) }),
          },
        },
      },
      on: {
        // Re-quoting cancels the in-flight invoke and restarts
        QUOTE: {
          target: 'quoting',
          actions: {
            type: 'assignTokensAndAmount',
            params: ({ event }) => ({
              tokenIn: event.tokenIn,
              tokenOut: event.tokenOut,
              amountIn: event.amountIn,
            }),
          },
        },
      },
    },

    quoted: {
      on: {
        APPROVE_AND_SWAP: { target: 'checkingAllowance' },
        QUOTE: {
          target: 'quoting',
          actions: {
            type: 'assignTokensAndAmount',
            params: ({ event }) => ({
              tokenIn: event.tokenIn,
              tokenOut: event.tokenOut,
              amountIn: event.amountIn,
            }),
          },
        },
        RESET: { target: 'idle', actions: 'clearAll' },
      },
    },

    checkingAllowance: {
      invoke: {
        src: 'checkAllowance',
        input: ({ context }) => ({
          tokenIn: context.tokenIn!,
          tokenOut: context.tokenOut!,
          amountIn: context.amountIn,
          evmAddress: context.evmAddress!,
        }),
        onDone: [
          {
            guard: {
              type: 'needsApproval',
              params: ({ event }) => ({ needsApproval: event.output.needsApproval }),
            },
            target: 'approving',
          },
          { target: 'swapping' },
        ],
        onError: {
          target: 'error',
          actions: {
            type: 'assignError',
            params: ({ event }) => ({ message: String(event.error) }),
          },
        },
      },
    },

    approving: {
      invoke: {
        src: 'approveToken',
        input: ({ context }) => ({
          tokenIn: context.tokenIn!,
          amountIn: context.amountIn,
        }),
        onDone: { target: 'swapping' },
        onError: {
          target: 'error',
          actions: {
            type: 'assignError',
            params: ({ event }) => ({ message: String(event.error) }),
          },
        },
      },
    },

    swapping: {
      invoke: {
        src: 'executeSwap',
        input: ({ context }) => ({
          tokenIn: context.tokenIn!,
          tokenOut: context.tokenOut!,
          amountIn: context.amountIn,
          amountOutMin: context.quote!.amountOutMin,
          evmAddress: context.evmAddress!,
          deadline: '20', // overridden in useSwap.ts via actor closure
        }),
        onDone: {
          target: 'success',
          actions: {
            type: 'assignTxHash',
            params: ({ event }) => ({ txHash: event.output.txHash }),
          },
        },
        onError: {
          target: 'error',
          actions: {
            type: 'assignError',
            params: ({ event }) => ({ message: String(event.error) }),
          },
        },
      },
    },

    success: {
      on: {
        RESET: { target: 'idle', actions: 'clearAll' },
      },
    },

    error: {
      on: {
        RESET: { target: 'idle', actions: 'clearAll' },
        CLEAR_ERROR: { target: 'quoted', actions: 'clearError' },
      },
    },
  },
})
