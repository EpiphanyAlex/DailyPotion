'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Check } from 'lucide-react'

export interface DropdownItem {
  key: string
  label: string
  danger?: boolean
}

export interface DropdownProps {
  trigger: ReactNode
  triggerLabel: string
  items: DropdownItem[]
  selectedKey?: string
  onSelect: (key: string) => void
  align?: 'left' | 'right'
}

export function Dropdown({ trigger, triggerLabel, items, selectedKey, onSelect, align = 'right' }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function focusMenuItem(index: number) {
    const buttons = menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')
    if (buttons?.length) buttons[(index + buttons.length) % buttons.length].focus()
  }

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={triggerLabel}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setOpen(true)
            requestAnimationFrame(() => focusMenuItem(0))
          }
        }}
        className="rounded-pill p-xs text-ink-faint hover:bg-paper-hover focus-visible:focus-ring"
      >
        {trigger}
      </button>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          onKeyDown={(event) => {
            const buttons = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [])
            const current = buttons.indexOf(document.activeElement as HTMLButtonElement)
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault()
              focusMenuItem(current + (event.key === 'ArrowDown' ? 1 : -1))
            } else if (event.key === 'Home') {
              event.preventDefault()
              focusMenuItem(0)
            } else if (event.key === 'End') {
              event.preventDefault()
              focusMenuItem(buttons.length - 1)
            }
          }}
          className={`absolute z-40 mt-xs min-w-40 rounded-md border border-border bg-paper-raised p-xs shadow-floating ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {items.map((item) => {
            const isSelected = item.key === selectedKey
            const tone = item.danger
              ? 'text-danger hover:bg-paper-hover'
              : isSelected
                ? 'bg-paper-selected text-accent'
                : 'text-ink hover:bg-paper-hover'
            return (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false)
                  onSelect(item.key)
                  triggerRef.current?.focus()
                }}
                className={`flex w-full items-center justify-between gap-sm rounded-sm px-md py-sm text-left font-ui text-body focus-visible:focus-ring ${tone}`}
              >
                {item.label}
                {isSelected && <Check className="size-4" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
