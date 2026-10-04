import { LoaderCircle } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger'
export type ButtonSize = 'md' | 'lg'
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}
const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-pressed',
  secondary:
    'border border-border bg-paper-raised text-ink hover:bg-paper-hover active:bg-paper-selected',
  success: 'bg-success text-on-accent hover:opacity-90 active:opacity-80',
  danger: 'bg-danger text-on-accent hover:opacity-90 active:opacity-80',
}
const sizes: Record<ButtonSize, string> = {
  md: 'h-10 px-5 text-body',
  lg: 'h-12 px-6 text-body',
}
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-sm rounded-pill font-ui font-semibold transition-colors focus-visible:focus-ring disabled:cursor-not-allowed disabled:border-transparent disabled:bg-surface-disabled disabled:text-ink-disabled disabled:opacity-100 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      )}
      {children}
    </button>
  )
}
