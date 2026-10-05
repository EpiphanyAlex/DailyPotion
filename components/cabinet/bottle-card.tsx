'use client'

import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { MoreVertical, Wine } from 'lucide-react'
import { Dropdown } from '@/components/ui/dropdown'
import { RemoveBottleConfirm } from './remove-bottle-confirm'
import { SPIRIT_DOT_CLASS } from './spirit-colors'
import type { CabinetBottle } from './to-cabinet-bottles'

export interface BottleCardProps {
  bottle: CabinetBottle
  removeConfirm: { affectedCount: number; onConfirm: () => void; onCancel: () => void } | null
  onToggleStatus: () => void
  onRequestRemove: () => void
}

export function BottleCard({ bottle, removeConfirm, onToggleStatus, onRequestRemove }: BottleCardProps) {
  const t = useTranslations('cabinet')
  const locale = useLocale()
  const owned = bottle.status === 'owned'
  const dotClass = SPIRIT_DOT_CLASS[bottle.spiritCategory]
  const dateLabel = bottle.createdAt
    ? new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(bottle.createdAt))
    : ''

  return (
    <li className="relative flex min-w-0 gap-md rounded-md border border-border bg-paper-raised p-lg transition-colors hover:bg-paper-hover md:flex-col">
      <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-paper-deep md:aspect-square md:size-auto md:w-full">
        {bottle.imageUrl ? (
          <Image src={bottle.imageUrl} alt={bottle.name} fill sizes="(max-width: 767px) 64px, (max-width: 1023px) 45vw, 30vw" className="object-cover" unoptimized />
        ) : (
          <Wine className="size-6 text-ink-faint" aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-sm">
          <h3 className="truncate font-display text-card-title text-ink">{bottle.name}</h3>
          <Dropdown
            trigger={<MoreVertical className="size-4" aria-hidden="true" />}
            triggerLabel={t('moreActions')}
            items={[
              { key: 'toggle', label: owned ? t('markWishlist') : t('markOwned') },
              { key: 'remove', label: t('remove'), danger: true },
            ]}
            onSelect={(key) => {
              if (key === 'toggle') onToggleStatus()
              if (key === 'remove') onRequestRemove()
            }}
          />
        </div>
        <p className="mt-xs flex items-center gap-sm font-ui text-caption text-ink-soft">
          {dotClass && <span aria-hidden="true" className={`size-2 rounded-pill ${dotClass}`} />}
          <span className="truncate">{bottle.spiritTypeName}</span>
          {bottle.volumeMl != null && <span className="shrink-0 text-ink-faint">{t('volume', { ml: bottle.volumeMl })}</span>}
        </p>
        <div className="mt-sm flex flex-wrap items-center justify-between gap-sm">
          <span className={`rounded-pill px-md py-xs font-ui text-caption ${owned ? 'bg-success-soft text-success' : 'bg-paper-deep text-ink-soft'}`}>
            {owned ? t('statusOwned') : t('statusWishlist')}
          </span>
          {dateLabel && <span className="truncate font-ui text-caption text-ink-faint">{t('addedOn', { date: dateLabel })}</span>}
        </div>
      </div>
      {removeConfirm && (
        <RemoveBottleConfirm
          bottleName={bottle.name}
          affectedCount={removeConfirm.affectedCount}
          onConfirm={removeConfirm.onConfirm}
          onCancel={removeConfirm.onCancel}
        />
      )}
    </li>
  )
}
