import { CircleAlert } from 'lucide-react'
import { useId, type InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string | null
}
export function Input({
  label,
  error,
  id,
  className = '',
  ...props
}: InputProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <div className="flex flex-col gap-xs">
      <label
        htmlFor={inputId}
        className="font-ui text-caption font-semibold text-ink-soft"
      >
        {label}
      </label>
      <input
        {...props}
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`h-11 w-full rounded-sm border bg-paper-raised px-md font-ui text-body text-ink placeholder:text-ink-faint focus-visible:focus-ring disabled:bg-surface-disabled ${error ? 'border-2 border-danger bg-danger-soft' : 'border-control-border'} ${className}`}
      />
      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="flex items-center gap-xs font-ui text-caption text-danger"
        >
          <CircleAlert className="size-4" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}
