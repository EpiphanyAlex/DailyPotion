# DailyPotion 产品需求文档（PRD）

| | |
|---|---|
| 版本 | v1.0 |
| 日期 | 2026-07-10 |
| 状态 | V1 需求已定稿，V2/V3 为方向性路线图 |
| 相关文档 | 视觉 token：`design.md`（唯一权威）· 设计稿：`design_system.pen`（Pencil，v2 导出图见 `design/exports/v2/`）· 工作约定：`CLAUDE.md` |

---

## 1. 产品概述

### 1.1 一句话定位

DailyPotion 是一个「家庭酒柜管理 + 鸡尾酒配方推荐」Web 应用：记录你家里有什么酒，告诉你现在能调什么鸡尾酒。

### 1.2 要解决的问题

家庭调酒爱好者的三个日常痛点：

1. **"我买了酒却不知道调什么"**——手里有 Roku Gin、几瓶利口酒，但不知道这些组合能做出哪些经典鸡尾酒。
2. **"配方网站不知道我有什么"**——通用配方站每次都要人肉核对材料，无法按我的库存反过来推荐。
3. **"调过什么、好不好喝，全靠记忆"**——没有地方记录自己的调酒历史和口味偏好。

### 1.3 目标用户

- **主要**：家庭调酒入门者与爱好者。家里有 3–20 瓶基酒/利口酒，想充分利用现有库存，中文或英文使用者。
- **次要（V2 起）**：愿意分享自创配方的进阶玩家。

### 1.4 核心循环

```
添加酒瓶 → 看到「你能调 N 款」 → 挑一款调 → 记录 & 评分 → 发现「只差一瓶就能解锁 M 款」 → 添加新酒瓶
```

产品所有页面都为强化这个循环服务：首页回答「今天调什么」，酒柜页回答「我有什么、还缺什么」，配方库回答「都有哪些可能」。

---

## 2. 版本规划

### 2.1 V1（MVP）范围

| 模块 | 包含 | 优先级 |
|---|---|---|
| Auth | 邮箱注册/登录/登出/重置密码（Supabase Auth） | P0 |
| Auth | Google OAuth 登录 | P1 |
| 酒柜管理 | 从官方酒瓶库添加/移除；owned/wishlist 状态；手动添加自定义酒瓶 | P0 |
| 配方库 | 浏览/搜索/筛选/排序官方配方（≥50 款经典配方，双语） | P0 |
| 配方详情 | 配料、步骤、库存匹配面板、Bartender Tip | P0 |
| 匹配推荐 | Can Make / Missing 判定、Daily Pour、Because You Have X、酒柜统计 | P0 |
| 用户标记 | 收藏、评分（1–5 星） | P0 |
| 调酒记录 | Log Your Pour（日期/星级/口味 tag/笔记）、History 页 | P0 |
| 国际化 | `/zh` `/en` 路由，界面文案 + 数据内容全双语 | P0 |
| 分享 | 配方详情页复制链接 | P1 |

**V1 明确不做（out of scope）**：

- 用户创建/上传配方（表结构预留，功能不开放）
- 社区功能：评论、关注、公开个人主页
- 辅料（果汁、糖浆、苦精等非酒精材料）入库存——辅料仅在配方页展示提示
- 社区评分聚合展示（V1 卡片评分用官方策展分，见 §5.6）
- 购物清单 / 比价 / 电商跳转
- 原生 App、PWA 离线
- 深色模式

### 2.2 V2 方向：用户分享配方（仅路线图）

用户可创建自己的配方（`recipes.author_id` + `is_public` 从第一天已预留）；个人配方默认私有，可选公开；公开配方进入配方库带作者署名；需要基础的内容审核机制。届时评分/热度切换为社区数据聚合。

### 2.3 V3 方向：RAG Chatbot（仅路线图）

基于配方库 + 用户酒柜的对话式推荐：「我想喝清爽一点的、用完这瓶快过期的 Vermouth」。技术上以配方/材料为语料建向量索引，结合用户库存做检索增强。

