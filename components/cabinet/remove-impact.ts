import { cabinetStats, type OwnedBottle, type RecipeForMatching } from '@/lib/matching'

/** Number of currently makeable recipes lost when this user bottle is removed. */
export function removeImpact(
  recipes: RecipeForMatching[],
  owned: OwnedBottle[],
  removeUserBottleId: string
): number {
  const before = cabinetStats(recipes, owned).canMakeCount
  const after = cabinetStats(recipes, owned.filter((bottle) => bottle.id !== removeUserBottleId)).canMakeCount
  return before - after
}
