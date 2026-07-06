import type { InputHTMLAttributes } from 'react'

export function TextInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`rounded-md border border-border bg-surface-2/50 px-3 py-1.5 text-sm outline-none transition-colors placeholder:text-text-3 focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent ${className}`}
      {...props}
    />
  )
}