---

## 3. 信息架构

### 3.1 路由表

所有路由带 locale 前缀（`/zh`、`/en`），默认按浏览器语言重定向，用户手动切换后写 cookie 持久化。

| 路由 | 页面 | 未登录可访问 |
|---|---|---|
| `/{locale}` | Home Dashboard | ✅（引导态，见 §4.2.6） |
| `/{locale}/recipes` | 配方库 | ✅ |
| `/{locale}/recipes/[slug]` | 配方详情 | ✅ |
| `/{locale}/cabinet` | 我的酒柜 | 🔒 → 跳转登录 |
| `/{locale}/favorites` | 收藏 | 🔒 |
| `/{locale}/history` | 调酒记录 | 🔒 |
| `/{locale}/profile` | 个人设置（语言、登出；移动端为 History 入口） | 🔒 |
| `/{locale}/login` `/{locale}/signup` | 登录 / 注册 | ✅ |

### 3.2 导航结构

- **桌面（≥768px）**：顶部导航（design.md §5 Top Navigation option A）——logo、Today / Recipes / Cabinet / History / Favorites、搜索框（P1，回车跳转 `/recipes?q=`）、语言切换、头像菜单（Profile / 登出）。
- **移动（<768px）**：底部悬浮药丸 Tab——Home / Recipes / Cabinet / Favorites / Profile。History 移动端从 Profile 进入。

### 3.3 权限矩阵

| 能力 | 访客 | 登录用户 |
|---|---|---|
| 浏览配方库 / 配方详情 | ✅ | ✅ |
| 查看首页 Daily Pour | ✅（全库策展版） | ✅（个人化版） |
| 库存匹配（Can Make / Missing） | ❌ 显示登录引导 | ✅ |
| 酒柜、收藏、评分、调酒记录 | ❌ 点击跳转登录 | ✅ |

---

## 4. V1 功能规格

各模块规格对齐 `design/exports/v2/` 设计稿；视觉规格（颜色/字体/间距/状态）一律以 `design.md` 为准，本章只写行为与数据逻辑。

### 4.1 Auth（设计稿 07、08）

**功能点**

- 邮箱 + 密码注册（Supabase Auth，开启邮件确认）；密码 ≥8 位。
- 登录、登出、忘记密码（Supabase 内建 reset 邮件流）。
- Google OAuth（P1）：Secondary 按钮样式，与邮箱表单以「或」分隔线隔开。
- 注册页引导文案呈现三步路径：**注册 → 添加第一瓶酒 → 看能调什么**。
- 校验：客户端即时校验（邮箱格式、密码长度、两次密码一致）；未通过时主按钮禁用；服务端错误（邮箱已注册等）以表单错误条展示，文案双语。
- 登录成功后跳转：有 `redirect` 参数回原页，否则去 `/{locale}`。

**验收标准**

- 新用户可完成注册 → 收到确认邮件 → 确认后登录成功。
- 未登录访问 `/cabinet` 被重定向到 `/login?redirect=/cabinet`，登录后回到酒柜页。
- 错误态视觉符合 design.md 表单规格（danger-soft 底 + danger 边 + 图标文案）。

### 4.2 Home Dashboard（设计稿 01、05）

首页是 Dashboard，不是静态酒单。桌面自上而下：Daily Pour hero → Cabinet Snapshot → Because You Have X → Recently Added Bottles。移动端为紧凑卡片版（compact Daily Pour、snapshot cards、横向配方 carousel）。

**4.2.1 Today's Daily Pour（hero）**

- 每日为用户确定性推荐一款配方（算法见 §5.4），当天内刷新不变。
- 展示：配方图、名称（双语）、描述、flavor tags、时长/难度/ABV、状态（Can Make 或 Missing 列表）。
- 操作：View Recipe（去详情）、Save（收藏切换）。

**4.2.2 Cabinet Snapshot（4 个数据卡）**

