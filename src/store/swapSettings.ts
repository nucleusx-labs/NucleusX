import { createAtom } from '@xstate/store'

export const swapSettings = createAtom({ slippage: '0.5', deadline: '20' })
