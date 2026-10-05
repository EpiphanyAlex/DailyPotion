import type { CabinetBottle } from './to-cabinet-bottles'

export type CabinetFilter =
  | { kind: 'all' }
  | { kind: 'status'; status: 'owned' | 'wishlist' }
  | { kind: 'category'; category: string }
  | { kind: 'recent' }

export const RECENT_DAYS = 30
const dayMs = 24 * 60 * 60 * 1000

export function filterBottles(
  bottles: CabinetBottle[],
  query: string,
  filter: CabinetFilter,
  now: Date = new Date()
): CabinetBottle[] {
  const needle = query.trim().toLocaleLowerCase()
  return bottles.filter((bottle) => {
    if (needle && !bottle.searchText.includes(needle)) return false
    switch (filter.kind) {
      case 'all':
        return true
      case 'status':
        return bottle.status === filter.status
      case 'category':
        return bottle.spiritCategory === filter.category
      case 'recent': {
        const age = now.getTime() - Date.parse(bottle.createdAt)
        return age >= 0 && age <= RECENT_DAYS * dayMs
      }
    }
  })
}
