# DailyPotion PRD · 匹配与推荐引擎（02）

| | |
|---|---|
| 优先级 | P0 |
| 依赖 | [01-data-model.md](01-data-model.md) |
| 设计稿 | 无 |
| 总览 | [00-overview.md](00-overview.md) |

---

## 1. 目标

DailyPotion 的核心循环是「添加酒瓶 → 看到你能调 N 款 → 挑一款调 → 记录 & 评分 → 发现只差一瓶就能解锁 M 款 → 添加新酒瓶」。匹配与推荐引擎是这条循环的计算中枢：基于用户酒柜的 owned 酒瓶判定每款配方 Can Make 还是 Missing，并产出酒柜统计、每日推荐 Daily Pour 与 Because You Have X 推荐，让首页回答「今天调什么」、酒柜页回答「我有什么、还缺什么」。

## 2. 架构红线（`lib/matching.ts`）

所有匹配/推荐/统计逻辑集中在 `lib/matching.ts`，为**无副作用纯函数**，禁止散落进组件。输入输出均为普通数据对象，不依赖 Supabase client。

## 3. 匹配单元与输入

- **匹配单元 = `spirit_types` 表的一行**（表结构见 [数据模型](01-data-model.md)）。基酒粒度到大类（gin、whisky…），利口酒/加强酒粒度到具体品种（Campari、Sweet Vermouth、Triple Sec…）。
- 用户侧输入：owned 酒瓶集合映射为 `Set<spiritTypeId>`（catalog 瓶经 `bottles_catalog.spirit_type_id`，自定义瓶用自身 `spirit_type_id`；同类多瓶自然去重）。**wishlist 一律不参与**。
- 配方侧输入：每配方的 `is_spirit = true` 配料的 `spirit_type_id` 列表。辅料（`is_spirit = false`）不参与任何匹配计算。

## 4. canMake

配方所有 `is_spirit` 配料的 `spirit_type_id` 都在用户集合中 → Can Make。无 `is_spirit` 配料的配方（理论上不存在，种子数据校验兜底，校验规则见 [数据模型](01-data-model.md) 的种子数据要求）视为不可调。

## 5. missing 与统计

- `missing(recipe, owned)`：返回缺少的匹配单元列表（保持配料顺序）。
- `missingJustOne`：`missing.length === 1` 的配方数，即「Missing Just One」——只差 1 种匹配单元即可解锁的配方数。
- `coverage`（产品文案 **Recipe Coverage / 配方覆盖率**）：`canMakeCount / totalPublicRecipes`，0 配方时为 0。注意语义：这是「可调配方占全库比例」，不是酒柜本身的完成度，产品文案不得称 Cabinet Completion。

## 5.1 bestNextType（最佳下一瓶）

把「发现只差一瓶就能解锁 M 款」闭合为可执行动作：告诉用户下一瓶该补什么。

- 对每个**缺失的匹配单元** t，计算 `unlockCount(t)` = `missing(recipe, owned)` 恰好等于 `[t]` 的配方数（即把 t 加入酒柜后**立即新解锁**的配方数）。
- 返回 `unlockCount` 最大的匹配单元及其解锁数；并列取 `spirit_types.sort_order` 靠前者。全部为 0（无 Missing Just One 配方）时返回 null。
- 消费位置：首页 Missing Just One 卡的扩展区（见 [Home Dashboard](04-home-dashboard.md) Cabinet Snapshot 小节）。

## 6. dailyPour

- **登录且可调数 > 0**：候选 = 可调配方按 `slug` 排序；索引 = `hash(user_id + "YYYY-MM-DD") % 候选数`。确定性：同人同天恒定，跨天轮换。
- **登录但可调数 = 0**：降级为「Missing Just One」候选池；仍为空则走访客分支。
- **访客 / 空酒柜**：候选 = 策展池（`base_rating ≥ 4.5` 的公开配方），索引 = `hash("guest" + "YYYY-MM-DD") % 候选数`——与登录分支同一 hash 规则，`user_id` 缺省取 `"guest"`（与 `docs/plans/README.md` 契约 A 的 `fnv1a((userId ?? 'guest') + dateKey)` 一致）。
- hash 用简单稳定的字符串哈希（如 FNV-1a），不引入依赖。日期取用户本地时区当天。

## 7. becauseYouHave

- 选瓶：对每个 owned 瓶计算「其匹配单元参与的可调配方数」，取最大者；并列取 `created_at` 最新。
- 选配方：含该匹配单元的配方，排序 Can Make 优先 → missing 数升序 → `base_popularity` 降序，取前 5。
- 展示语义：匹配按**匹配单元**计算，标题必须用匹配单元名（如 "Because You Have Gin"），来源瓶（如 Roku Gin）只出现在副文案（见 [Home Dashboard](04-home-dashboard.md)）——避免误导用户以为匹配精确到具体瓶。

## 8. 评分与热度（V1 规则）

- 卡片/排序所用评分与热度来自官方策展字段 `recipes.base_rating`（3.0–5.0）与 `base_popularity`（整数权重），随种子数据人工维护（字段定义见 [数据模型](01-data-model.md)）。
- 用户个人评分（`user_recipe_marks.rating`）只对本人展示（[配方详情](06-recipe-detail.md) 的「你的评分」）。社区聚合评分推迟到 V2 与用户配方一起设计（V2 路线图见 [总览](00-overview.md)）。

## 9. 单元测试要求（`npm test` 必须覆盖）

- canMake：全匹配 / 部分缺失 / 空酒柜 / 配方无 spirit 配料。
- missing：顺序稳定、wishlist 不计入、同类多瓶去重。
- 统计：coverage 边界（0 配方、0 可调、全可调）。
- bestNextType：解锁数计算正确（只计 missing 恰为 1 项且为该单元的配方）、并列取 sort_order 靠前、无 Missing Just One 配方时返回 null。
- dailyPour：同 seed 幂等、跨天变化、三个分支的降级顺序。
- becauseYouHave：选瓶并列规则、top5 排序规则。

## 10. 在产品中的消费位置

本引擎的输出被以下功能消费，各页面的行为规格见对应 PRD：

| 功能 | 消费的能力 |
|---|---|
| [Home Dashboard](04-home-dashboard.md) | Daily Pour hero（dailyPour）、Cabinet Snapshot 四卡（可调配方数、Missing Just One、Recipe Coverage）、最佳下一瓶（bestNextType）、Because You Have X（becauseYouHave） |
| [Recipes 配方库](05-recipes-library.md) | 配方卡 Can Make / Missing N 状态徽章、Can Make 筛选、Missing Just One 筛选态、Popular 排序（`base_popularity` 降序） |
| [Recipe Detail](06-recipe-detail.md) | Ingredients 基酒/利口酒行的库存状态标注、Availability Panel（缺失项为匹配单元名） |
| [My Cabinet](07-my-cabinet.md) | 移除酒瓶确认弹层的「移除后将有 N 款配方变为不可调」——N 由匹配函数计算 |
