// lib/matching.ts —— 匹配/推荐引擎的唯一位置（CLAUDE.md 红线）。
//
// Phase 2 定义输入类型；Phase 3 实现契约 A 的纯函数。
// 日期和公开配方范围由调用方提供，这里不读取时钟或数据库。

export type Locale = 'zh' | 'en'

export interface RecipeForMatching {
  id: string
  slug: string
  spiritTypeIds: string[] // is_spirit=true 配料的 spirit_type_id，按配料 sort_order
  baseRating: number
  basePopularity: number
}

export interface OwnedBottle {
  id: string
  spiritTypeId: string
  createdAt: string
} // 只含 status='owned'

export interface CabinetStats {
  bottlesOwned: number
  canMakeCount: number
  missingJustOneCount: number
  coveragePercent: number // Recipe Coverage：Math.round(100*canMake/total)，0 配方 → 0
}

/** 输入仅含 owned 酒瓶；wishlist 已由 toOwnedBottles 在查询转换层过滤。 */
export function ownedTypeIdSet(bottles: OwnedBottle[]): Set<string> {
  return new Set(bottles.map((bottle) => bottle.spiritTypeId))
}

/** 无受跟踪基酒/利口酒的配方不可调，避免空数组 every() 的真值。 */
export function canMake(recipe: RecipeForMatching, owned: ReadonlySet<string>): boolean {
  return recipe.spiritTypeIds.length > 0 && recipe.spiritTypeIds.every((typeId) => owned.has(typeId))
}

/** 按配料顺序返回缺失匹配单元；同一种只报告一次。 */
export function missingTypes(recipe: RecipeForMatching, owned: ReadonlySet<string>): string[] {
  const missing: string[] = []
  const seen = new Set<string>()
  for (const typeId of recipe.spiritTypeIds) {
    if (!seen.has(typeId)) {
      seen.add(typeId)
      if (!owned.has(typeId)) missing.push(typeId)
    }
  }
  return missing
}

/** recipes 是公开配方全集；覆盖率分母为其长度，bottlesOwned 计酒瓶而非类型。 */
export function cabinetStats(recipes: RecipeForMatching[], bottles: OwnedBottle[]): CabinetStats {
  const owned = ownedTypeIdSet(bottles)
  let canMakeCount = 0
  let missingJustOneCount = 0
  for (const recipe of recipes) {
    if (canMake(recipe, owned)) canMakeCount += 1
    else if (missingTypes(recipe, owned).length === 1) missingJustOneCount += 1
  }
  return {
    bottlesOwned: bottles.length,
    canMakeCount,
    missingJustOneCount,
    coveragePercent: recipes.length === 0 ? 0 : Math.round((100 * canMakeCount) / recipes.length),
  }
}

/** 加入该匹配单元后立即新解锁的配方数；并列按 spirit_types.sort_order。 */
export function bestNextType(
  recipes: RecipeForMatching[],
  owned: ReadonlySet<string>,
  sortOrder: ReadonlyMap<string, number>
): { spiritTypeId: string; unlockCount: number } | null {
  const counts = new Map<string, number>()
  for (const recipe of recipes) {
    const missing = missingTypes(recipe, owned)
    if (missing.length === 1) counts.set(missing[0], (counts.get(missing[0]) ?? 0) + 1)
  }

  let best: { spiritTypeId: string; unlockCount: number } | null = null
  for (const [spiritTypeId, unlockCount] of counts) {
    const order = sortOrder.get(spiritTypeId) ?? Number.MAX_SAFE_INTEGER
    const bestOrder = best ? (sortOrder.get(best.spiritTypeId) ?? Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER
    if (
      best === null || unlockCount > best.unlockCount ||
      (unlockCount === best.unlockCount && (
        order < bestOrder || (order === bestOrder && spiritTypeId < best.spiritTypeId)
      ))
    ) best = { spiritTypeId, unlockCount }
  }
  return best
}

/** 32-bit FNV-1a；推荐 seed 由 ASCII UUID/guest 和 YYYY-MM-DD 日期组成。 */
export function fnv1a(input: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash
}

function bySlugAsc(a: RecipeForMatching, b: RecipeForMatching): number {
  return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0
}

/** 可调 → 只差一种 → 策展池；在所选池中按 slug 稳定排序后取确定性索引。 */
export function dailyPour(
  recipes: RecipeForMatching[],
  owned: ReadonlySet<string>,
  opts: { userId: string | null; dateKey: string }
): RecipeForMatching | null {
  let pool = recipes.filter((recipe) => canMake(recipe, owned))
  if (pool.length === 0) pool = recipes.filter((recipe) => missingTypes(recipe, owned).length === 1)
  if (pool.length === 0) pool = recipes.filter((recipe) => recipe.baseRating >= 4.5)
  if (pool.length === 0) return null

  const candidates = pool.sort(bySlugAsc)
  return candidates[fnv1a((opts.userId ?? 'guest') + opts.dateKey) % candidates.length]
}

/** 选参与最多可调配方的 owned 瓶，再推荐该匹配单元相关的前五款。 */
export function becauseYouHave(
  bottles: OwnedBottle[],
  recipes: RecipeForMatching[]
): { bottleId: string; spiritTypeId: string; recipes: RecipeForMatching[] } | null {
  if (bottles.length === 0) return null

  const owned = ownedTypeIdSet(bottles)
  const makeable = recipes.filter((recipe) => canMake(recipe, owned))
  const countFor = (bottle: OwnedBottle): number =>
    makeable.filter((recipe) => recipe.spiritTypeIds.includes(bottle.spiritTypeId)).length

  let best = bottles[0]
  let bestCount = countFor(best)
  for (const bottle of bottles.slice(1)) {
    const count = countFor(bottle)
    if (count > bestCount || (count === bestCount && bottle.createdAt > best.createdAt)) {
      best = bottle
      bestCount = count
    }
  }

  const top5 = recipes
    .filter((recipe) => recipe.spiritTypeIds.includes(best.spiritTypeId))
    .sort((a, b) => {
      const aMakeable = canMake(a, owned)
      const bMakeable = canMake(b, owned)
      if (aMakeable !== bMakeable) return aMakeable ? -1 : 1
      const missingDifference = missingTypes(a, owned).length - missingTypes(b, owned).length
      if (missingDifference !== 0) return missingDifference
      return b.basePopularity - a.basePopularity
    })
    .slice(0, 5)

  return { bottleId: best.id, spiritTypeId: best.spiritTypeId, recipes: top5 }
}
