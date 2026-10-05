'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Wine, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { Modal } from '@/components/ui/modal'
import { pickLocalized } from '@/lib/localized'
import type { Locale } from '@/lib/matching'
import { createClient } from '@/lib/supabase/client'
import { searchBottlesCatalog, type BottleCatalogRow, type SpiritTypeRow } from '@/lib/supabase/queries'
import { SPIRIT_ICON_CLASS } from './spirit-colors'

export interface AddBottleModalProps {
  open: boolean
  locale: Locale
  spiritTypes: SpiritTypeRow[]
  existingCatalogBottleIds: ReadonlySet<string>
  initialCategory?: string
  initialSpiritTypeId?: string
  onClose: () => void
  onAddCatalog: (bottle: BottleCatalogRow, status: 'owned' | 'wishlist') => Promise<boolean>
  onAddCustom: (input: { customName: string; spiritTypeId: string; volumeMl?: number }, status: 'owned' | 'wishlist') => Promise<boolean>
}

const categories = ['gin', 'whisky', 'rum', 'vodka', 'tequila', 'brandy', 'liqueur'] as const
const inputClass = 'h-11 w-full rounded-sm border border-control-border bg-paper-raised px-md font-ui text-body text-ink placeholder:text-ink-faint focus-visible:focus-ring'

