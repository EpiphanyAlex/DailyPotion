'use client'

import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export interface RemoveBottleConfirmProps {
  bottleName: string
  affectedCount: number
  onConfirm: () => void
  onCancel: () => void
}

export function RemoveBottleConfirm({ bottleName, affectedCount, onConfirm, onCancel }: RemoveBottleConfirmProps) {
  const t = useTranslations('cabinet')
  const common = useTranslations('common')
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    rootRef.current?.querySelector('button')?.focus()
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [onCancel])

  return (
    <div
      ref={rootRef}
      role="alertdialog"
      aria-label={t('remove')}
      aria-describedby="remove-impact-description"
      className="absolute right-lg top-xxl z-40 w-64 rounded-md border border-border bg-paper-raised p-lg shadow-floating"
    >
      <p className="truncate font-ui text-body font-semibold text-ink">{bottleName}</p>
      <p id="remove-impact-description" className="mt-xs font-ui text-caption text-ink-soft">
        {t('removeImpact', { count: affectedCount })}
      </p>
      <div className="mt-md flex justify-end gap-sm">
        <Button variant="secondary" size="md" type="button" onClick={onCancel}>
          {common('cancel')}
        </Button>
        <Button variant="danger" size="md" type="button" onClick={onConfirm}>
          {t('removeConfirm')}
        </Button>
      </div>
    </div>
  )
}
