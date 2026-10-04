import { describe, expect, it } from 'vitest'
import {
  becauseYouHave,
  bestNextType,
  cabinetStats,
  canMake,
  dailyPour,
  fnv1a,
  missingTypes,
  ownedTypeIdSet,
  type OwnedBottle,
  type RecipeForMatching,
} from './matching'

function recipe(slug: string, spiritTypeIds: string[], baseRating: number, basePopularity: number): RecipeForMatching {
  return { id: `r-${slug}`, slug, spiritTypeIds, baseRating, basePopularity }
}

const NEGRONI = recipe('negroni', ['gin', 'campari', 'sweet-vermouth'], 4.8, 95)
const GIN_TONIC = recipe('gin-tonic', ['gin'], 4.2, 90)
const WHISKY_SOUR = recipe('whisky-sour', ['whisky'], 4.6, 80)
const MARTINEZ = recipe('martinez', ['gin', 'sweet-vermouth', 'maraschino'], 4.5, 60)
const LAST_WORD = recipe('last-word', ['gin', 'chartreuse', 'maraschino'], 4.4, 70)
const NO_SPIRIT = recipe('virgin-mojito', [], 4.9, 50)
const RECIPES = [NEGRONI, GIN_TONIC, WHISKY_SOUR, MARTINEZ, LAST_WORD, NO_SPIRIT]

const bottle = (id: string, spiritTypeId: string, day: string): OwnedBottle => ({
  id, spiritTypeId, createdAt: `2026-07-${day}T10:00:00.000Z`,
})
// OwnedBottle contains only owned rows. toOwnedBottles filters wishlist before this module.
const GIN_ONLY = [bottle('gin-1', 'gin', '01')]
const GIN_TWICE_CAMPARI = [...GIN_ONLY, bottle('gin-2', 'gin', '03'), bottle('campari-1', 'campari', '02')]
const NEGRONI_CABINET = [...GIN_ONLY, bottle('campari-1', 'campari', '02'), bottle('vermouth-1', 'sweet-vermouth', '03')]
const VERMOUTH_CHARTREUSE = [...GIN_ONLY, bottle('vermouth-1', 'sweet-vermouth', '02'), bottle('chartreuse-1', 'chartreuse', '03')]
const SORT_ORDER = new Map([
  ['gin', 1], ['whisky', 2], ['campari', 7], ['sweet-vermouth', 8], ['maraschino', 9], ['chartreuse', 10],
])

describe('fnv1a', () => {
  it('matches the empty-string offset basis', () => expect(fnv1a('')).toBe(2166136261))
  it('matches published 32-bit FNV-1a ASCII vectors', () => {
    expect(fnv1a('a')).toBe(3826002220)
    expect(fnv1a('b')).toBe(3876335077)
    expect(fnv1a('foobar')).toBe(3214735720)
  })
  it('returns a deterministic unsigned 32-bit integer', () => {
    const value = fnv1a('user-12026-07-10')
    expect(fnv1a('user-12026-07-10')).toBe(value)
    expect(Number.isInteger(value)).toBe(true)
    expect(value).toBeGreaterThanOrEqual(0)
    expect(value).toBeLessThan(2 ** 32)
  })
})

describe('ownedTypeIdSet', () => {
  it('maps owned bottles to matching units', () => {
    expect(ownedTypeIdSet(NEGRONI_CABINET)).toEqual(new Set(['gin', 'campari', 'sweet-vermouth']))
  })
  it('deduplicates two bottles of the same matching unit', () => {
    expect(ownedTypeIdSet(GIN_TWICE_CAMPARI)).toEqual(new Set(['gin', 'campari']))
  })
  it('handles an empty cabinet', () => expect(ownedTypeIdSet([])).toEqual(new Set()))
})

describe('canMake', () => {
  it('accepts a recipe when all tracked spirits are owned', () => {
    expect(canMake(NEGRONI, ownedTypeIdSet(NEGRONI_CABINET))).toBe(true)
    expect(canMake(GIN_TONIC, ownedTypeIdSet(GIN_ONLY))).toBe(true)
  })
  it('rejects a recipe when any tracked spirit is missing', () => {
    expect(canMake(NEGRONI, ownedTypeIdSet(GIN_ONLY))).toBe(false)
  })
  it('rejects a recipe for an empty cabinet', () => expect(canMake(GIN_TONIC, new Set())).toBe(false))
  it('rejects a recipe with no tracked spirits even for a full cabinet', () => {
    expect(canMake(NO_SPIRIT, ownedTypeIdSet(NEGRONI_CABINET))).toBe(false)
    expect(canMake(NO_SPIRIT, new Set())).toBe(false)
  })
})

