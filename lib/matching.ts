// lib/matching.ts —— 匹配/推荐引擎的唯一位置（CLAUDE.md 红线）。
//
// ⚠️ Phase 2 只创建契约 A 的类型定义部分。全部纯函数（ownedTypeIdSet、canMake、
// missingTypes、cabinetStats、fnv1a、dailyPour、becauseYouHave）由 Phase 3 在
// 本文件补齐——签名见 docs/plans/README.md 契约 A，逐字使用，禁止改动本文件已有类型。

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
