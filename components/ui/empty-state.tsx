import type { ReactNode } from 'react'

export interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-md rounded-md bg-paper-deep px-xl py-xxl text-center">
      <h2 className="font-display text-card-title text-ink">{title}</h2>
      {description && <p className="max-w-md font-body text-body text-ink-soft">{description}</p>}
      {action}
    </div>
  )
}
