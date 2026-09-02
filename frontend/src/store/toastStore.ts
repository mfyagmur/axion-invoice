import { create } from 'zustand'

interface Toast {
  id: number
  message: string
  variant: 'error' | 'success'
}

interface ToastState {
  toasts: Toast[]
  push: (message: string, variant?: Toast['variant'], durationMs?: number) => void
  dismiss: (id: number) => void
}

let nextId = 0

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  push: (message, variant = 'error', durationMs = 5000) => {
    const id = nextId++
    set((state) => ({ toasts: [...state.toasts, { id, message, variant }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
    }, durationMs)
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}))
