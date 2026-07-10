# CLAUDE.md

This file provides guidance to Claude Code when working with DailyPotion.

酒柜管理 + 鸡尾酒配方推荐 Web 应用：记录家中的酒（如 Roku Gin），按基酒匹配推荐能调的鸡尾酒；配方库支持浏览/筛选/收藏/调酒记录；未来扩展用户分享配方与 RAG chatbot（路线图见 `docs/prd/00-overview.md`）。

## Status: pre-implementation

仓库目前只有需求与设计文档——**无代码、无 package.json**（git 已初始化，远程 `EpiphanyAlex/DailyPotion`）。已完成：PRD（V1 定稿，已按 feature 拆分为 `docs/prd/`）、设计系统 token、11 屏设计稿。下一步是脚手架 + 实施计划。开始写代码后，同步更新本文件的「目录结构」与「命令」两节为实际状态。

## 文档地图（动手前先读对应权威）

| 需要 | 读 |
|---|---|
| 功能需求、验收标准（按 feature 拆分） | `docs/prd/`（需求唯一权威，从 `docs/prd/README.md` 索引进入；03–09 为各 feature PRD） |
| 产品概述、版本规划、路由/权限、风险 | `docs/prd/00-overview.md` |
| 匹配/推荐算法规则 | `docs/prd/02-matching-engine.md` |
| 数据模型、RLS、种子数据 | `docs/prd/01-data-model.md` |
| 视觉 token、组件/页面规格 | `design.md`（视觉唯一权威） |
| 设计稿源文件 | 根目录 `design_system.pen`——Pencil 加密文件，**只能用 pencil MCP 工具读写**，禁止 Read/Grep |
| 设计稿参考图 | `design/exports/v2/`（11 屏，索引见 `docs/prd/00-overview.md` 附录） |

需求变更：先改 `docs/prd/` 对应 feature PRD 再写代码。新视觉需求：先在 `design.md` 加 token 再写组件。

## 红线规则（违反即 bug，不是风格问题）

| 规则 | ✅ 正确 / ❌ 错误 |
|---|---|
| UI 只用 `design.md` token 派生的 Tailwind 工具类 | ✅ `bg-paper` `text-ink` `rounded-pill` ❌ `bg-[#F6EFE0]`、`text-[14px]`、任何硬编码色值/字号/间距/圆角/阴影 |
| 匹配逻辑只存在于 `lib/matching.ts`（无副作用纯函数） | ❌ 在组件/页面里写 canMake、missing 判断 |
| UI 文案只走 next-intl | ✅ `t('cabinet.addBottle')` ❌ JSX 里写死中文或英文文案 |
| 数据内容双语双列 | `*_zh` / `*_en`；当前 locale 列为空时 fallback 显示另一语言 |
| 匹配只看基酒/利口酒 | 只取 `recipe_ingredients.is_spirit = true`；辅料仅作配方页提示，不入库存；wishlist 酒瓶不参与匹配 |
| 数据库变更只走迁移 | ✅ `supabase/migrations/` ❌ 在 Supabase Dashboard 直改表结构 |
| 所有表启用 RLS | 内容表：任何人可读、仅 service role 写；用户表：`user_id = auth.uid()` 仅本人读写。新表没有 RLS 策略不许合入 |

## 锁定决策（无充分理由不要重开讨论）

- **技术栈**：Next.js（App Router + TypeScript + Tailwind v4）+ Supabase（Postgres/Auth/RLS）+ next-intl，部署 Vercel。
- **视觉方向**：Modern Editorial Home Bar（米色纸感 + 衬线气质 + 现代 Dashboard），不做深色酒吧风、neon、老菜单 PDF。
- **多用户预留**：表结构从第一天按多用户设计——`recipes.author_id` nullable + `is_public`；V1 内容全部官方内置，不开放用户创建。
- **匹配单元 = `spirit_types` 行**：基酒粒度到大类（gin），利口酒粒度到品种（Campari）。不放宽、不细化到具体瓶。
- **V1 评分用官方策展分** `base_rating` / `base_popularity`，社区聚合评分推迟 V2（`docs/prd/02-matching-engine.md`「评分与热度」）。
- **响应式断点 768px**：移动端底部药丸 Tab，≥768px 顶部导航（design.md §5）。
- **V1 范围**以 `docs/prd/00-overview.md`「版本规划」为准，out-of-scope 清单同样有约束力。

## 领域术语（与 PRD/代码命名保持一致）

- **匹配单元** = `spirit_types` 表一行，匹配计算的最小粒度。
- **Can Make** / **Missing** / **Missing Just One**：可调 / 缺少的匹配单元列表 / 只差 1 种即解锁。
- **Daily Pour**：每日确定性推荐一款（同人同天恒定）。算法均见 `docs/prd/02-matching-engine.md`。
- **owned / wishlist**：`user_bottles.status`，只有 owned 参与匹配。
- **Log Your Pour / pour log**：一次调酒记录 → `user_pour_logs`（多条历史）；收藏与评分是单条状态 → `user_recipe_marks`。

## 规划目录结构（脚手架时按此建立）

```
app/[locale]/            # 页面路由（路由表见 docs/prd/00-overview.md 信息架构）
app/globals.css          # Tailwind v4 @theme，token 与 design.md 同步
components/ui/           # 通用组件（按钮/chip/卡片/modal，对应 design.md §5）
components/<feature>/    # 功能组件（dashboard、recipes、cabinet…）
lib/matching.ts          # 匹配/推荐纯函数（唯一位置）
lib/supabase/            # Supabase 客户端与查询
messages/zh.json|en.json # UI 文案
supabase/migrations/     # 数据库迁移
supabase/seed/           # 种子数据脚本
```

## 数据模型速查（字段定义见 `docs/prd/01-data-model.md`）

- 内容表（4）：`spirit_types`（匹配单元）、`bottles_catalog`、`recipes`、`recipe_ingredients`
- 用户表（3）：`user_bottles`、`user_recipe_marks`（收藏+评分）、`user_pour_logs`（调酒历史）

## 命令与测试协议（脚手架后生效）

- `npm run dev` — 本地开发
- `npm test` — 单元测试；**matching 模块必须有测试**，用例清单见 `docs/prd/02-matching-engine.md`「单元测试要求」，改动 `lib/matching.ts` 必须先过全部用例
- `npm run build` — 生产构建，提交前必须通过

改动顺序：改 UI → 浏览器里过一遍相关验收标准（`docs/prd/` 对应 feature PRD）；改 matching → `npm test`；任何提交前 → `npm run build`。
