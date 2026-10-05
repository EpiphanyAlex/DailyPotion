import { pickLocalized } from '@/lib/localized'
import type { Locale } from '@/lib/matching'
import type { SpiritTypeRow, UserBottleRow } from '@/lib/supabase/queries'

export interface CabinetBottle {
  id: string
  bottleId: string | null
  name: string
  spiritTypeId: string
  spiritTypeName: string
  spiritCategory: string
  volumeMl: number | null
  status: 'owned' | 'wishlist'
  createdAt: string
  imageUrl: string | null
  searchText: string
}

/** Convert private bottle rows into bilingual display data without changing the matching input. */
export function toCabinetBottles(
  rows: UserBottleRow[],
  spiritTypes: SpiritTypeRow[],
  locale: Locale
): CabinetBottle[] {
  const typeById = new Map(spiritTypes.map((type) => [type.id, type]))
  return rows
    .map((row): CabinetBottle => {
      const catalog = row.bottles_catalog
      const spiritTypeId = catalog?.spirit_type_id ?? row.spirit_type_id ?? ''
      const spiritType = typeById.get(spiritTypeId)
      return {
        id: row.id,
        bottleId: catalog?.id ?? null,
        name: catalog
          ? pickLocalized(catalog as unknown as Record<string, unknown>, 'name', locale)
          : row.custom_name ?? '',
        spiritTypeId,
        spiritTypeName: spiritType
          ? pickLocalized(spiritType as unknown as Record<string, unknown>, 'name', locale)
          : '',
        spiritCategory: spiritType?.category ?? 'other',
        volumeMl: catalog?.volume_ml ?? row.volume_ml ?? null,
        status: row.status as 'owned' | 'wishlist',
        createdAt: row.created_at,
        imageUrl: catalog?.image_url ?? null,
        searchText: [catalog?.name_zh, catalog?.name_en, catalog?.brand, row.custom_name]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase(),
      }
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
