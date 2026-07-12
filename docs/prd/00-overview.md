# DailyPotion PRD · 总览（00）

| | |
|---|---|
| 版本 | v1.1 |
| 日期 | 2026-07-10 |
| 状态 | 由单体 PRD v1.0 拆分为 `docs/prd/` 多文件；V1 需求已定稿，V2/V3 为方向性路线图 |
| 设计稿 | `design/exports/v2/` 全部 11 屏 |
| 总览 | [00-overview.md](00-overview.md) |
| 相关文档 | 视觉 token：`design.md`（唯一权威）· 设计稿：`design_system.pen`（Pencil，v2 导出图见 `design/exports/v2/`）· 工作约定：`CLAUDE.md` |

## 1. 目标

DailyPotion 的一切页面都服务于一个核心循环：添加酒瓶 → 看到「你能调 N 款」 → 挑一款调 → 记录 & 评分 → 发现「只差一瓶就能解锁 M 款」 → 添加新酒瓶。本文件是整套 feature PRD 的总览与共同上游：定义产品定位、版本规划、全站信息架构、非功能需求、成功指标与风险清单。各 feature 的具体行为与数据规格见本文件链接到的编号 PRD 文件。

## 2. 产品概述

### 2.1 一句话定位

DailyPotion 是一个「家庭酒柜管理 + 鸡尾酒配方推荐」Web 应用：记录你家里有什么酒，告诉你现在能调什么鸡尾酒。

### 2.2 要解决的问题

家庭调酒爱好者的三个日常痛点：

1. **「我买了酒却不知道调什么」**——手里有 Roku Gin、几瓶利口酒，但不知道这些组合能做出哪些经典鸡尾酒。
2. **「配方网站不知道我有什么」**——通用配方站每次都要人肉核对材料，无法按我的库存反过来推荐。
3. **「调过什么、好不好喝，全靠记忆」**——没有地方记录自己的调酒历史和口味偏好。

### 2.3 目标用户

- **主要**：家庭调酒入门者与爱好者。家里有 3–20 瓶基酒/利口酒，想充分利用现有库存，中文或英文使用者。
- **次要（V2 起）**：愿意分享自创配方的进阶玩家。

### 2.4 核心循环

```
添加酒瓶 → 看到「你能调 N 款」 → 挑一款调 → 记录 & 评分 → 发现「只差一瓶就能解锁 M 款」 → 添加新酒瓶
```

产品所有页面都为强化这个循环服务：首页回答「今天调什么」，酒柜页回答「我有什么、还缺什么」，配方库回答「都有哪些可能」。

## 3. 版本规划

### 3.1 V1（MVP）范围

| 模块 | 包含 | 优先级 | 详细规格 |
|---|---|---|---|
| Auth | 邮箱注册/登录/登出/重置密码（Supabase Auth） | P0 | [03-auth.md](03-auth.md) |
| Auth | Google OAuth 登录 | P1 | [03-auth.md](03-auth.md) |
| 酒柜管理 | 从官方酒瓶库添加/移除；owned/wishlist 状态；手动添加自定义酒瓶 | P0 | [07-my-cabinet.md](07-my-cabinet.md) |
| 配方库 | 浏览/搜索/筛选/排序官方配方（≥50 款经典配方，双语） | P0 | [05-recipes-library.md](05-recipes-library.md) |
| 配方详情 | 配料、步骤、库存匹配面板、Bartender Tip | P0 | [06-recipe-detail.md](06-recipe-detail.md) |
| 匹配推荐 | Can Make / Missing 判定、Daily Pour、Because You Have X、酒柜统计 | P0 | [02-matching-engine.md](02-matching-engine.md)（算法）· [04-home-dashboard.md](04-home-dashboard.md)（首页展示） |
| 用户标记 | 收藏、评分（1–5 星） | P0 | [06-recipe-detail.md](06-recipe-detail.md)（操作入口）· [08-favorites-history.md](08-favorites-history.md)（收藏页） |
| 调酒记录 | Log Your Pour（日期/星级/口味 tag/笔记）、History 页 | P0 | [06-recipe-detail.md](06-recipe-detail.md)（Log Your Pour modal）· [08-favorites-history.md](08-favorites-history.md)（History 页） |
| 国际化 | `/zh` `/en` 路由，界面文案 + 数据内容全双语 | P0 | [09-i18n-and-global-states.md](09-i18n-and-global-states.md) |
| 分享 | 配方详情页复制链接 | P1 | [06-recipe-detail.md](06-recipe-detail.md) |

**V1 明确不做（out of scope）**：

