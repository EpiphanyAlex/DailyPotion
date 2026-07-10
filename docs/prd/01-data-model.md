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

- 迁移文件存 `supabase/migrations/`；种子脚本存 `supabase/seed/`。
- 所有表启用 RLS，策略见本文档 §5。

## 3. 内容表（官方内容，全员可读）

```
spirit_types                      -- 匹配单元
  id            uuid PK
  slug          text unique       -- 'gin' / 'campari'
  name_zh       text not null
  name_en       text not null
  category      text not null     -- gin|whisky|rum|vodka|tequila|brandy|liqueur|other（对应 design.md 分类色）
  sort_order    int not null default 0

bottles_catalog                   -- 官方酒瓶库
  id            uuid PK
  spirit_type_id uuid FK → spirit_types
  slug          text unique
  name_zh / name_en  text not null
  brand         text
  volume_ml     int
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
  prep_minutes  int not null
  abv_percent   numeric
  flavor_tags   text[] default '{}'   -- slug，翻译在 messages
  base_rating   numeric not null default 4.0   -- 3.0–5.0 官方策展分（规则见 02-matching-engine.md）
  base_popularity int not null default 0
  author_id     uuid FK → auth.users, nullable  -- V1 全部 null（官方）
  is_public     bool not null default true
  created_at    timestamptz default now()

recipe_ingredients
  id            uuid PK
  recipe_id     uuid FK → recipes on delete cascade
  is_spirit     bool not null
  spirit_type_id uuid FK → spirit_types, nullable  -- is_spirit=true 时必填（check 约束）
  name_zh / name_en  text        -- 显示名；is_spirit 行可空（回落到 spirit_types 名称），辅料行必填
  amount        text not null    -- '45 ml' / '2 dashes'
  sort_order    int not null default 0
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
  status        text not null default 'owned'   -- owned|wishlist
  created_at    timestamptz default now()
  -- check：bottle_id 非空，或 (custom_name 与 spirit_type_id 均非空)
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
  poured_at     date not null default current_date
  rating        smallint          -- 1–5，可空
  taste_tags    text[] default '{}'
  note          text              -- ≤500 字（应用层校验）
  created_at    timestamptz default now()
```

## 5. RLS 策略

| 表 | select | insert / update / delete |
|---|---|---|
| spirit_types / bottles_catalog / recipes / recipe_ingredients | 所有人（含 anon）；recipes 加 `is_public = true or author_id = auth.uid()` | 仅 service role（V1 官方内容经迁移/脚本维护；V2 再开放 `author_id = auth.uid()` 写入） |
| user_bottles / user_recipe_marks / user_pour_logs | `user_id = auth.uid()` | `user_id = auth.uid()` |

## 6. 种子数据要求

- `spirit_types` ≈ 25 条：7 大基酒类 + 常用利口酒/加强酒品种（Campari、Sweet/Dry Vermouth、Triple Sec、Coffee Liqueur、Amaretto 等）。
- `bottles_catalog` ≈ 60 条常见市售瓶（含 Roku Gin），尽量配图。
- `recipes` ≥ 50 款经典配方，双语内容完整（名称/描述/步骤/Tip），每款配料完整且 `is_spirit` 标注正确；种子脚本校验：每配方至少 1 条 `is_spirit = true` 配料。
- 图片：V1 使用可商用图源或自摄，统一比例；缺图时使用 paper-deep 占位（design.md §8），不阻塞上线。
