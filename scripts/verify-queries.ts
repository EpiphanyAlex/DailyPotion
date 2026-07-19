// scripts/verify-queries.ts —— 契约 B 全部查询函数的本地联网验收（npm run db:verify）
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createClient as createRawClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import {
  DataMutationNotFoundError,
  addUserBottle,
  deletePourLog,
  fetchPourLogs,
  fetchRecipeBySlug,
  fetchRecipeMarks,
  fetchRecipesWithIngredients,
  fetchSpiritTypes,
  fetchUserBottles,
  insertPourLog,
  removeUserBottle,
  searchBottlesCatalog,
  updatePourLog,
  updateUserBottleStatus,
  upsertRecipeMark,
} from '@/lib/supabase/queries'

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m) process.env[m[1]] ??= m[2]
}

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} 未设置`)
  return value
}

const url = requiredEnv('NEXT_PUBLIC_SUPABASE_URL')
const publishableKey = requiredEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
const serviceRoleKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY')

type SB = SupabaseClient<Database>
type TestUser = { id: string; email: string; password: string }

const authOptions = {
  persistSession: false,
  autoRefreshToken: false,
  detectSessionInUrl: false,
}

const sb = createRawClient<Database>(url, publishableKey, { auth: authOptions })
const admin = createRawClient<Database>(url, serviceRoleKey, { auth: authOptions })
const createdUserIds: string[] = []

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

async function createTestUser(label: 'a' | 'b'): Promise<TestUser> {
  const token = randomUUID()
  const email = `verify-queries-${label}-${token}@dailypotion.test`
  const password = `Local-${token}-Aa1!`
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) throw error
  assert(data.user, `创建测试用户 ${label.toUpperCase()} 未返回 user`)
  createdUserIds.push(data.user.id)
  return { id: data.user.id, email, password }
}

async function login(user: TestUser): Promise<SB> {
  const client = createRawClient<Database>(url, publishableKey, { auth: authOptions })
  const { data, error } = await client.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  })
  if (error) throw error
  assert(data.user?.id === user.id, `登录用户不匹配：期望 ${user.id}，实际 ${data.user?.id ?? 'null'}`)
  return client
}

async function expectMutationNotFound(label: string, action: () => Promise<void>): Promise<void> {
  try {
    await action()
  } catch (error) {
    if (error instanceof DataMutationNotFoundError) return
    throw new Error(`${label} 抛出了错误，但不是 DataMutationNotFoundError`, { cause: error })
  }
  throw new Error(`${label} 未抛 DataMutationNotFoundError`)
}

async function expectDatabaseCheckViolation(label: string, action: () => Promise<void>): Promise<void> {
  try {
    await action()
  } catch (error) {
    const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined
    if (code === '23514') return
    throw new Error(`${label} 被拒绝，但不是数据库 check constraint（code=${String(code)}）`, { cause: error })
  }
  throw new Error(`${label} 未被数据库拒绝`)
}

async function main(): Promise<void> {
let verificationError: unknown

try {
  // ── 内容查询：4 个契约函数 ───────────────────────────────────
  const types = await fetchSpiritTypes(sb)
  assert(types.length >= 25, `spirit_types = ${types.length}，期望 >= 25`)
  assert(types[0].slug === 'gin', `sort_order 排序失效，首条是 ${types[0].slug}`)
  const gin = types.find((type) => type.slug === 'gin')
  assert(gin, 'spirit_types 缺少 gin')

  const recipes = await fetchRecipesWithIngredients(sb)
  assert(recipes.length >= 20, `recipes = ${recipes.length}，期望 >= 20`)
  assert(!recipes.some((recipe) => recipe.recipe_ingredients.length === 0), '存在无配料配方（join 失败？）')

  const negroni = await fetchRecipeBySlug(sb, 'negroni')
  assert(negroni, 'fetchRecipeBySlug(negroni) 返回 null')
  assert(negroni.recipe_ingredients.length === 4, `negroni 配料数 = ${negroni.recipe_ingredients.length}，期望 4`)
  assert(negroni.recipe_ingredients[0].sort_order === 0, '配料未按 sort_order 排序')

  const missing = await fetchRecipeBySlug(sb, 'no-such-recipe')
  assert(missing === null, '不存在的 slug 应返回 null')

  const hits = await searchBottlesCatalog(sb, 'roku')
  const roku = hits.find((bottle) => bottle.slug === 'roku-gin')
  assert(roku, '搜索 "roku" 未命中 Roku Gin')

  const messy = await searchBottlesCatalog(sb, ' roku,% ')
  assert(messy.some((bottle) => bottle.slug === 'roku-gin'), '含逗号/% 的搜索词未被正确净化')

  // ── 创建两个 auto-confirm 用户与独立登录 client ──────────────
  const userA = await createTestUser('a')
  const userB = await createTestUser('b')
  const clientA = await login(userA)
  const clientB = await login(userB)

  // ── user_bottles：catalog/custom 新增、join、状态往返、删除 ──
  const catalogBottle = await addUserBottle(clientA, { bottleId: roku.id }, 'owned')
  assert(catalogBottle.user_id === userA.id, 'catalog 酒瓶 user_id 不属于 A')
  assert(catalogBottle.bottle_id === roku.id, 'catalog 酒瓶 bottle_id 不匹配 Roku Gin')
  assert(catalogBottle.bottles_catalog?.slug === 'roku-gin', 'catalog 酒瓶 join 未返回 Roku Gin')
  assert(catalogBottle.bottles_catalog.spirit_type_id === gin.id, 'catalog 酒瓶 join 的 spirit_type_id 不正确')

  const customBottle = await addUserBottle(
    clientA,
    { customName: 'Task 13 Custom Gin', spiritTypeId: gin.id, volumeMl: 375 },
    'wishlist'
  )
  assert(customBottle.user_id === userA.id, 'custom 酒瓶 user_id 不属于 A')
  assert(customBottle.bottle_id === null, 'custom 酒瓶不应有 bottle_id')
  assert(customBottle.bottles_catalog === null, 'custom 酒瓶 join 应为 null')
  assert(customBottle.spirit_type_id === gin.id && customBottle.volume_ml === 375, 'custom 酒瓶字段不正确')

  let bottlesA = await fetchUserBottles(clientA)
  assert(bottlesA.length === 2, `A 的酒瓶数量 = ${bottlesA.length}，期望 2`)

  await updateUserBottleStatus(clientA, catalogBottle.id, 'wishlist')
  bottlesA = await fetchUserBottles(clientA)
  assert(bottlesA.find((row) => row.id === catalogBottle.id)?.status === 'wishlist', 'owned → wishlist 未生效')

  await updateUserBottleStatus(clientA, catalogBottle.id, 'owned')
  bottlesA = await fetchUserBottles(clientA)
  assert(bottlesA.find((row) => row.id === catalogBottle.id)?.status === 'owned', 'wishlist → owned 未生效')

  await removeUserBottle(clientA, customBottle.id)
  bottlesA = await fetchUserBottles(clientA)
  assert(bottlesA.length === 1 && bottlesA[0].id === catalogBottle.id, 'custom 酒瓶删除失败或误删其他行')

  // ── user_recipe_marks：分离 patch 不互相覆盖 ─────────────────
  await upsertRecipeMark(clientA, negroni.id, { isFavorite: true })
  await upsertRecipeMark(clientA, negroni.id, { rating: 4 })
  const marksA = await fetchRecipeMarks(clientA)
  const markA = marksA.find((mark) => mark.recipe_id === negroni.id)
  assert(markA, 'A 的 Negroni mark 不存在')
  assert(markA.is_favorite === true, 'rating patch 覆盖了先前的 favorite')
  assert(markA.rating === 4, '分离 rating patch 未保存')

  try {
    await upsertRecipeMark(clientA, negroni.id, {})
    throw new Error('upsertRecipeMark 空 patch 未抛 TypeError')
  } catch (error) {
    assert(error instanceof TypeError, 'upsertRecipeMark 空 patch 未抛 TypeError')
  }

  // ── user_pour_logs：新增、查询/join、编辑 ────────────────────
  await insertPourLog(clientA, {
    recipeId: negroni.id,
    pouredAt: '2026-01-02',
    rating: 4,
    tasteTags: ['balanced', 'bitter'],
    note: 'Task 13 initial pour',
  })

  let logsA = await fetchPourLogs(clientA)
  assert(logsA.length === 1, `A 的 pour logs 数量 = ${logsA.length}，期望 1`)
  const logA = logsA[0]
  assert(logA.recipes.slug === 'negroni', 'pour log 的 recipes join 未返回 Negroni')
  assert(logA.note === 'Task 13 initial pour', 'pour log 新增 note 不正确')

  await updatePourLog(clientA, logA.id, {
    pouredAt: '2026-01-01',
    rating: 5,
    tasteTags: ['herbal'],
    note: 'Task 13 updated pour',
  })
  logsA = await fetchPourLogs(clientA)
  const updatedLogA = logsA.find((log) => log.id === logA.id)
  assert(updatedLogA, '编辑后的 pour log 不存在')
  assert(updatedLogA.poured_at === '2026-01-01', 'pour log 日期编辑失败')
  assert(updatedLogA.rating === 5, 'pour log 评分编辑失败')
  assert(updatedLogA.taste_tags.length === 1 && updatedLogA.taste_tags[0] === 'herbal', 'pour log taste tags 编辑失败')
  assert(updatedLogA.note === 'Task 13 updated pour', 'pour log note 编辑失败')

  try {
    await updatePourLog(clientA, logA.id, {})
    throw new Error('updatePourLog 空 patch 未抛 TypeError')
  } catch (error) {
    assert(error instanceof TypeError, 'updatePourLog 空 patch 未抛 TypeError')
  }

  // ── RLS：B 看不到 A 的三类数据 ──────────────────────────────
  assert((await fetchUserBottles(clientB)).length === 0, 'B 竟能看到 A 的 user_bottles')
  assert((await fetchRecipeMarks(clientB)).length === 0, 'B 竟能看到 A 的 user_recipe_marks')
  assert((await fetchPourLogs(clientB)).length === 0, 'B 竟能看到 A 的 user_pour_logs')

  // ── zero-row mutation：跨用户 UUID 与随机 UUID 都必须可识别 ──
  const randomBottleId = randomUUID()
  const randomLogId = randomUUID()
  await expectMutationNotFound('B 更新 A 的 user_bottles UUID', () =>
    updateUserBottleStatus(clientB, catalogBottle.id, 'wishlist')
  )
  await expectMutationNotFound('B 删除 A 的 user_bottles UUID', () => removeUserBottle(clientB, catalogBottle.id))
  await expectMutationNotFound('B 更新随机 user_bottles UUID', () =>
    updateUserBottleStatus(clientB, randomBottleId, 'wishlist')
  )
  await expectMutationNotFound('B 删除随机 user_bottles UUID', () => removeUserBottle(clientB, randomBottleId))
  await expectMutationNotFound('B 更新 A 的 user_pour_logs UUID', () =>
    updatePourLog(clientB, logA.id, { note: 'must not write' })
  )
  await expectMutationNotFound('B 删除 A 的 user_pour_logs UUID', () => deletePourLog(clientB, logA.id))
  await expectMutationNotFound('B 更新随机 user_pour_logs UUID', () =>
    updatePourLog(clientB, randomLogId, { note: 'must not write' })
  )
  await expectMutationNotFound('B 删除随机 user_pour_logs UUID', () => deletePourLog(clientB, randomLogId))

  assert((await fetchUserBottles(clientA)).some((row) => row.id === catalogBottle.id), 'B 的操作影响了 A 的酒瓶')
  assert((await fetchPourLogs(clientA)).some((log) => log.id === logA.id), 'B 的操作影响了 A 的 pour log')

  // ── 数据库约束是最终防线 ────────────────────────────────────
  await expectDatabaseCheckViolation('未来日期', () =>
    insertPourLog(clientA, {
      recipeId: negroni.id,
      pouredAt: '9999-12-31',
      rating: null,
      tasteTags: [],
      note: '',
    })
  )
  await expectDatabaseCheckViolation('501 字 note', () =>
    insertPourLog(clientA, {
      recipeId: negroni.id,
      pouredAt: '2026-01-01',
      rating: null,
      tasteTags: [],
      note: 'a'.repeat(501),
    })
  )
  await expectDatabaseCheckViolation('未知 taste tag', () =>
    insertPourLog(clientA, {
      recipeId: negroni.id,
      pouredAt: '2026-01-01',
      rating: null,
      tasteTags: ['smoky'],
      note: '',
    })
  )
  await expectDatabaseCheckViolation('非正容量', async () => {
    await addUserBottle(
      clientA,
      { customName: 'Invalid Zero Volume', spiritTypeId: gin.id, volumeMl: 0 },
      'owned'
    )
  })

  // ── owner 成功删除路径 ──────────────────────────────────────
  await deletePourLog(clientA, logA.id)
  assert((await fetchPourLogs(clientA)).length === 0, 'owner 删除 pour log 后仍可查询到')
  await removeUserBottle(clientA, catalogBottle.id)
  assert((await fetchUserBottles(clientA)).length === 0, 'owner 删除 catalog 酒瓶后仍可查询到')
} catch (error) {
  verificationError = error
}

const cleanupErrors: unknown[] = []
for (const userId of createdUserIds.reverse()) {
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) cleanupErrors.push(error)
}

if (cleanupErrors.length > 0) {
  const errors = verificationError === undefined ? cleanupErrors : [verificationError, ...cleanupErrors]
  throw new AggregateError(errors, 'query verifier cleanup 失败')
}
if (verificationError !== undefined) throw verificationError

console.log(`verify-queries cleanup OK：已删除 ${createdUserIds.length} 个测试用户`)
console.log('verify-queries OK：内容查询、全部用户 CRUD、zero-row mutation 与数据库约束全部通过')
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