- 用户创建/上传配方（表结构预留，功能不开放）
- 社区功能：评论、关注、公开个人主页
- 辅料（果汁、糖浆、苦精等非酒精材料）入库存——辅料仅在配方页展示提示
- 社区评分聚合展示（V1 卡片评分用官方策展分，见 [匹配引擎](02-matching-engine.md) 的评分与热度规则）
- 购物清单 / 比价 / 电商跳转
- 原生 App、PWA 离线
- 深色模式

### 3.2 V2 方向：用户分享配方（仅路线图）

用户可创建自己的配方（`recipes.author_id` + `is_public` 从第一天已预留，见 [数据模型](01-data-model.md)）；个人配方默认私有，可选公开；公开配方进入配方库带作者署名；需要基础的内容审核机制。届时评分/热度切换为社区数据聚合。

### 3.3 V3 方向：RAG Chatbot（仅路线图）

基于配方库 + 用户酒柜的对话式推荐：「我想喝清爽一点的、用完这瓶快过期的 Vermouth」。技术上以配方/材料为语料建向量索引，结合用户库存做检索增强。

## 4. 信息架构

### 4.1 路由表

所有路由带 locale 前缀（`/zh`、`/en`），默认按浏览器语言重定向，用户手动切换后写 cookie 持久化（细则见 [国际化与全局状态](09-i18n-and-global-states.md)）。

| 路由 | 页面 | 未登录可访问 |
|---|---|---|
| `/{locale}` | Home Dashboard | ✅（引导态，见 [04-home-dashboard.md](04-home-dashboard.md) 未登录状态） |
| `/{locale}/recipes` | 配方库 | ✅ |
| `/{locale}/recipes/[slug]` | 配方详情 | ✅ |
| `/{locale}/cabinet` | 我的酒柜 | 🔒 → 跳转登录 |
| `/{locale}/favorites` | 收藏 | 🔒 |
| `/{locale}/history` | 调酒记录 | 🔒 |
| `/{locale}/profile` | 个人设置（语言、登出；移动端为 History 入口） | 🔒 |
| `/{locale}/login` `/{locale}/signup` | 登录 / 注册 | ✅ |
| `/{locale}/reset-password` | 重置密码（发送邮件 + 回跳更新密码，见 [03-auth.md](03-auth.md)） | ✅ |
| `/auth/callback` | Auth 回调（邮件确认着陆，**无 locale 前缀**；交换会话后重定向回目标页，见 [03-auth.md](03-auth.md)） | ✅ |

### 4.2 导航结构

V1 桌面导航**只有顶部导航一套**；侧边栏壳（design.md §5 option B）保留给 V2，V1 不实现、不由实现者自行选择。

- **宽视口（≥1024px）**：顶部导航（design.md §5 Top Navigation）——logo、Today / Recipes / Cabinet / History / Favorites、搜索框（P1，回车跳转 `/recipes?q=`）、语言切换、头像菜单（Profile / 登出）。
- **窄视口（<1024px，含移动端）**：底部悬浮药丸 Tab——Home / Recipes / Cabinet / Favorites / Profile。History 从 Profile 进入；语言切换与登出也在 Profile 页。

断点说明：**内容布局在 768px 切换，导航壳单独在 1024px 切换**——768–1024px 区间使用桌面内容布局 + 底部药丸 Tab，避免在窄桌面视口塞入五个导航项、搜索框、语言切换和头像。在这两级之外，个别模块允许做局部响应式适配（如首页统计栏仅 ≥1280px 才与 hero 并排、卡片网格列数随宽度递增），以对应 feature PRD 与 `design.md` 为准；导航壳与整体内容布局只认 768 / 1024 两级。

### 4.3 权限矩阵

| 能力 | 访客 | 登录用户 |
|---|---|---|
| 浏览配方库 / 配方详情 | ✅ | ✅ |
| 查看首页 Daily Pour | ✅（全库策展版） | ✅（个人化版） |
| 库存匹配（Can Make / Missing，算法见 [02-matching-engine.md](02-matching-engine.md)） | ❌ 显示登录引导 | ✅ |
| 酒柜、收藏、评分、调酒记录 | ❌ 点击跳转登录 | ✅ |

## 5. 非功能需求

- **性能**：内容页（配方库/详情）用静态生成 + ISR（内容表读多写少）；LCP < 2.5s（移动 4G）；图片一律 `next/image` + 显式尺寸。
- **响应式**：内容布局断点 768px，导航壳断点 1024px（见 §4.2，布局规则见 design.md §5/§7）；移动端无横向滚动。
- **可访问性**：全部可聚焦元素有 focus-ring；图片有 alt（配方/酒瓶名）；色彩对比满足 WCAG AA；modal 可 Esc 关闭、焦点圈闭。
- **SEO**：配方详情 SSG，`hreflang` 双语互指，OG 图用配方图。
- **安全**：所有表 RLS 开启（策略见 [数据模型](01-data-model.md)）；服务端写操作校验登录态；不暴露 service key 到客户端。
- **浏览器**：最新两个大版本的 Chrome / Safari / Firefox / Edge，iOS Safari ≥ 16。

