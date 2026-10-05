import { describe, expect, it } from 'vitest'
import type { OwnedBottle, RecipeForMatching } from '@/lib/matching'
import { removeImpact } from './remove-impact'

const recipe = (id: string, spiritTypeIds: string[]): RecipeForMatching => ({
  id, slug: id, spiritTypeIds, baseRating: 4, basePopularity: 1,
})
const bottle = (id: string, spiritTypeId: string): OwnedBottle => ({
  id, spiritTypeId, createdAt: '2026-10-01T00:00:00Z',
})

const recipes = [recipe('g-and-t', ['gin']), recipe('martini', ['gin', 'vermouth']), recipe('negroni', ['gin', 'vermouth', 'campari'])]

describe('removeImpact', () => {
  it('counts recipes that become unmakeable after removing the sole gin bottle', () => {
    expect(removeImpact(recipes, [bottle('roku', 'gin'), bottle('vermouth', 'vermouth')], 'roku')).toBe(2)
  })

  it('returns zero when another owned bottle supplies the same spirit type', () => {
    expect(removeImpact(recipes, [bottle('roku', 'gin'), bottle('backup', 'gin')], 'roku')).toBe(0)
  })

  it('returns zero for a wishlist bottle absent from owned input', () => {
    expect(removeImpact(recipes, [bottle('roku', 'gin')], 'wishlist')).toBe(0)
  })
})