describe('missingTypes', () => {
  it('preserves ingredient order', () => {
    expect(missingTypes(NEGRONI, new Set())).toEqual(['gin', 'campari', 'sweet-vermouth'])
    expect(missingTypes(NEGRONI, new Set(['campari']))).toEqual(['gin', 'sweet-vermouth'])
  })
  it('uses matching units, so two owned gin bottles do not change the result', () => {
    expect(missingTypes(NEGRONI, ownedTypeIdSet(GIN_TWICE_CAMPARI))).toEqual(['sweet-vermouth'])
  })
  it('reports a repeated missing matching unit once at its first position', () => {
    expect(missingTypes(recipe('double-gin', ['gin', 'campari', 'gin'], 4, 10), new Set())).toEqual(['gin', 'campari'])
  })
  it('returns empty for a makeable recipe', () => {
    expect(missingTypes(NEGRONI, ownedTypeIdSet(NEGRONI_CABINET))).toEqual([])
  })
  it('returns empty for a recipe with no tracked spirits, while canMake remains false', () => {
    expect(missingTypes(NO_SPIRIT, new Set())).toEqual([])
  })
})

describe('cabinetStats', () => {
  it('handles zero recipes without dividing by zero', () => {
    expect(cabinetStats([], GIN_ONLY)).toEqual({ bottlesOwned: 1, canMakeCount: 0, missingJustOneCount: 0, coveragePercent: 0 })
  })
  it('counts only recipes missing exactly one unit', () => {
    expect(cabinetStats([NEGRONI, WHISKY_SOUR], GIN_ONLY)).toEqual({
      bottlesOwned: 1, canMakeCount: 0, missingJustOneCount: 1, coveragePercent: 0,
    })
  })
  it('reports 100 percent when every recipe is makeable', () => {
    expect(cabinetStats([GIN_TONIC], GIN_ONLY)).toEqual({
      bottlesOwned: 1, canMakeCount: 1, missingJustOneCount: 0, coveragePercent: 100,
    })
  })
  it('uses bottle count and rounds recipe coverage (1 of 6 to 17 percent)', () => {
    expect(cabinetStats(RECIPES, GIN_TWICE_CAMPARI)).toEqual({
      bottlesOwned: 3, canMakeCount: 1, missingJustOneCount: 2, coveragePercent: 17,
    })
  })
})

describe('bestNextType', () => {
  it('chooses the unit that immediately unlocks the most recipes', () => {
    expect(bestNextType(RECIPES, ownedTypeIdSet(VERMOUTH_CHARTREUSE), SORT_ORDER)).toEqual({
      spiritTypeId: 'maraschino', unlockCount: 2,
    })
  })
  it('does not count recipes missing two or more units', () => {
    expect(bestNextType([NEGRONI, MARTINEZ, LAST_WORD], ownedTypeIdSet(GIN_ONLY), SORT_ORDER)).toBeNull()
  })
  it('breaks an unlock-count tie by spirit sort_order', () => {
    expect(bestNextType([NEGRONI, WHISKY_SOUR], ownedTypeIdSet(GIN_TWICE_CAMPARI), SORT_ORDER)).toEqual({
      spiritTypeId: 'whisky', unlockCount: 1,
    })
  })
  it('returns null when all recipes are makeable or the list is empty', () => {
    expect(bestNextType([NEGRONI, GIN_TONIC], ownedTypeIdSet(NEGRONI_CABINET), SORT_ORDER)).toBeNull()
    expect(bestNextType([], new Set(), SORT_ORDER)).toBeNull()
  })
  it('ignores a recipe with no tracked spirits', () => {
    expect(bestNextType([NO_SPIRIT], new Set(), SORT_ORDER)).toBeNull()
  })
})