## 6. 成功指标（轻量）

个人项目，用 Vercel Analytics 观测即可，不做自建埋点。

- **North Star**：每周 Log Your Pour 记录数（核心循环是否转起来）。
- 辅助：注册→添加第一瓶酒的转化率；Daily Pour 的 View Recipe 点击率。

## 7. 风险与开放问题

| # | 风险 / 问题 | 影响 | 缓解 |
|---|---|---|---|
| 1 | 配方与酒瓶图片版权 | 上线阻塞 | 可商用图库/自摄；占位符策略已定（见 [数据模型](01-data-model.md) 种子数据要求） |
| 2 | 种子数据工作量大（50 配方 × 双语 × 配料标注） | 排期 | 分两级门槛：Engineering MVP 以 20 款覆盖 7 大基酒起跑；对外发布（Public V1）须补齐 ≥50 款并达到图片覆盖率要求（门槛定义见 [数据模型](01-data-model.md) 种子数据与发布门槛） |
| 3 | 利口酒按品种匹配偏严（缺 Campari 则 Negroni 不可调——符合事实但可调数看起来少） | 体验 | Missing Just One 入口 + wishlist 引导购买；不放宽匹配 |
| 4 | 配方超 200 条后客户端全量加载策略失效（加载策略见 [配方库](05-recipes-library.md)） | 性能 | 届时引入分页/服务端筛选，matching 纯函数不受影响 |
| 5 | V2 用户内容的审核与图片存储方案未定 | V2 | V2 规划时定，V1 仅保留表结构预留 |

## 8. 附录 A：设计稿索引

| 导出图（design/exports/v2/） | 对应规格 |
|---|---|
| 00-tokens | design.md §2–§4 |
| 01-desktop-dashboard / 05-mobile-home | [04-home-dashboard.md](04-home-dashboard.md) |
| 02-recipe-detail | [06-recipe-detail.md](06-recipe-detail.md) |
| 03-recipes-grid | [05-recipes-library.md](05-recipes-library.md) |
| 04-my-cabinet / 06-mobile-cabinet | [07-my-cabinet.md](07-my-cabinet.md) |
| 07-auth-desktop-login / 08-auth-mobile-signup | [03-auth.md](03-auth.md) |
| 09-overlays-modal-dropdown-toast | [06-recipe-detail.md](06-recipe-detail.md)（Log Your Pour modal）· [07-my-cabinet.md](07-my-cabinet.md)（Add Bottle / 移除确认）· [09-i18n-and-global-states.md](09-i18n-and-global-states.md)（toast） |
| 10-interaction-states | design.md §8 交互状态速查 |

## 9. 附录 B：PRD 文件索引

| 文件 | 内容 |
|---|---|
| [00-overview.md](00-overview.md)（本文件） | 产品概述、版本规划、信息架构、非功能需求、成功指标、风险与开放问题、设计稿索引 |
| [01-data-model.md](01-data-model.md) | 数据模型：Supabase 表结构、RLS 策略、种子数据要求 |
| [02-matching-engine.md](02-matching-engine.md) | 匹配与推荐逻辑：匹配单元、canMake / missing、dailyPour、becauseYouHave、评分与热度、单元测试要求 |
| [03-auth.md](03-auth.md) | Auth：注册/登录/登出/重置密码、Google OAuth |
| [04-home-dashboard.md](04-home-dashboard.md) | Home Dashboard：Daily Pour、Cabinet Snapshot、Because You Have X、Recently Added Bottles、空/未登录状态 |
| [05-recipes-library.md](05-recipes-library.md) | Recipes 配方库：搜索、筛选、排序、配方卡、URL 状态 |
| [06-recipe-detail.md](06-recipe-detail.md) | Recipe Detail：配料与库存状态、Availability Panel、收藏/评分、Log Your Pour、分享 |
| [07-my-cabinet.md](07-my-cabinet.md) | My Cabinet：酒瓶列表、Add Bottle、owned/wishlist 切换、移除确认 |
| [08-favorites-history.md](08-favorites-history.md) | Favorites & History：收藏网格、调酒记录列表 |
| [09-i18n-and-global-states.md](09-i18n-and-global-states.md) | 国际化 + 全局状态与反馈：路由/文案/数据双语、fallback、loading/toast/错误页 |
