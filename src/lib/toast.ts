import { create } from 'zustand'

export interface Toast {
  id: number
  title: string
  detail?: string
}

interface ToastStore {
  toasts: Toast[]
  push: (title: string, detail?: string) => void
  dismiss: (id: number) => void
}

let nextId = 1

/** Transient UI store — never persisted. Auto-dismisses after 5s. */
export const useToasts = create<ToastStore>()((set) => ({
  toasts: [],
  push: (title, detail) => {
    const id = nextId++
    set((s) => ({ toasts: [...s.toasts, { id, title, detail }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 5000)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
