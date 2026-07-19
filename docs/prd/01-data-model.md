# DailyPotion PRD · 数据模型（01）

| | |
|---|---|
| 优先级 | P0（所有 feature 的地基） |
| 依赖 | 无 |
| 设计稿 | 无 |
| 总览 | [00-overview.md](00-overview.md) |

## 1. 目标

定义 DailyPotion 在 Supabase Postgres 中的全部持久化结构：共 7 张表，分为**内容表**（官方内容，全员可读）与**用户表**（仅本人读写）两层，支撑「添加酒瓶 → 看到能调 N 款 → 调一款并记录评分」的核心循环。表结构从第一天按多用户设计（`recipes.author_id` nullable + `is_public` 预留），V1 全部配方与酒瓶为官方内置内容。

## 2. 总体约定

- 迁移文件存 `supabase/migrations/`，使用 UTC timestamp 文件名；数据库从本地 Supabase 重建和测试通过后，才允许一次性发布到托管项目。
- 建表迁移必须在同一事务中同时落地约束、索引、显式 table grants、RLS 与策略，不允许出现“表已发布但尚未启用 RLS”的窗口。
- 种子脚本存 `supabase/seed/`，以 slug upsert 权威内容；配方及配料替换和完整性校验在同一事务中执行，验证失败整体回滚，不得通过删除 `recipes` 行更新内容。
- 浏览器使用 Project URL + publishable key；publishable key 只作为 `apikey`，用户访问令牌才作为 `Authorization: Bearer`。service/secret key 不得进入客户端或 `NEXT_PUBLIC_*`。

## 3. 内容表（官方内容，全员可读）

```
spirit_types                      -- 匹配单元
  id            uuid PK
  slug          text unique       -- 'gin' / 'campari'
  name_zh       text not null
  name_en       text not null
  category      text not null     -- gin|whisky|rum|vodka|tequila|brandy|liqueur|other（对应 design.md 分类色）
  sort_order    int not null default 0  -- >=0

bottles_catalog                   -- 官方酒瓶库
  id            uuid PK
  spirit_type_id uuid FK → spirit_types
  slug          text unique
  name_zh / name_en  text not null
  brand         text
  volume_ml     int               -- 可空；非空时 >0
  image_url     text
  is_active     bool default true

recipes
  id            uuid PK
  slug          text unique       -- URL 用，'negroni'
  name_zh / name_en          text not null
  description_zh / description_en  text
  instructions_zh / instructions_en  text[] not null   -- 每步一条
  tip_zh / tip_en            text              -- Bartender Tip，可空
  image_url     text
  difficulty    text not null     -- easy|medium|hard
  prep_minutes  int not null      -- >=0
  abv_percent   numeric           -- 可空；非空时 0–100
  flavor_tags   text[] default '{}'   -- 仅允许 §6 的 11 个 flavor tag slug
  base_rating   numeric not null default 4.0   -- 3.0–5.0 官方策展分（规则见 02-matching-engine.md）
  base_popularity int not null default 0  -- >=0
  author_id     uuid FK → auth.users, nullable  -- V1 全部 null（官方）
  is_public     bool not null default true
  created_at    timestamptz default now()

recipe_ingredients
  id            uuid PK
  recipe_id     uuid FK → recipes on delete cascade
  is_spirit     bool not null
  spirit_type_id uuid FK → spirit_types, nullable  -- 与 is_spirit 同步：true 时必填，false 时必须为空
  name_zh / name_en  text        -- 显示名；is_spirit 行可空（回落到 spirit_types 名称），辅料行必填
  amount        text not null    -- 非空白；'45 ml' / '2 dashes'
  sort_order    int not null default 0  -- >=0；同一 recipe 内唯一
```

说明：

- `spirit_types` 即「匹配单元」——基酒粒度到大类、利口酒/加强酒粒度到具体品种，其定义与匹配输入规则见 [匹配与推荐引擎](02-matching-engine.md)（匹配单元与输入一节）。
- `base_rating`（3.0–5.0）与 `base_popularity`（整数权重）为官方策展字段，随种子数据人工维护；卡片评分与排序热度如何使用这两个字段，见 [匹配与推荐引擎](02-matching-engine.md)（评分与热度 V1 规则一节）。

## 4. 用户表（仅本人读写）

