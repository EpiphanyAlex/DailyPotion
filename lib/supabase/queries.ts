import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type SB = SupabaseClient<Database>

// ── Row 类型别名（契约 B：全部返回 types/supabase.ts 的 Row 类型或其 join 组合）──
export type SpiritTypeRow = Database['public']['Tables']['spirit_types']['Row']
export type BottleCatalogRow = Database['public']['Tables']['bottles_catalog']['Row']
export type RecipeRow = Database['public']['Tables']['recipes']['Row']
export type RecipeIngredientRow = Database['public']['Tables']['recipe_ingredients']['Row']
export type UserRecipeMarkRow = Database['public']['Tables']['user_recipe_marks']['Row']

export type RecipeWithIngredients = RecipeRow & { recipe_ingredients: RecipeIngredientRow[] }

// catalog 瓶经 join 取 spirit_type_id（裁定口径 2），自定义瓶该字段为 null
export type UserBottleRow = Database['public']['Tables']['user_bottles']['Row'] & {
  bottles_catalog: Pick<BottleCatalogRow, 'slug' | 'name_zh' | 'name_en' | 'spirit_type_id' | 'image_url'> | null
}

export type PourLogWithRecipe = Database['public']['Tables']['user_pour_logs']['Row'] & {
  recipes: Pick<RecipeRow, 'slug' | 'name_zh' | 'name_en'>
}

const USER_BOTTLE_SELECT = '*, bottles_catalog(slug, name_zh, name_en, spirit_type_id, image_url)'

export class DataMutationNotFoundError extends Error {
  constructor(table: 'user_bottles' | 'user_pour_logs', id: string) {
    super(`${table} row ${id} was not found or is not writable by the current user`)
    this.name = 'DataMutationNotFoundError'
  }
}

async function currentUserId(sb: SB): Promise<string> {
  const { data, error } = await sb.auth.getUser()
  if (error || !data.user) throw error ?? new Error('Not authenticated')
  return data.user.id
}

// ── 内容表 ─────────────────────────────────────────────────────

export async function fetchSpiritTypes(sb: SB): Promise<SpiritTypeRow[]> {
  const { data, error } = await sb.from('spirit_types').select('*').order('sort_order', { ascending: true })
  if (error) throw error
  return data
}

/** recipes + recipe_ingredients，V1 全量（配方 < 200，见 prd/00 风险 #4）。 */
export async function fetchRecipesWithIngredients(sb: SB): Promise<RecipeWithIngredients[]> {
  const { data, error } = await sb
    .from('recipes')
    .select('*, recipe_ingredients(*)')
    .order('slug', { ascending: true })
    .order('sort_order', { referencedTable: 'recipe_ingredients', ascending: true })
  if (error) throw error
  return data as RecipeWithIngredients[]
}

export async function fetchRecipeBySlug(sb: SB, slug: string): Promise<RecipeWithIngredients | null> {
  const { data, error } = await sb
    .from('recipes')
    .select('*, recipe_ingredients(*)')
    .eq('slug', slug)
    .order('sort_order', { referencedTable: 'recipe_ingredients', ascending: true })
    .maybeSingle()
  if (error) throw error
  return data as RecipeWithIngredients | null
}

/**
 * 搜索词净化（纯函数，单测见 queries.test.ts）：
 * 只保留搜索文本；剔除 PostgREST `or` 语法字符与 ilike 通配符，压缩空白并限长。
 */