| 卡片 | 定义 |
|---|---|
| Bottles Owned | `user_bottles` 中 `status = owned` 的数量 |
| Cocktails You Can Make | 可调配方数（§5.2） |
| Missing Just One | 只差 1 种匹配单元即可解锁的配方数（§5.3） |
| Cabinet Completion | 可调配方数 ÷ 公开配方总数，四舍五入为百分比 |

- 每张卡可点击：前两张去对应列表（Cabinet / Recipes?filter=can-make），Missing Just One 去 `/recipes?filter=missing-one`。
- CTA：Go to Cabinet。

**4.2.3 Because You Have X（横向推荐）**

- X = 用户 owned 酒瓶中**解锁可调配方数最多**的一瓶（并列取最近添加），规则见 §5.5。
- 展示 5 张配方卡：图片、名称（双语）、评分、Can Make/Missing 状态、收藏按钮。

**4.2.4 Recently Added Bottles**

- 用户最近添加的 owned 酒瓶（最多 6 个），点击去酒柜。

**4.2.5 空酒柜状态**

- 酒柜为空时，Snapshot 与推荐区收起，显示空状态卡：「Add your first bottle」+ Start with Gin / Whisky / Rum 快捷入口（点击打开 Add Bottle modal 并预选该类型筛选）。

**4.2.6 未登录状态**

- Daily Pour 显示全库策展版（§5.4 访客分支）；Snapshot 区替换为注册引导卡（三步路径文案 + Sign up CTA）；推荐区显示 Popular 配方。

**验收标准**

- 同一用户同一天内多次刷新，Daily Pour 不变；次日变化。
- 添加/移除酒瓶后返回首页，4 个统计数字即时正确。
- 空酒柜、未登录两种状态按上述规则渲染，无残缺模块。

### 4.3 Recipes 配方库（设计稿 03）

**功能点**

- **搜索**：按配方名（zh + en 同时匹配，不区分大小写、子串匹配）。
- **筛选 chips**：All Spirits / Gin / Whisky / Rum / Vodka / Tequila / Brandy / Liqueur（单选）+ Can Make / Favorites（可与基酒筛选叠加；未登录点击这两个 chip 跳登录）。
- **Missing Just One 筛选态**：无常驻 chip，仅通过 URL（`?filter=missing-one`，来自首页 Snapshot 卡）进入；激活时在 chip 区显示一个可清除的选中态 chip「Missing Just One」。
- **排序**：Popular（默认，`base_popularity` 降序）/ Recently Added / Easy First（难度升序，同级按 popular）。
- **配方卡**：图片、名称（双语）、基酒标签（带分类色点）、flavor tags、评分、Can Make / Missing N 状态徽章、收藏按钮。
- **数据加载**：V1 配方总量 ≤200，一次性加载 + 客户端筛选排序；超过后再引入分页（记入 §9 开放问题）。
- **空结果**：说明当前筛选无结果 + Clear filters 按钮。
- URL 反映筛选状态（`?q=&spirit=&filter=&sort=`），可分享、可后退。

**验收标准**

- 筛选、搜索、排序任意组合正确联动，URL 同步。
- 未登录用户看不到 Can Make 徽章（显示中性的基酒标签即可），点击 Can Make chip 跳登录。
- 空结果状态可一键清除筛选。

### 4.4 Recipe Detail（设计稿 02）

**功能点**

- **Hero**：配方图、名称（双语）、描述、flavor tags、meta（时长 / ABV / 难度）。
- **Ingredients**：全部配料列表（含辅料）。基酒/利口酒行（`is_spirit = true`）标注库存状态：拥有 ✓（success 色）/ 缺少（ink-soft，不用警示红）。辅料行仅展示名称与用量，不做库存判定。
- **Instructions**：有序步骤列表。
- **Availability Panel**：登录且全部匹配 →「You have all ingredients」（success-soft）；有缺失 →「Missing: Campari, Sweet Vermouth」（paper-deep，缺失项为匹配单元名）；未登录 →「登录后查看你的酒柜匹配」+ 登录链接。
- **操作**：
  - **Favorite**：即时切换，toast 反馈。
  - **Rate this recipe**：1–5 星，写入 `user_recipe_marks.rating`，可修改；仅展示「你的评分」。
  - **Log Your Pour**（modal，设计稿 09）：日期（默认今天，不可选未来）、星级（可空）、口味 tag chips（多选，来自固定 tag 字典）、笔记（≤500 字，可空）。保存后 toast + 写入 History。
  - **Share**（P1）：复制当前 URL，toast 确认。
