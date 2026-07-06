import type { SelectHTMLAttributes } from 'react'

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`rounded-md border border-border bg-surface-2/50 px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent ${className}`}
      {...props}
    />
  )
}
