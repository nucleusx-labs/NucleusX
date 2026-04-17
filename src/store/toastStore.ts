import { createAtom } from '@xstate/store'

export type ToastVariant = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  variant: ToastVariant
  message: string
  description?: string
}

export const toasts = createAtom<Toast[]>([])

let counter = 0
function nextId(): string {
  counter += 1
  return `${Date.now()}-${counter}`
}

function push(variant: ToastVariant, message: string, description?: string): string {
  const id = nextId()
  toasts.set(current => [...current, { id, variant, message, description }])
  const ttl = variant === 'error' ? 8000 : 5000
  setTimeout(() => dismiss(id), ttl)
  return id
}

function dismiss(id: string): void {
  toasts.set(current => current.filter(t => t.id !== id))
}

export const toast = {
  success: (message: string, description?: string) => push('success', message, description),
  error: (message: string, description?: string) => push('error', message, description),
  info: (message: string, description?: string) => push('info', message, description),
  dismiss,
}