- **Bartender Tip**：`recipes.tip_*` 非空时展示小型提示卡。
- 移动端：图片置顶、内容滚动、底部 sticky 操作条（Log Your Pour / Favorite），不与 bottom tab 重叠。

**验收标准**

- 库存状态与酒柜实时一致（添加缺失的酒后回到详情页，Availability 变为全有）。
- Log Your Pour 保存后立即出现在 History 页顶部。
- 未登录点击 Favorite / Rate / Log 任一操作跳转登录，登录后回到该配方页。

### 4.5 My Cabinet（设计稿 04、06）

**功能点**

- **列表**：桌面为酒瓶卡片网格（瓶图、名称、类型标签、容量、owned/wishlist、添加日期、more 菜单）；移动端为 list-first 布局 + sticky 筛选 + 悬浮 Add 按钮。
- **搜索**：按酒瓶名（zh/en）。
- **筛选**：All Types / 各基酒类型 / Owned / Wishlist / Recently Added。
- **Add Bottle（modal，设计稿 09）**：
  - 搜索 `bottles_catalog`（zh/en 名、品牌），结果行带基酒分类色图标；选择后设 owned 或 wishlist。
  - 已在酒柜中的瓶子在结果中标注「已拥有」，不可重复添加。
  - 底部手动添加入口（info-soft）：找不到时填自定义名称 + 选择类型（必填，决定匹配）+ 容量（可选），存为自定义酒瓶。
- **状态切换**：wishlist ↔ owned 一键切换（wishlist 不参与匹配，§5.1）。
- **移除（破坏性确认，设计稿 09）**：popover 说明影响——「移除后将有 N 款配方变为不可调」（N 由匹配函数计算）；确认按钮 danger 样式。

**验收标准**

- 从 catalog 添加、手动添加、切换状态、移除四个操作后，首页统计与配方库 Can Make 状态均即时正确。
- 同一 catalog 瓶不能重复添加；自定义瓶必须选类型才能保存。
- 移除确认弹层展示的 N 与实际解锁变化一致。

### 4.6 Favorites & History

- **Favorites**：收藏配方网格，复用配方卡组件；空状态引导去配方库。
- **History**：调酒记录时间倒序列表——配方名（链接详情）、日期、星级、口味 tags、笔记摘要；单条可编辑、可删除（删除需确认）；空状态引导「调一杯并记录」。

**验收标准**

- 收藏/取消在所有出现收藏按钮的页面即时同步。
- History 记录编辑、删除后列表即时更新；只能看到和操作自己的记录。

### 4.7 国际化

- next-intl，`/zh` `/en` 前缀路由；首次访问按 `Accept-Language` 重定向；语言切换器写 cookie，后续访问优先 cookie。
- UI 文案：`messages/zh.json` / `messages/en.json`，禁止组件内硬编码文案。
- 数据内容：`*_zh` / `*_en` 双列；**fallback 规则：当前 locale 列为空时显示另一语言列**，两列都空显示占位符。
- 口味 tag、难度、类型等枚举值存 slug，翻译放 messages。

**验收标准**

- 全站无硬编码文案；zh/en 切换后所有页面（含 toast、错误提示、空状态）语言正确。
- 人为清空某配方 `description_en` 后，英文站该字段显示中文内容而非空白。

### 4.8 全局状态与反馈

