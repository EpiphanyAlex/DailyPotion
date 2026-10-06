'use client'

import type { ReactNode } from 'react'

const colorDotClasses: Record<string, string> = {
  'spirit-gin': 'bg-spirit-gin',
  'spirit-whisky': 'bg-spirit-whisky',
  'spirit-rum': 'bg-spirit-rum',
  'spirit-vodka': 'bg-spirit-vodka',
  'spirit-tequila': 'bg-spirit-tequila',
  'spirit-brandy': 'bg-spirit-brandy',
  'spirit-liqueur': 'bg-spirit-liqueur',
}

export interface ChipProps {
  selected?: boolean
  onClick?: () => void
  colorDot?: string
  children: ReactNode
}

export function Chip({ selected = false, onClick, colorDot, children }: ChipProps) {
  const dotClass = colorDot ? colorDotClasses[colorDot] : undefined
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`inline-flex shrink-0 items-center gap-sm whitespace-nowrap rounded-pill border px-md py-sm font-ui text-caption transition-colors focus-visible:focus-ring ${selected ? 'border-accent bg-accent text-on-accent' : 'border-border bg-paper-raised text-ink-soft hover:bg-paper-hover'}`}
    >
      {dotClass && <span aria-hidden="true" className={`size-2 rounded-pill ${dotClass}`} />}
      {children}
    </button>
  )
}
