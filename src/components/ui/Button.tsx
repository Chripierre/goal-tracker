import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'ghost' | 'danger'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent font-medium text-white hover:bg-accent-hover',
  ghost: 'text-text-2 hover:bg-surface-2 hover:text-text',
  danger: 'border border-danger/30 text-danger hover:bg-danger/10',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`rounded-md px-3 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