- Loading：paper-deep skeleton（design.md §8），列表页与详情页均需 skeleton 布局。
- 写操作（收藏/评分/记录/酒柜变更）：乐观更新 + 失败回滚 + danger toast。
- 全局错误页与 404 页遵循空状态样式，双语。

---

## 5. 匹配与推荐逻辑（`lib/matching.ts`）

所有匹配/推荐/统计逻辑集中在 `lib/matching.ts`，为**无副作用纯函数**，禁止散落进组件。输入输出均为普通数据对象，不依赖 Supabase client。

### 5.1 匹配单元与输入

- **匹配单元 = `spirit_types` 表的一行**。基酒粒度到大类（gin、whisky…），利口酒/加强酒粒度到具体品种（Campari、Sweet Vermouth、Triple Sec…）。
- 用户侧输入：owned 酒瓶集合映射为 `Set<spiritTypeId>`（catalog 瓶经 `bottles_catalog.spirit_type_id`，自定义瓶用自身 `spirit_type_id`；同类多瓶自然去重）。**wishlist 一律不参与**。
- 配方侧输入：每配方的 `is_spirit = true` 配料的 `spirit_type_id` 列表。辅料（`is_spirit = false`）不参与任何匹配计算。

### 5.2 canMake

配方所有 `is_spirit` 配料的 `spirit_type_id` 都在用户集合中 → Can Make。无 `is_spirit` 配料的配方（理论上不存在，种子数据校验兜底）视为不可调。

### 5.3 missing 与统计

- `missing(recipe, owned)`：返回缺少的匹配单元列表（保持配料顺序）。
- `missingJustOne`：`missing.length === 1` 的配方数。
- `completion`：`canMakeCount / totalPublicRecipes`，0 配方时为 0。

### 5.4 dailyPour

- **登录且可调数 > 0**：候选 = 可调配方按 `slug` 排序；索引 = `hash(user_id + "YYYY-MM-DD") % 候选数`。确定性：同人同天恒定，跨天轮换。
- **登录但可调数 = 0**：降级为「Missing Just One」候选池；仍为空则走访客分支。
- **访客 / 空酒柜**：候选 = 策展池（`base_rating ≥ 4.5` 的公开配方），索引 = `hash("YYYY-MM-DD") % 候选数`。
- hash 用简单稳定的字符串哈希（如 FNV-1a），不引入依赖。日期取用户本地时区当天。

### 5.5 becauseYouHave

- 选瓶：对每个 owned 瓶计算「其匹配单元参与的可调配方数」，取最大者；并列取 `created_at` 最新。
- 选配方：含该匹配单元的配方，排序 Can Make 优先 → missing 数升序 → `base_popularity` 降序，取前 5。

### 5.6 评分与热度（V1 规则）

- 卡片/排序所用评分与热度来自官方策展字段 `recipes.base_rating`（3.0–5.0）与 `base_popularity`（整数权重），随种子数据人工维护。
- 用户个人评分（`user_recipe_marks.rating`）只对本人展示（详情页「你的评分」）。社区聚合评分推迟到 V2 与用户配方一起设计。

### 5.7 单元测试要求（`npm test` 必须覆盖）

- canMake：全匹配 / 部分缺失 / 空酒柜 / 配方无 spirit 配料。
- missing：顺序稳定、wishlist 不计入、同类多瓶去重。
- 统计：completion 边界（0 配方、0 可调、全可调）。
- dailyPour：同 seed 幂等、跨天变化、三个分支的降级顺序。
- becauseYouHave：选瓶并列规则、top5 排序规则。

---

## 6. 数据模型（Supabase Postgres）

迁移文件存 `supabase/migrations/`；种子脚本存 `supabase/seed/`。所有表启用 RLS。

### 6.1 内容表（官方内容，全员可读）

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
  base_rating   numeric not null default 4.0   -- 3.0–5.0 官方策展分（§5.6）
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

### 6.2 用户表（仅本人读写）

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

### 6.3 RLS 策略

