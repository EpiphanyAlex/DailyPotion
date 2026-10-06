'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { EmptyState } from '@/components/ui/empty-state'
import type { Locale, RecipeForMatching } from '@/lib/matching'
import type { SpiritTypeRow, UserBottleRow } from '@/lib/supabase/queries'
import { toOwnedBottles } from '@/lib/supabase/transform'
import { AddBottleModal } from './add-bottle-modal'
import { BottleCard } from './bottle-card'
import { filterBottles, type CabinetFilter } from './filter-bottles'
import { removeImpact } from './remove-impact'
import { toCabinetBottles } from './to-cabinet-bottles'
import { useCabinetMutations } from './use-cabinet-mutations'

const categories = ['gin', 'whisky', 'rum', 'vodka', 'tequila', 'brandy', 'liqueur'] as const

export interface CabinetClientProps {
  locale: Locale
  initialRows: UserBottleRow[]
  spiritTypes: SpiritTypeRow[]
  recipes: RecipeForMatching[]
}

export function CabinetClient({ locale, initialRows, spiritTypes, recipes }: CabinetClientProps) {
  const t = useTranslations('cabinet')
  const categoryT = useTranslations('spiritCategory')
  const common = useTranslations('common')
  const mutations = useCabinetMutations(initialRows)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<CabinetFilter>({ kind: 'all' })
  const [addOpen, setAddOpen] = useState(false)
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null)

  const bottles = useMemo(() => toCabinetBottles(mutations.rows, spiritTypes, locale), [mutations.rows, spiritTypes, locale])
  const visible = useMemo(() => filterBottles(bottles, query, filter), [bottles, query, filter])
  const owned = useMemo(() => toOwnedBottles(mutations.rows), [mutations.rows])
  const existingCatalogBottleIds = useMemo(
    () => new Set(mutations.rows.map((row) => row.bottle_id).filter((id): id is string => id !== null)),
    [mutations.rows]
  )
  const pendingImpact = useMemo(
    () => pendingRemoveId ? removeImpact(recipes, owned, pendingRemoveId) : 0,
    [pendingRemoveId, recipes, owned]
  )
  const isEmptyCabinet = bottles.length === 0
  const isFilteredEmpty = !isEmptyCabinet && visible.length === 0

  function clearFilters() {
    setQuery('')
    setFilter({ kind: 'all' })
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-xl px-lg py-xl md:px-xxl">
      <header className="flex items-center justify-between gap-md">
        <h1 className="font-display text-page-title text-ink">{t('title')}</h1>
        <div className="hidden md:block">
          <Button variant="primary" size="md" type="button" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" aria-hidden="true" />
            {t('addBottle')}
          </Button>
        </div>
      </header>

      {mutations.errorKey && (
        <div role="alert" className="flex items-center justify-between gap-md rounded-sm bg-danger-soft px-lg py-md">
          <p className="font-ui text-caption text-danger">{t(mutations.errorKey)}</p>
          <button type="button" onClick={mutations.clearError} aria-label={common('cancel')} className="shrink-0 rounded-pill p-xs text-danger hover:bg-paper-hover focus-visible:focus-ring">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {mutations.refreshFailed && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-md rounded-sm bg-info-soft px-lg py-md">
          <p className="font-ui text-caption text-info">{t('refreshFailed')}</p>
          <Button type="button" variant="secondary" loading={mutations.refreshing} onClick={() => void mutations.retryRefresh()}>
            {t('retryRefresh')}
          </Button>
        </div>
      )}

      <div className="sticky top-0 z-30 -mx-lg flex flex-col gap-md bg-paper px-lg py-md md:static md:mx-0 md:px-0 md:py-0">
        <div className="relative">
          <Search className="absolute left-md top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
          <label htmlFor="cabinet-search" className="sr-only">{t('searchPlaceholder')}</label>
          <input
            id="cabinet-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('searchPlaceholder')}
            className="h-11 w-full rounded-pill border border-control-border bg-paper-raised pl-xxl pr-md font-ui text-body text-ink placeholder:text-ink-faint focus-visible:focus-ring"
          />
        </div>
        <div className="flex gap-sm overflow-x-auto pb-xs md:flex-wrap md:overflow-visible">
          <Chip selected={filter.kind === 'all'} onClick={() => setFilter({ kind: 'all' })}>{t('filterAll')}</Chip>
          {categories.map((category) => (
            <Chip
              key={category}
              selected={filter.kind === 'category' && filter.category === category}
              onClick={() => setFilter({ kind: 'category', category })}
              colorDot={`spirit-${category}`}
            >
              {categoryT(category)}
            </Chip>
          ))}
          <Chip selected={filter.kind === 'status' && filter.status === 'owned'} onClick={() => setFilter({ kind: 'status', status: 'owned' })}>
            {t('filterOwned')}
          </Chip>
          <Chip selected={filter.kind === 'status' && filter.status === 'wishlist'} onClick={() => setFilter({ kind: 'status', status: 'wishlist' })}>
            {t('filterWishlist')}
          </Chip>
          <Chip selected={filter.kind === 'recent'} onClick={() => setFilter({ kind: 'recent' })}>{t('filterRecent')}</Chip>
        </div>
      </div>

      {isEmptyCabinet && (
        <EmptyState
          title={t('emptyTitle')}
          description={t('emptyDescription')}
          action={<Button variant="primary" size="md" type="button" onClick={() => setAddOpen(true)}>{t('addBottle')}</Button>}
        />
      )}
      {isFilteredEmpty && (
        <EmptyState
          title={t('noFilterResults')}
          action={<Button variant="secondary" size="md" type="button" onClick={clearFilters}>{common('clearFilters')}</Button>}
        />
      )}
      {visible.length > 0 && (
        <ul className="flex flex-col gap-md md:grid md:grid-cols-2 md:gap-lg lg:grid-cols-3">
          {visible.map((bottle) => (
            <BottleCard
              key={bottle.id}
              bottle={bottle}
              onToggleStatus={() => void mutations.toggleStatus(bottle.id)}
              onRequestRemove={() => setPendingRemoveId(bottle.id)}
              removeConfirm={pendingRemoveId === bottle.id ? {
                affectedCount: pendingImpact,
                onConfirm: () => {
                  setPendingRemoveId(null)
                  void mutations.remove(bottle.id)
                },
                onCancel: () => setPendingRemoveId(null),
              } : null}
            />
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setAddOpen(true)}
        aria-label={t('addBottle')}
        className="fixed bottom-24 right-lg z-40 flex h-14 items-center justify-center gap-sm rounded-pill bg-accent px-xl font-ui text-body font-semibold text-on-accent shadow-floating hover:bg-accent-hover focus-visible:focus-ring md:hidden"
      >
        <Plus className="size-5" aria-hidden="true" />
        {t('addBottle')}
      </button>

      <AddBottleModal
        open={addOpen}
        locale={locale}
        spiritTypes={spiritTypes}
        existingCatalogBottleIds={existingCatalogBottleIds}
        onClose={() => setAddOpen(false)}
        onAddCatalog={mutations.addCatalog}
        onAddCustom={mutations.addCustom}
      />
    </main>
  )
}
