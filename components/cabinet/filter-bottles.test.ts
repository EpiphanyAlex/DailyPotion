import { describe, expect, it } from 'vitest'
import { filterBottles } from './filter-bottles'
import type { CabinetBottle } from './to-cabinet-bottles'

const bottle = (id: string, status: 'owned' | 'wishlist', category: string, createdAt: string, searchText: string): CabinetBottle => ({
  id, bottleId: id, name: id, spiritTypeId: category, spiritTypeName: category,
  spiritCategory: category, volumeMl: null, status, createdAt, imageUrl: null, searchText,
})

const bottles = [
  bottle('roku', 'owned', 'gin', '2026-09-30T00:00:00Z', '六金酒 roku gin suntory'),
  bottle('campari', 'wishlist', 'liqueur', '2026-08-01T00:00:00Z', 'campari 金巴利'),
  bottle('future', 'owned', 'gin', '2026-10-10T00:00:00Z', 'future gin'),
]

describe('filterBottles', () => {
  it('searches the bilingual text and combines it with status or category', () => {
    expect(filterBottles(bottles, ' ROKU ', { kind: 'status', status: 'owned' }).map((b) => b.id)).toEqual(['roku'])
    expect(filterBottles(bottles, '金巴利', { kind: 'category', category: 'liqueur' }).map((b) => b.id)).toEqual(['campari'])
    expect(filterBottles(bottles, 'campari', { kind: 'status', status: 'owned' })).toEqual([])
  })

  it('includes only the previous 30 days for Recently Added', () => {
    expect(filterBottles(bottles, '', { kind: 'recent' }, new Date('2026-10-05T00:00:00Z')).map((b) => b.id)).toEqual(['roku'])
  })
})