describe('dailyPour', () => {
  const DATE = '2026-07-10'
  const RICH_OWNED = new Set(['gin', 'campari', 'sweet-vermouth', 'maraschino'])

  it('prefers a makeable recipe', () => {
    expect(dailyPour(RECIPES, ownedTypeIdSet(GIN_ONLY), { userId: 'user-1', dateKey: DATE })).toBe(GIN_TONIC)
  })
  it('falls back to a recipe missing just one unit', () => {
    expect(dailyPour([NEGRONI, WHISKY_SOUR, NO_SPIRIT], new Set(['campari']), {
      userId: 'user-1', dateKey: DATE,
    })).toBe(WHISKY_SOUR)
  })
  it('falls back to curated recipes at the inclusive 4.5 rating boundary', () => {
    expect(dailyPour([NEGRONI, LAST_WORD], new Set(), { userId: 'user-1', dateKey: DATE })).toBe(NEGRONI)
    expect(dailyPour([MARTINEZ, LAST_WORD], new Set(), { userId: 'user-1', dateKey: DATE })).toBe(MARTINEZ)
  })
  it('returns null if all three pools are empty', () => {
    expect(dailyPour([], new Set(), { userId: 'user-1', dateKey: DATE })).toBeNull()
    expect(dailyPour([LAST_WORD], new Set(), { userId: 'user-1', dateKey: DATE })).toBeNull()
  })
  it('is stable for the same user and day', () => {
    const opts = { userId: 'user-1', dateKey: DATE }
    expect(dailyPour(RECIPES, RICH_OWNED, opts)).toBe(dailyPour(RECIPES, RICH_OWNED, opts))
  })
  it('sorts candidates by slug before selecting a fixed hash index', () => {
    const opts = { userId: 'user-1', dateKey: DATE }
    const candidates = [NEGRONI, GIN_TONIC, WHISKY_SOUR, MARTINEZ]
    expect(dailyPour(candidates, RICH_OWNED, opts)).toBe(NEGRONI)
    expect(dailyPour([...candidates].reverse(), RICH_OWNED, opts)).toBe(NEGRONI)
  })
  it('rotates across ten consecutive days', () => {
    const slugs = new Set<string>()
    for (let day = 10; day <= 19; day++) {
      const pick = dailyPour(RECIPES, RICH_OWNED, { userId: 'user-1', dateKey: `2026-07-${day}` })
      expect(pick).not.toBeNull()
      slugs.add(pick!.slug)
    }
    expect(slugs.size).toBeGreaterThanOrEqual(2)
  })
  it('uses the guest seed when userId is null', () => {
    const candidates = [NEGRONI, MARTINEZ, NO_SPIRIT]
    const guest = dailyPour(candidates, new Set(), { userId: null, dateKey: DATE })
    expect(guest).toBe(dailyPour(candidates, new Set(), { userId: 'guest', dateKey: DATE }))
    expect(guest).toBe(MARTINEZ)
  })
  it('does not reorder the caller recipe array', () => {
    const input = [NEGRONI, GIN_TONIC, MARTINEZ]
    dailyPour(input, RICH_OWNED, { userId: 'user-1', dateKey: DATE })
    expect(input).toEqual([NEGRONI, GIN_TONIC, MARTINEZ])
  })
})

describe('becauseYouHave', () => {
  it('returns null for an empty cabinet', () => expect(becauseYouHave([], RECIPES)).toBeNull())
  it('selects the bottle whose type participates in the most makeable recipes', () => {
    expect(becauseYouHave(NEGRONI_CABINET, RECIPES)?.bottleId).toBe('gin-1')
  })
  it('breaks an equal count by newest bottle', () => {
    expect(becauseYouHave(NEGRONI_CABINET, [NEGRONI])).toEqual({
      bottleId: 'vermouth-1', spiritTypeId: 'sweet-vermouth', recipes: [NEGRONI],
    })
  })
  it('sorts matching recipes by makeable, missing count, then popularity', () => {
    expect(becauseYouHave(NEGRONI_CABINET, RECIPES)?.recipes.map(r => r.slug)).toEqual([
      'negroni', 'gin-tonic', 'martinez', 'last-word',
    ])
  })
  it('limits the recommendation list to five recipes', () => {
    const ginRecipes = [10, 20, 30, 40, 50, 60].map((pop, i) => recipe(`gin-fizz-${i + 1}`, ['gin'], 4, pop))
    expect(becauseYouHave(GIN_ONLY, ginRecipes)?.recipes.map(r => r.slug)).toEqual([
      'gin-fizz-6', 'gin-fizz-5', 'gin-fizz-4', 'gin-fizz-3', 'gin-fizz-2',
    ])
  })
  it('does not change the input recipe order', () => {
    const input = [GIN_TONIC, NEGRONI]
    becauseYouHave(GIN_ONLY, input)
    expect(input).toEqual([GIN_TONIC, NEGRONI])
  })
})
