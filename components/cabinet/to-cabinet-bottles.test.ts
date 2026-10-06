import { describe, expect, it } from 'vitest'
import type { SpiritTypeRow, UserBottleRow } from '@/lib/supabase/queries'
import { toCabinetBottles } from './to-cabinet-bottles'

const gin = {
  id: 'gin', name_zh: '金酒', name_en: 'Gin', category: 'gin',
} as SpiritTypeRow

const catalogBottle = {
  id: 'older', bottle_id: 'roku', custom_name: null, spirit_type_id: null,
  volume_ml: null, status: 'owned', created_at: '2026-09-01T00:00:00Z',
  bottles_catalog: {
    id: 'roku', slug: 'roku-gin', name_zh: '六金酒', name_en: 'Roku Gin',
    brand: 'Suntory', volume_ml: 700, spirit_type_id: 'gin', image_url: null,
  },
} as UserBottleRow

const customBottle = {
  id: 'newer', bottle_id: null, custom_name: '自制金酒', spirit_type_id: 'gin',
  volume_ml: 500, status: 'wishlist', created_at: '2026-09-02T00:00:00Z',
  bottles_catalog: null,
} as UserBottleRow

describe('toCabinetBottles', () => {
  it('uses localized catalog names, preserves catalog fields, and sorts newest first', () => {
    const result = toCabinetBottles([catalogBottle, customBottle], [gin], 'en')
    expect(result.map((bottle) => bottle.id)).toEqual(['newer', 'older'])
    expect(result[1]).toMatchObject({
      bottleId: 'roku', name: 'Roku Gin', spiritTypeName: 'Gin',
      spiritCategory: 'gin', volumeMl: 700, status: 'owned',
    })
    expect(result[1].searchText).toContain('六金酒 roku gin suntory')
  })

  it('maps custom bottles from their own type and volume fields', () => {
    expect(toCabinetBottles([customBottle], [gin], 'zh')[0]).toMatchObject({
      bottleId: null, name: '自制金酒', spiritTypeName: '金酒',
      spiritCategory: 'gin', volumeMl: 500, status: 'wishlist',
    })
  })
})