export function AddBottleModal({
  open,
  locale,
  spiritTypes,
  existingCatalogBottleIds,
  initialCategory,
  initialSpiritTypeId,
  onClose,
  onAddCatalog,
  onAddCustom,
}: AddBottleModalProps) {
  const t = useTranslations('cabinet')
  const categoryT = useTranslations('spiritCategory')
  const sb = useMemo(() => createClient(), [])
  const typeById = useMemo(() => new Map(spiritTypes.map((type) => [type.id, type])), [spiritTypes])
  const [view, setView] = useState<'search' | 'manual'>('search')
  const [spiritTypeFilter, setSpiritTypeFilter] = useState<string | null>(initialSpiritTypeId ?? null)
  const [category, setCategory] = useState<string | null>(
    (initialSpiritTypeId ? typeById.get(initialSpiritTypeId)?.category : undefined) ?? initialCategory ?? null
  )
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<BottleCatalogRow[]>([])
  const [searching, setSearching] = useState(false)
  const [pendingKey, setPendingKey] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const searchSequence = useRef(0)

  const [customName, setCustomName] = useState('')
  const [customTypeId, setCustomTypeId] = useState(initialSpiritTypeId ?? '')
  const [customVolume, setCustomVolume] = useState('')
  const [customStatus, setCustomStatus] = useState<'owned' | 'wishlist'>('owned')
  const [customErrors, setCustomErrors] = useState<{ name?: boolean; type?: boolean }>({})
  const [savingCustom, setSavingCustom] = useState(false)

  useEffect(() => {
    setSpiritTypeFilter(initialSpiritTypeId ?? null)
    setCategory((initialSpiritTypeId ? typeById.get(initialSpiritTypeId)?.category : undefined) ?? initialCategory ?? null)
    setCustomTypeId(initialSpiritTypeId ?? '')
    if (open) return
    searchSequence.current += 1
    setView('search')
    setQuery('')
    setResults([])
    setSearching(false)
    setPendingKey(null)
    setFailed(false)
    setCustomName('')
    setCustomVolume('')
    setCustomStatus('owned')
    setCustomErrors({})
    setSavingCustom(false)
  }, [open, initialCategory, initialSpiritTypeId, typeById])

  useEffect(() => {
    const q = query.trim()
    const sequence = ++searchSequence.current
    if (!open || view !== 'search' || q === '') {
      setResults([])
      setSearching(false)
      return
    }
    setSearching(true)
    const timer = setTimeout(async () => {
      try {
        const rows = await searchBottlesCatalog(sb, q)
        if (searchSequence.current === sequence) setResults(rows)
      } catch {
        if (searchSequence.current === sequence) setResults([])
      } finally {
        if (searchSequence.current === sequence) setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [open, view, query, sb])

  const visibleResults = useMemo(() => {
    if (spiritTypeFilter !== null) return results.filter((bottle) => bottle.spirit_type_id === spiritTypeFilter)
    if (category === null) return results
    return results.filter((bottle) => typeById.get(bottle.spirit_type_id)?.category === category)
  }, [results, spiritTypeFilter, category, typeById])

  async function handleAddCatalog(bottle: BottleCatalogRow, status: 'owned' | 'wishlist') {
    if (pendingKey !== null) return
    setFailed(false)
    setPendingKey(`${bottle.id}:${status}`)
    try {
      if (!(await onAddCatalog(bottle, status))) setFailed(true)
    } catch {
      setFailed(true)
    } finally {
      setPendingKey(null)
    }
  }

  async function handleSaveCustom() {
    if (savingCustom) return
    const errors = { name: customName.trim() === '', type: customTypeId === '' }
    setCustomErrors(errors)
    if (errors.name || errors.type) return
    setFailed(false)
    setSavingCustom(true)
    const volume = Number(customVolume)
    try {
      const ok = await onAddCustom({
        customName: customName.trim(),
        spiritTypeId: customTypeId,
        ...(Number.isInteger(volume) && volume > 0 ? { volumeMl: volume } : {}),
      }, customStatus)
      if (ok) onClose()
      else setFailed(true)
    } catch {
      setFailed(true)
    } finally {
      setSavingCustom(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={view === 'search' ? t('addModalTitle') : t('manualAddTitle')}>
      {failed && <p role="alert" className="mb-md rounded-sm bg-danger-soft px-md py-sm font-ui text-caption text-danger">{t('mutationFailed')}</p>}
      {view === 'search' ? (
        <div className="flex flex-col gap-md">
          <label className="sr-only" htmlFor="catalog-search">{t('addSearchPlaceholder')}</label>
          <input
            id="catalog-search"
            type="search"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('addSearchPlaceholder')}
            className={inputClass}
          />
          <div className="flex gap-sm overflow-x-auto pb-xs">
            <Chip selected={spiritTypeFilter === null && category === null} onClick={() => { setSpiritTypeFilter(null); setCategory(null) }}>
              {t('filterAll')}
            </Chip>
            {categories.map((item) => (
              <Chip
                key={item}
                selected={category === item}
                onClick={() => { setSpiritTypeFilter(null); setCategory(item) }}
                colorDot={`spirit-${item}`}
              >
                {categoryT(item)}
              </Chip>
            ))}
          </div>
          {spiritTypeFilter && (
            <div className="flex">
              <Chip selected onClick={() => setSpiritTypeFilter(null)}>
                {(() => {
                  const type = typeById.get(spiritTypeFilter)
                  return type ? pickLocalized(type as unknown as Record<string, unknown>, 'name', locale) : ''
                })()}
                <X className="size-4" aria-hidden="true" />
              </Chip>
            </div>
          )}
          <ul className="flex max-h-80 flex-col gap-xs overflow-y-auto">
            {searching && <li className="px-md py-sm font-ui text-caption text-ink-faint">{t('searching')}</li>}
            {!searching && query.trim() !== '' && visibleResults.length === 0 && (
              <li className="px-md py-sm font-ui text-caption text-ink-faint">{t('searchEmpty')}</li>
            )}
            {!searching && visibleResults.map((bottle) => {
              const type = typeById.get(bottle.spirit_type_id)
              const iconClass = (type && SPIRIT_ICON_CLASS[type.category]) || 'text-ink-faint'
              const alreadyAdded = existingCatalogBottleIds.has(bottle.id)
              return (
                <li key={bottle.id} className="flex flex-wrap items-center gap-md rounded-sm px-md py-sm hover:bg-paper-hover">
                  <Wine className={`size-5 shrink-0 ${iconClass}`} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-ui text-body text-ink">{pickLocalized(bottle as unknown as Record<string, unknown>, 'name', locale)}</p>
                    <p className="truncate font-ui text-caption text-ink-faint">
                      {[bottle.brand, type ? pickLocalized(type as unknown as Record<string, unknown>, 'name', locale) : null].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  {alreadyAdded ? (
                    <span className="shrink-0 rounded-pill bg-paper-deep px-md py-xs font-ui text-caption text-ink-faint">{t('alreadyInCabinet')}</span>
                  ) : (
                    <span className="flex shrink-0 gap-xs">
                      <Button variant="success" size="md" type="button" loading={pendingKey === `${bottle.id}:owned`} disabled={pendingKey !== null} onClick={() => void handleAddCatalog(bottle, 'owned')}>
                        {t('addAsOwned')}
                      </Button>
                      <Button variant="secondary" size="md" type="button" loading={pendingKey === `${bottle.id}:wishlist`} disabled={pendingKey !== null} onClick={() => void handleAddCatalog(bottle, 'wishlist')}>
                        {t('addAsWishlist')}
                      </Button>
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-md rounded-sm bg-info-soft px-lg py-md">
            <p className="font-ui text-caption text-info">{t('manualAddHint')}</p>
            <button type="button" onClick={() => setView('manual')} className="font-ui text-caption font-semibold text-info underline underline-offset-2 focus-visible:focus-ring">
              {t('manualAddAction')}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-lg">
          <div className="flex flex-col gap-xs">
            <label htmlFor="custom-name" className="font-ui text-caption font-semibold text-ink-soft">{t('customNameLabel')}</label>
            <input id="custom-name" value={customName} onChange={(event) => setCustomName(event.target.value)} aria-invalid={!!customErrors.name} aria-describedby={customErrors.name ? 'custom-name-error' : undefined} placeholder={t('customNamePlaceholder')} className={`${inputClass} ${customErrors.name ? 'border-danger bg-danger-soft' : ''}`} />
            {customErrors.name && <p id="custom-name-error" role="alert" className="font-ui text-caption text-danger">{t('customNameRequired')}</p>}
          </div>
          <div className="flex flex-col gap-xs">
            <label htmlFor="custom-type" className="font-ui text-caption font-semibold text-ink-soft">{t('customTypeLabel')}</label>
            <select id="custom-type" value={customTypeId} onChange={(event) => setCustomTypeId(event.target.value)} aria-invalid={!!customErrors.type} aria-describedby={customErrors.type ? 'custom-type-error' : undefined} className={`${inputClass} ${customErrors.type ? 'border-danger bg-danger-soft' : ''}`}>
              <option value="">{t('customTypePlaceholder')}</option>
              {spiritTypes.map((type) => <option key={type.id} value={type.id}>{pickLocalized(type as unknown as Record<string, unknown>, 'name', locale)}</option>)}
            </select>
            {customErrors.type && <p id="custom-type-error" role="alert" className="font-ui text-caption text-danger">{t('customTypeRequired')}</p>}
          </div>
          <div className="flex flex-col gap-xs">
            <label htmlFor="custom-volume" className="font-ui text-caption font-semibold text-ink-soft">{t('customVolumeLabel')}</label>
            <input id="custom-volume" type="number" min={1} step={1} value={customVolume} onChange={(event) => setCustomVolume(event.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-wrap items-center gap-sm">
            <span className="font-ui text-caption font-semibold text-ink-soft">{t('statusLabel')}</span>
            <Chip selected={customStatus === 'owned'} onClick={() => setCustomStatus('owned')}>{t('statusOwned')}</Chip>
            <Chip selected={customStatus === 'wishlist'} onClick={() => setCustomStatus('wishlist')}>{t('statusWishlist')}</Chip>
          </div>
          <div className="flex justify-between gap-sm">
            <Button variant="secondary" size="md" type="button" onClick={() => setView('search')}>{t('backToSearch')}</Button>
            <Button variant="primary" size="md" type="button" loading={savingCustom} disabled={savingCustom} onClick={() => void handleSaveCustom()}>{t('saveCustom')}</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