| 表 | select | insert / update / delete |
|---|---|---|
| spirit_types / bottles_catalog / recipes / recipe_ingredients | 所有人（含 anon）；recipes 加 `is_public = true or author_id = auth.uid()` | 仅 service role（V1 官方内容经迁移/脚本维护；V2 再开放 `author_id = auth.uid()` 写入） |
| user_bottles / user_recipe_marks / user_pour_logs | `user_id = auth.uid()` | `user_id = auth.uid()` |

### 6.4 种子数据要求

- `spirit_types` ≈ 25 条：7 大基酒类 + 常用利口酒/加强酒品种（Campari、Sweet/Dry Vermouth、Triple Sec、Coffee Liqueur、Amaretto 等）。
- `bottles_catalog` ≈ 60 条常见市售瓶（含 Roku Gin），尽量配图。
- `recipes` ≥ 50 款经典配方，双语内容完整（名称/描述/步骤/Tip），每款配料完整且 `is_spirit` 标注正确；种子脚本校验：每配方至少 1 条 `is_spirit = true` 配料。
- 图片：V1 使用可商用图源或自摄，统一比例；缺图时使用 paper-deep 占位（design.md §8），不阻塞上线。

---

## 7. 非功能需求

- **性能**：内容页（配方库/详情）用静态生成 + ISR（内容表读多写少）；LCP < 2.5s（移动 4G）；图片一律 `next/image` + 显式尺寸。
- **响应式**：断点 768px，布局规则见 design.md §5/§7；移动端无横向滚动。
- **可访问性**：全部可聚焦元素有 focus-ring；图片有 alt（配方/酒瓶名）；色彩对比满足 WCAG AA；modal 可 Esc 关闭、焦点圈闭。
- **SEO**：配方详情 SSG，`hreflang` 双语互指，OG 图用配方图。
- **安全**：所有表 RLS 开启；服务端写操作校验登录态；不暴露 service key 到客户端。
- **浏览器**：最新两个大版本的 Chrome / Safari / Firefox / Edge，iOS Safari ≥ 16。

---

## 8. 成功指标（轻量）

个人项目，用 Vercel Analytics 观测即可，不做自建埋点。

- **North Star**：每周 Log Your Pour 记录数（核心循环是否转起来）。
- 辅助：注册→添加第一瓶酒的转化率；Daily Pour 的 View Recipe 点击率。

---

## 9. 风险与开放问题

| # | 风险 / 问题 | 影响 | 缓解 |
|---|---|---|---|
| 1 | 配方与酒瓶图片版权 | 上线阻塞 | 可商用图库/自摄；占位符策略已定（§6.4） |
| 2 | 种子数据工作量大（50 配方 × 双语 × 配料标注） | 排期 | 先 20 款覆盖 7 大基酒上线，增量补充 |
| 3 | 利口酒按品种匹配偏严（缺 Campari 则 Negroni 不可调——符合事实但可调数看起来少） | 体验 | Missing Just One 入口 + wishlist 引导购买；不放宽匹配 |
| 4 | 配方超 200 条后客户端全量加载策略失效 | 性能 | 届时引入分页/服务端筛选，matching 纯函数不受影响 |
| 5 | V2 用户内容的审核与图片存储方案未定 | V2 | V2 规划时定，V1 仅保留表结构预留 |

---

## 10. 附录：设计稿索引

| 导出图（design/exports/v2/） | 对应规格 |
|---|---|
| 00-tokens | design.md §2–§4 |
| 01-desktop-dashboard / 05-mobile-home | §4.2 |
| 02-recipe-detail | §4.4 |
| 03-recipes-grid | §4.3 |
| 04-my-cabinet / 06-mobile-cabinet | §4.5 |
| 07-auth-desktop-login / 08-auth-mobile-signup | §4.1 |
| 09-overlays-modal-dropdown-toast | §4.4 Log modal、§4.5 Add Bottle/移除确认、§4.8 toast |
| 10-interaction-states | design.md §8 交互状态速查 |
