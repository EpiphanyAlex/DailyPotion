'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal({ open, onClose, title, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])
  const titleId = useId()
  const t = useTranslations('common')

  useEffect(() => {
    if (!open) return
    previousFocusRef.current = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const preferredFocus = panelRef.current?.querySelector<HTMLElement>('[data-autofocus]')
    const firstFocusable = preferredFocus ?? panelRef.current?.querySelector<HTMLElement>(focusableSelector)
    firstFocusable?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusables = Array.from(panelRef.current.querySelectorAll<HTMLElement>(focusableSelector))
      if (focusables.length === 0) {
        event.preventDefault()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && (document.activeElement === first || !panelRef.current.contains(document.activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !panelRef.current.contains(document.activeElement))) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocusRef.current?.focus()
    }
  }, [open])

  if (!open) return null

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-image-overlay p-lg"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="max-h-full w-full max-w-(--container-lg) overflow-y-auto rounded-md border border-border bg-paper-raised p-xl shadow-floating"
      >
        <div className="mb-lg flex items-center justify-between gap-md">
          <h2 id={titleId} className="font-display text-card-title text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('cancel')}
            className="rounded-pill p-xs text-ink-faint hover:bg-paper-hover focus-visible:focus-ring"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