export function sanitizeSearchQuery(q: string): string {
  return q.replace(/[,_%*()"'\\]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80)
}

export async function searchBottlesCatalog(sb: SB, q: string): Promise<BottleCatalogRow[]> {
  const safe = sanitizeSearchQuery(q)
  let query = sb.from('bottles_catalog').select('*').eq('is_active', true).order('name_en').limit(20)
  if (safe !== '') {
    query = query.or(`name_zh.ilike.%${safe}%,name_en.ilike.%${safe}%,brand.ilike.%${safe}%`)
  }
  const { data, error } = await query
  if (error) throw error
  return data
}

// ── user_bottles ───────────────────────────────────────────────

/** 当前用户全部酒瓶（owned + wishlist），RLS 自动限定本人。 */
export async function fetchUserBottles(sb: SB): Promise<UserBottleRow[]> {
  const { data, error } = await sb
    .from('user_bottles')
    .select(USER_BOTTLE_SELECT)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as UserBottleRow[]
}

export async function addUserBottle(
  sb: SB,
  input: { bottleId: string } | { customName: string; spiritTypeId: string; volumeMl?: number },
  status: 'owned' | 'wishlist'
): Promise<UserBottleRow> {
  const userId = await currentUserId(sb)
  const source =
    'bottleId' in input
      ? { bottle_id: input.bottleId }
      : { custom_name: input.customName, spirit_type_id: input.spiritTypeId, volume_ml: input.volumeMl ?? null }
  const { data, error } = await sb
    .from('user_bottles')
    .insert({ ...source, status, user_id: userId })
    .select(USER_BOTTLE_SELECT)
    .single()
  if (error) throw error
  return data as UserBottleRow
}

export async function updateUserBottleStatus(sb: SB, id: string, status: 'owned' | 'wishlist'): Promise<void> {
  const { data, error } = await sb.from('user_bottles').update({ status }).eq('id', id).select('id').maybeSingle()
  if (error) throw error
  if (!data) throw new DataMutationNotFoundError('user_bottles', id)
}

export async function removeUserBottle(sb: SB, id: string): Promise<void> {
  const { data, error } = await sb.from('user_bottles').delete().eq('id', id).select('id').maybeSingle()
  if (error) throw error
  if (!data) throw new DataMutationNotFoundError('user_bottles', id)
}

// ── user_recipe_marks ──────────────────────────────────────────

export async function fetchRecipeMarks(sb: SB): Promise<UserRecipeMarkRow[]> {
  const { data, error } = await sb.from('user_recipe_marks').select('*')
  if (error) throw error
  return data
}

/** 收藏/评分合并 upsert：payload 里没有的列不会被覆盖（PostgREST on conflict 只更新给出的列）。 */
export async function upsertRecipeMark(
  sb: SB,
  recipeId: string,
  patch: { isFavorite?: boolean; rating?: number | null }
): Promise<void> {
  const userId = await currentUserId(sb)
  const row: Database['public']['Tables']['user_recipe_marks']['Insert'] = {
    user_id: userId,
    recipe_id: recipeId,
    updated_at: new Date().toISOString(),
  }
  if (patch.isFavorite !== undefined) row.is_favorite = patch.isFavorite
  if (patch.rating !== undefined) row.rating = patch.rating
  if (patch.isFavorite === undefined && patch.rating === undefined) throw new TypeError('recipe mark patch must not be empty')
  const { error } = await sb.from('user_recipe_marks').upsert(row, { onConflict: 'user_id,recipe_id' })
  if (error) throw error
}

// ── user_pour_logs ─────────────────────────────────────────────

export async function insertPourLog(
  sb: SB,
  input: { recipeId: string; pouredAt: string; rating: number | null; tasteTags: string[]; note: string }
): Promise<void> {
  const userId = await currentUserId(sb)
  const { error } = await sb.from('user_pour_logs').insert({
    user_id: userId,
    recipe_id: input.recipeId,
    poured_at: input.pouredAt,
    rating: input.rating,
    taste_tags: input.tasteTags,
    note: input.note,
  })
  if (error) throw error
}

export async function fetchPourLogs(sb: SB): Promise<PourLogWithRecipe[]> {
  const { data, error } = await sb
    .from('user_pour_logs')
    .select('*, recipes(slug, name_zh, name_en)')
    .order('poured_at', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as PourLogWithRecipe[]
}

export async function updatePourLog(
  sb: SB,
  id: string,
  patch: Partial<{ pouredAt: string; rating: number | null; tasteTags: string[]; note: string }>
): Promise<void> {
  const row: Database['public']['Tables']['user_pour_logs']['Update'] = {}
  if (patch.pouredAt !== undefined) row.poured_at = patch.pouredAt
  if (patch.rating !== undefined) row.rating = patch.rating
  if (patch.tasteTags !== undefined) row.taste_tags = patch.tasteTags
  if (patch.note !== undefined) row.note = patch.note
  if (Object.keys(row).length === 0) throw new TypeError('pour log patch must not be empty')
  const { data, error } = await sb.from('user_pour_logs').update(row).eq('id', id).select('id').maybeSingle()
  if (error) throw error
  if (!data) throw new DataMutationNotFoundError('user_pour_logs', id)
}

export async function deletePourLog(sb: SB, id: string): Promise<void> {
  const { data, error } = await sb.from('user_pour_logs').delete().eq('id', id).select('id').maybeSingle()
  if (error) throw error
  if (!data) throw new DataMutationNotFoundError('user_pour_logs', id)
}