```
user_bottles
  id            uuid PK
  user_id       uuid FK → auth.users, not null
  bottle_id     uuid FK → bottles_catalog, nullable
  custom_name   text              -- 手动添加时使用
  spirit_type_id uuid FK → spirit_types, nullable
  volume_ml     int               -- 自定义瓶容量，可空；非空时 >0；catalog 瓶必须为 null
  status        text not null default 'owned'   -- owned|wishlist
  created_at    timestamptz default now()
  -- check：catalog/custom 严格二选一：
  --   catalog = bottle_id 非空，custom_name/spirit_type_id/volume_ml 全空；
  --   custom = bottle_id 为空，custom_name 非空白且 spirit_type_id 非空
  -- unique (user_id, bottle_id) where bottle_id is not null

user_recipe_marks                 -- 收藏 + 评分（每人每配方一行）
  user_id       uuid FK → auth.users
  recipe_id     uuid FK → recipes on delete cascade
  is_favorite   bool not null default false
  rating        smallint          -- 1–5，可空
  updated_at    timestamptz default now()
  PK (user_id, recipe_id)

user_pour_logs                    -- 调酒历史（多条）
  id            uuid PK
  user_id       uuid FK → auth.users, not null
  recipe_id     uuid FK → recipes on delete cascade
  poured_at     date not null default current_date  -- 不得晚于 current_date
  rating        smallint          -- 1–5，可空
  taste_tags    text[] default '{}'  -- 仅允许固定 8 词字典，见 06-recipe-detail.md §4.3
  note          text              -- 数据库与应用层均校验 ≤500 字
  created_at    timestamptz default now()
```

## 5. Grants 与 RLS 策略

权限分两层且缺一不可：table grants 决定角色能否发起操作，RLS 决定能操作哪些行。所有表启用 RLS；策略中的用户 ID 使用 `(select auth.uid())`，用户表按 `user_id` 建索引。

| 表 | 显式 grants | RLS 可见/可写行 |
|---|---|---|
| spirit_types / bottles_catalog | `anon`,`authenticated`: SELECT；`service_role`: ALL | SELECT 全部；无客户端写策略 |
| recipes | `anon`,`authenticated`: SELECT；`service_role`: ALL | `is_public = true or author_id = (select auth.uid())`；无客户端写策略 |
| recipe_ingredients | `anon`,`authenticated`: SELECT；`service_role`: ALL | 仅当父 recipe 对当前角色可见；不得用 `using (true)` 泄露私有配方的配料 |
| user_bottles / user_recipe_marks / user_pour_logs | `authenticated`: SELECT/INSERT/UPDATE/DELETE；`service_role`: ALL；`anon`: 无权限 | `user_id = (select auth.uid())`；INSERT/UPDATE 同时做 `with check` |

## 6. 种子数据与发布门槛

内容量分两级门槛，**不得混用口径**：

| 门槛 | 含义 | recipes | bottles_catalog | spirit_types | 图片覆盖率 |
|---|---|---|---|---|---|
| **Engineering MVP** | Phase 1–8 工程验收口径（功能完整、种子够跑通全部功能） | 20 款（覆盖 6 大基酒及利口酒分类） | ≥30（含 Roku Gin） | ≥25 | 不设门槛（缺图用 paper-deep 占位） |
| **Public V1** | 对外发布口径（达标前不得称「V1 发布完成」） | ≥50 款经典配方 | ≈60 条常见市售瓶 | ≥25 | 配方图 ≥90%，酒瓶图 ≥60%，其余占位 |

- `spirit_types` = 25 条：6 个基酒匹配单元（gin/whisky/rum/vodka/tequila/brandy）+ 19 个利口酒/加强酒品种；`liqueur` 是分类，不额外占一条匹配单元。
- `recipes.flavor_tags` 固定 11 个 slug：`bitter` / `herbal` / `classic` / `strong` / `sour` / `citrus` / `refreshing` / `minty` / `sweet` / `fruity` / `creamy`。
- `recipes` 双语内容完整（名称/描述/步骤/Tip），每款配料完整且 `is_spirit` 标注正确；种子脚本校验：每配方至少 1 条 `is_spirit = true` 配料。
- 权威种子可重复执行：已有 slug 的双语内容、结构字段和图片字段必须被更新；recipe UUID 保持不变，用户收藏、评分与调酒历史不得因内容更新被 cascade 删除。
- 图片：使用可商用图源或自摄，统一比例；缺图时使用 paper-deep 占位（design.md §8）。占位不阻塞 Engineering MVP；Public V1 须达上表覆盖率。

## 7. 数据层验收

- 本地 `db reset` 能从空库完整应用 timestamp migrations、事务 seed 与校验；连续重跑 seed 后数据量、recipe UUID 与用户关联数据不变。
- 数据库契约测试覆盖 7 表、关键约束/索引、显式 grants、RLS 开关与全部策略；应用集成测试覆盖契约 B 的全部内容查询和用户 CRUD。
- RLS 使用 anon + 两个独立账号验证三张用户表的完整 CRUD 隔离，并验证私有 recipe 的 ingredient 不泄露。
- 更新/删除目标不存在或被 RLS 隔离时，数据访问层不得把 0 行受影响当成功；必须抛出可识别错误，供 UI 乐观更新回滚。
- 未来日期、超过 500 字 note、未知 taste tag、非正容量、catalog/custom 混合来源必须由数据库拒绝，不能只依赖 UI 校验。
