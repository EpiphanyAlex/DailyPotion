# DailyPotion 设计系统 · Modern Editorial Home Bar

视觉方向：**Modern Editorial Home Bar**。DailyPotion 保留米色纸张质感、衬线字体和复古酒单气质作为品牌识别；同时通过更现代的卡片布局、清晰的数据模块、真实鸡尾酒图片、产品化导航和状态反馈，让它更像一个家庭酒柜管理 Web App，而不是一张静态酒单。

设计稿源文件：Pencil（根目录 `design_system.pen`，只能用 pencil MCP 工具读写）。本文件是 DailyPotion 设计 token 的唯一权威定义（single source of truth）。前端实现、设计稿和导出参考图必须引用这里的 token，禁止硬编码色值、字号、间距、圆角或阴影。

> **设计稿双语说明**：`design/exports/v2/` 画稿中大面积中英并排是画稿示意，**不是运行时规则**。运行时 UI 文案只显示当前语言；实体名（配方名/酒瓶名）可选配次要第二语言别名（caption 号、`ink-faint`）。显示策略权威见 `docs/prd/09-i18n-and-global-states.md` §2.4。
> 画稿中出现的「hover 态」「错误态示例」「禁用态示例」等标注是设计注释，一律不得进入产品文案。
> **画稿范围 = Public V1 end state**：画稿包含顶部搜索框与 Google 登录（均 P1）。Engineering MVP（Phase 1–8）不实现它们——实现时**隐藏**搜索框、Google 按钮与「或」分隔线，不留占位（`docs/plans/README.md` 待办表）。「记住我」已从产品范围移除（V1 一律 Supabase 默认持久会话），任何画稿中出现均属过期稿错误。

## 1. Design Principles

- **Editorial, not antique**：保留酒单识别度，但避免老酒吧菜单、静态 PDF、过度花边和重装饰。
- **Product dashboard first**：首页优先回答「今天调什么」「我的酒柜能做什么」「下一步去哪里」。
- **Real cocktail imagery**：配方和推荐卡片优先使用真实鸡尾酒图片；图标只用于导航、操作和状态。
- **Data with warmth**：酒柜数量、可调数量、缺少材料、完成度等数据模块要清晰、克制、可扫描。
- **Stateful and interactive**：hover、active、selected、success、empty state 都必须明确可见。
- **Light paper surface**：页面是干净的浅纸色，允许非常轻微 paper texture；不要脏、不要深色酒吧背景、不要 neon glow。

## 2. Color Tokens

### Core Palette

| Token | Value | Usage |
|---|---:|---|
| `--color-paper` | `#F6EFE0` | 页面背景，轻微纸张质感 |
| `--color-paper-raised` | `#FCF7EA` | 卡片、输入框、导航、弹层基础表面 |
| `--color-paper-deep` | `#EFE5CF` | 次级区域、空状态、浅分组背景 |
| `--color-ink` | `#2E2418` | 主文字、强图标 |
| `--color-ink-soft` | `#5C4F3F` | 正文、次级文字 |
| `--color-ink-faint` | `#726449` | 元信息、占位符、未激活图标（全部 paper 表面 ≥4.5:1） |
| `--color-accent` | `#7E2D26` | 主操作、active nav、selected filter |
| `--color-on-accent` | `#F9F3E4` | accent/success 深色背景上的文字 |
| `--color-gold` | `#A97E2F` | 细线、少量图标点缀——**仅装饰，不承担文字**（paper 上仅 3.21:1） |
| `--color-text-gold` | `#7A5A20` | kicker、金色小字（10–12px uppercase）；paper 上 5.5:1、gold-soft 上 5.0:1 |
| `--color-border` | `#D8CBAE` | 1px 装饰描边、分隔线、卡片描边——**不用于表单控件边框** |
| `--color-control-border` | `#93805F` | 输入框/搜索框/textarea/select 等控件边框（各 paper 表面 ≥3:1） |
| `--color-success` | `#55683C` | Can Make、Owned、成功状态 |

### Interaction & State Palette

| Token | Value | Usage |
|---|---:|---|
| `--color-paper-hover` | `#F8F1E2` | 卡片、列表行、chip、导航项 hover 表面 |
| `--color-paper-selected` | `#F4E4DE` | selected chip、active secondary surface、轻量收藏/筛选选中底色 |
| `--color-success-soft` | `#E8EAD8` | Can Make/Owned 的浅橄榄背景、成功提示条 |
| `--color-image-overlay` | `rgba(46, 36, 24, 0.42)` | 图片上文字、收藏按钮、渐变遮罩 |
| `--color-accent-hover` | `#6B241E` | 主按钮 / active nav 的 hover |
| `--color-accent-pressed` | `#571C17` | 主按钮按下态 |
| `--color-gold-soft` | `#F0E3C4` | kicker chip 底、rating 高亮底、轻量金色面 |
| `--color-focus-ring` | `#7E2D26` | 键盘焦点环，**统一规格 2px outline + 2px offset**（不透明 accent，paper 上 8:1；此前的 35% 透明版仅 1.85:1，禁用） |
| `--color-ink-disabled` | `#B5A98F` | 禁用文字 / 图标 |
| `--color-surface-disabled` | `#F2EBDA` | 禁用按钮 / 输入框表面 |

### Feedback Palette

表单校验、删除确认、toast 等系统反馈。注意：**缺基酒不是错误**，依然用 `ink-soft` + `paper-deep` 表达，danger 只用于真正的破坏性/失败场景。

| Token | Value | Usage |
|---|---:|---|
| `--color-danger` | `#A6402D` | 表单错误文字、删除确认按钮、失败 toast 图标 |
| `--color-danger-soft` | `#F2DCD2` | 错误输入框底 / 错误提示条背景 |
| `--color-info` | `#44606E` | 信息提示图标 / 文字、onboarding 引导（info-soft 上 5.3:1） |
| `--color-info-soft` | `#DFE7E4` | 信息提示条背景 |

### Spirit Category Palette

基酒分类色，用于筛选 chip 的色点、酒瓶卡片的类型标签、未来的酒柜构成图表。全部是降饱和的复古色相，与纸面协调。

| Token | Value | 基酒 |
|---|---:|---|
| `--color-spirit-gin` | `#5C7355` | 金酒（杜松绿） |
| `--color-spirit-whisky` | `#A06B2A` | 威士忌（琥珀） |
| `--color-spirit-rum` | `#7C4A26` | 朗姆（焦糖棕） |
| `--color-spirit-vodka` | `#677B8A` | 伏特加（冷灰蓝） |
| `--color-spirit-tequila` | `#47776B` | 龙舌兰（龙舌兰青） |
| `--color-spirit-brandy` | `#7C3D4F` | 白兰地（酒渍梅红） |
| `--color-spirit-liqueur` | `#6F5680` | 利口酒（暗紫藤） |

分类色用法规则：只作小面积识别色——8px 圆点、标签文字、图表扇区；**不做卡片/按钮的大面积底色**。需要浅底时用该色 12-15% 透明度叠在 paper 上。

### Shadow Tokens

| Token | Value | Usage |
|---|---:|---|
| `--shadow-card` | `0 8px 24px rgba(46, 36, 24, 0.08)` | 卡片的轻微纸感阴影，只用于需要从背景中抬起的模块 |
| `--shadow-floating` | `0 18px 48px rgba(46, 36, 24, 0.16)` | dropdown、popover、modal、mobile sticky action |

### Color Rules

- 金色系分工：`gold` 只用于细线和少量 icon（装饰，非文字）；kicker 等金色小字一律用 `text-gold`。不要大面积铺色。
- 表单控件（input / search / textarea / select）边框一律用 `control-border`；`border` 只做装饰描边与分隔线——依赖边框识别的控件用 `border` 是可访问性 bug（1.5:1）。
- 勃艮第红只用于主操作、active nav、selected filter 和关键状态。
- 橄榄绿只用于 Can Make、Owned、Success，不做装饰色。
- 缺少材料不用警示红；使用 `ink-soft`/`ink-faint` 文案和 `paper-deep` 表面表达。
- 所有 hover/active/selected 状态必须可见，且只能使用上表 token。
- 主按钮三态：默认 `accent` → hover `accent-hover` → 按下 `accent-pressed`；禁用用 `surface-disabled` + `ink-disabled`。
- 所有可聚焦元素必须有 `focus-ring` 键盘焦点环，统一 2px outline + 2px offset（全站唯一规格，不存在 3px 版本）。
- danger 仅用于表单错误、删除确认、失败反馈；info 仅用于中性提示。两者不与"缺基酒"混用。
- 基酒分类色只做小面积识别（色点/标签/图表），大面积底色仍由 paper 系承担。

## 3. Typography Tokens

| Token | Value | Usage |
|---|---|---|
| `--font-display` | `"Playfair Display", "Noto Serif SC", serif` | 品牌、页面标题、重点配方名 |
| `--font-body` | `"Lora", "Noto Serif SC", serif` | 正文、说明、配料、文章式内容 |
| `--font-ui` | `"Inter", "Noto Sans SC", system-ui, sans-serif` | 导航、按钮、表单、数据、状态标签 |

字体策略：不要把所有文字都做成厚重 display serif。Playfair 负责品牌和标题气质；数据、导航、按钮、表单使用更轻、更清晰的 UI 字体；正文保持 Lora/Noto Serif SC 的温度。中英文混排要自然，避免过度装饰。

| Token | Size | 落地值（CSS 变量取值，与实现同步） | Usage |
|---|---:|---|---|
| `--text-recipe-title` | `28-36px` | `clamp(28px, 24px + 1vw, 36px)` | Recipe title / 今日推荐主配方 |
| `--text-page-title` | `24-32px` | `clamp(24px, 21px + 0.8vw, 32px)` | 页面标题 |
| `--text-card-title` | `16-18px` | `17px` | 卡片标题、列表实体名 |
| `--text-body` | `14-16px` | `15px` | 正文、描述、配料、步骤 |
| `--text-caption` | `12px` | `12px` | meta、说明、secondary label |
| `--text-micro` | `10-12px` | `11px`（letter-spacing `1.5px`） | kicker、badge、tab label，uppercase + letter spacing |

落地建议：
- Recipe title：Playfair Display 28-36，line-height 1.1-1.2。
- Page title：Playfair Display 24-32，line-height 1.15。
- Card title：16-18，优先 `font-display` 或 `font-ui` 600。
- Body：14-16，line-height 1.5-1.65。
- Caption：12，line-height 1.4。
- Micro/kicker：10-12，uppercase，letter-spacing 1.5-2px，`color-text-gold`（不用 `color-gold`，对比度不足）。

## 4. Spacing, Radius & Layout Tokens

| Token | Value |
|---|---:|
| `--space-xs` | `4px` |
| `--space-sm` | `8px` |
| `--space-md` | `12px` |
| `--space-lg` | `16px` |
| `--space-xl` | `24px` |
| `--space-xxl` | `32px` |

| Token | Value | Usage |
|---|---:|---|
| `--radius-sm` | `6px` | 输入框、缩略图、行内状态 |
| `--radius-md` | `10px` | 卡片、面板、图片 |
| `--radius-pill` | `999px` | 按钮、徽章、chip、tab item |

布局规则：
- 桌面容器 max-width 1120px，居中；页面左右 padding 32-48px。
- 移动端页面 padding 20px；内容使用单一纵向 scroll container。
- 主要区块 gap 24-32px；卡片内部 padding 16px（桌面 20-24px）。
- 卡片使用 `paper-raised + border + radius-md`；只有关键模块添加 `shadow-card`。

## 5. Core Components

### Top Navigation（V1 唯一桌面导航，≥1024px）

- top navigation with logo left；nav links Today / Recipes / Cabinet / History / Favorites；search input；language switch；profile/avatar。
- **导航壳断点 1024px，内容布局断点 768px**（prd/00 §4.2）：768–1024px 区间用桌面内容布局 + Bottom Tab，不出现顶部导航。
- ~~Desktop option B（premium sidebar shell）~~：**V2 保留方案，V1 不实现**。参考图 `01-desktop-dashboard.png` 中的侧边栏不代表 V1 规格。
- Active nav：`color-accent` 文字或浅 `paper-selected` 背景，必要时加 1px `border`。
- Search：`paper-raised` 背景、`control-border` 边框、`radius-pill`、search icon、placeholder 使用 `ink-faint`。

### Mobile Bottom Tab（<1024px，含移动端）

- Tabs：Home / Recipes / Cabinet / Favorites / Profile。
- Container：floating pill，`paper-raised` + `border` + `shadow-floating`。
- Active tab：`accent` 背景 + `on-accent` icon/label。
- Inactive tab：透明背景 + `ink-faint`。

### Buttons

- Primary：`accent` background、`on-accent` text、`radius-pill`、height 40-48。
- Secondary：`paper-raised` background、`border`、`ink` text。
- Success action/status：`success` 或 `success-soft`，只用于可调/拥有/完成。
- Icon buttons：圆形或 pill，必须有 hover surface。

### Chips & Badges

- Default chip：`paper-raised` + `border` + `ink-soft`。
- Hover：`paper-hover`。
- Selected：`accent` + `on-accent`，或轻量场景用 `paper-selected` + `accent`。
- Can Make：`success-soft` 背景 + `success` 文字；强状态可用 `success` + `on-accent`。
- Missing：`paper-deep` 背景 + `ink-soft` 文字。

### Cards

- Recipe Card：图片、主名（当前 locale）+ 可选次要别名（另一语言，caption 号 `ink-faint`）、基酒/风味标签、rating、Can Make/Missing status、favorite icon。
- Bottle Card：bottle image、name、type、volume、owned/wishlist、added date、more menu。
- Data Card：数字清晰，label 短，使用 `font-ui`；不要用过大的古典 display。
- Hover：`paper-hover` + slight lift；selected：`paper-selected` 或 accent border。

### Images

- Cocktail and bottle images use real photo fills.
- 图片角标、收藏按钮或图片上文字必须使用 `color-image-overlay`。
- 不再用图标占位作为主要视觉；图标只作为 loading/empty fallback。

## 6. Page Patterns

### Home Dashboard

首页是 Web App Dashboard，不是静态酒单。

1. Top Navigation：logo、主导航、search、language、profile（≥1024px；<1024px 用 Bottom Tab。V1 不用侧边栏壳）。
2. Hero: Today’s Daily Pour：约占首屏 40-45% 高度；左侧真实鸡尾酒图片，右侧主名 + 可选次要别名/描述/tags/时间/难度/ABV；操作包括 Can Make、View Recipe、Save。
3. Cabinet Snapshot（四项统计，双形态，prd/04 §2/§4）：Bottles Owned、Cocktails You Can Make、Missing Just One、**Recipe Coverage**（不叫 Cabinet Completion；画稿示例数字 8 / 9 / 4 / 45%）。**≥1280px**：hero 右侧 At a Glance 统计栏——kicker + 四行（label 左、数字右），**每行整行可点击**（hover `paper-hover`），内嵌「最佳下一瓶：Campari · 可解锁 4 款」`gold-soft` 子卡 + Add to Cabinet / Wishlist CTA + Go to Cabinet 链接。**<1280px（含移动端）**：2×2 数据卡网格，每卡可点击；扩展区为网格下方全宽横条。
4. Because You Have Gin（标题用匹配单元名；副文案「From your Roku Gin」注明来源瓶）：横向推荐卡片 Martini、Tom Collins、Bee’s Knees、Gimlet、White Lady；每张显示图片、主名 + 可选次要别名、rating、Can Make、favorite。
5. Continue / Recently Added：根据空间选择 Recently Added Bottles 或 Continue Mixing。
6. Empty State：没有酒柜数据时展示 Add your first bottle，并提供 Start with Gin / Whisky / Rum quick choices。

### Recipe Detail

Recipe Detail 是可执行调酒流程，不只是文章页。

1. Header：Back、Favorite、Share、More。
2. Hero Area：真实鸡尾酒图；主名 + 可选次要别名；description；tags；meta（tags 与 meta 中的难度必须同源一致，不得同屏出现两个难度值）。
3. Ingredients + Instructions：双栏卡片（桌面）；移动端上下堆叠。行高清晰，配料和步骤使用分隔线；基酒/利口酒行带 owned ✓ / missing 标记（prd/06 §3.2）。
4. Availability Panel：明确显示「所需基酒/利口酒已备齐」（"All tracked spirits are available"）或 Missing: Campari, Sweet Vermouth——系统不跟踪辅料，文案不得声称 all ingredients。
5. Actions：Log Your Pour、Add to Favorites、Rate this recipe。
6. 评分展示：官方策展分（`base_rating`，一位小数）与「你的评分」（1–5 整数星）分开展示、分别标注，不共用控件（prd/06 §4.2）。
7. Bartender Tip：小型提示卡，不抢主流程。

### Recipes

内容浏览页，不是菜单列表。

- Page title + Search。
- Filter chips：All Spirits / Gin / Whisky / Rum / Vodka / Tequila / Brandy / Liqueur / Can Make / Favorites（清单以 prd/05 §3.2 为准）。
- Sort：Popular / Recently Added / Easy First。
- Recipe Card 必须包含：图片、名称、中文名、基酒/风味标签、rating、Can Make or Missing、favorite icon。
- 网格列数：<768px 1 列；768–1023px 2 列；≥1024px 3 列。4 列只允许 ≥1440px 宽屏（V1 不实现）。900px 内容板中的 4 列是画稿密度示意，不作为规格。

### My Cabinet

工具页，信息密集但优雅。

- Search bottles。
- Filters：All Types / Owned / Wishlist / Recently Added。
- Add Bottle button。
- Bottle card grid（列数规则同 Recipes：1 / 2 / 3 列，4 列仅 ≥1440px 且 V1 不实现）。
- Bottle Card：bottle image、name、type、volume、owned/wishlist、added date、more menu（移动端 list 行同样保留 more menu）。

### Auth（登录 / 注册）

- **桌面**：左右分屏——左侧真实鸡尾酒图 + `image-overlay` 遮罩 + 底部品牌名（Playfair 斜体）与 slogan；右侧居中表单列（宽 400）。
- **移动**：单列——logo、kicker、标题、说明文、表单、主按钮、切换链接；沿用页面 20-24px 边距。
- 表单规格：label 用 `font-ui` caption 600 `ink-soft`；输入框高 44、`paper-raised` + `control-border` + `radius-sm`；焦点态 `focus-ring`（统一 2px outline + 2px offset）；错误态 `danger-soft` 底 + 1.5px `danger` 边 + 下方 icon+`danger` 文案；未通过校验时主按钮为禁用态（`surface-disabled` + `ink-disabled`）。
- 表单规则以 `docs/prd/03-auth.md` 为准：密码 ≥8 位（无字母+数字组合要求）、注册含两次密码一致校验；画稿缺确认密码框、多写的密码规则属画稿错误（见附录 backlog）。
- **不做「记住我」**：登录表单无记住我勾选（V1 一律 Supabase 默认持久会话），密码行下方只保留右对齐的「忘记密码？」链接。
- 第三方登录（Google，P1 / Public V1）用 Secondary 按钮样式；分隔线"或"用 `border` 细线。Engineering MVP 不渲染 Google 按钮与分隔线，不留占位。
- 注册引导文案点出三步路径：注册 → 添加第一瓶酒 → 看能调什么。

### Overlays（Modal / Dropdown / Toast / 确认）

- **Modal**：`paper-raised` + `border` + `radius-md` + `shadow-floating`，padding 20；标题 Playfair title + 右上 X；页面背景加 `image-overlay` 遮罩。
  - Add Bottle Modal：搜索框（焦点态）→ 结果行（hover `paper-hover`；行内 wine 图标用基酒分类色）→ 底部 `info-soft` 手动添加入口。
  - Log Your Pour Modal：配方名 + 日期、金色星级（未选星用 `ink-disabled`）、口味 tag chips（选中态 `paper-selected` + `accent` 边；chips 只来自品饮 tag 字典 8 词——`balanced/refreshing/sweet/sour/bitter/strong/fruity/herbal`，prd/06 §4.3；自由感想进笔记，不做成 chip）、笔记 textarea、取消/保存按钮组右对齐。
- **Dropdown**：`paper-raised` + `shadow-floating`，padding 6；选中项 `paper-selected` + `accent` 文字 + check；hover 项 `paper-hover`。
- **Toast**：success 用 `success-soft` 底 + `success` 边/文字；失败用 `danger-soft` + `danger`；带 icon，`shadow-card`。
- **破坏性确认**（移除酒瓶等）：小型 popover，说明后果（"将有 4 款配方变为不可调"），确认按钮用 `danger` 底。

## 7. Mobile Patterns

移动端不是桌面压缩版，而是单独设计：

- Bottom Tab：Home / Recipes / Cabinet / Favorites / Profile（适用整个 <1024px 区间，见 §5）。
- Home mobile：compact Daily Pour card、**2×2 Cabinet snapshot cards（四项统计，含 Recipe Coverage，prd/04 §4）**、horizontal recipe carousel。
- Cabinet mobile：list-first layout、sticky filters、floating Add button。
- Recipe detail mobile：image top、content scroll、sticky bottom action（Log Your Pour / Favorite），不能和 bottom tab 重叠。

## 8. Empty, Loading & Feedback States

- Empty Cabinet：Add your first bottle；Start with Gin / Whisky / Rum quick choices。
- No recipes after filtering：说明当前筛选无结果，提供 Clear filters。
- Missing ingredients：列出缺少项，不使用警示红。
- Save/Favorite/Log 操作：即时状态反馈，按钮/图标状态变化必须可见。
- Loading：使用 `paper-deep` skeleton，避免 shimmer 过强。
- 交互状态速查（详见 Pencil「10 Interaction States」板）：
  - 主按钮：`accent` → hover `accent-hover` → 按下 `accent-pressed` → 禁用 `surface-disabled`+`ink-disabled`
  - 筛选 chip：`paper-raised`+border → hover `paper-hover` → 选中 `accent`+`on-accent`（基酒 chip 带分类色点）
  - 卡片 hover：`paper-hover` + `shadow-card` + 标题转 `accent`；过渡 150-200ms ease-out
  - 列表行 hover：`paper-hover`；键盘焦点一律 `focus-ring`

## 9. Implementation Rules

- `design.md` 是 token single source of truth；Pencil variables、CSS variables、Tailwind theme 必须与本文件同步。
- Tailwind v4：在 `app/globals.css` 的 `@theme` 中定义 token；组件只能使用 token 派生的 utility。
- 禁止在组件中硬编码 hex/rgb、字号、间距、圆角或阴影。新增视觉需求先补 token，再落地。
- 图标使用 lucide，除非现有工程已有统一图标库。
- 卡片内不要再套卡片；页面区块使用全宽 band 或无框 layout，重复实体才使用 card。
- 不使用深色酒吧背景、neon glow、过度装饰、花纹边框或一屏满版 hero。

## 10. 附录：设计稿已知问题与待补清单（backlog）

**实现以本文件 + `docs/prd/` 为准，与画稿冲突时画稿让位。**

2026-07-12 已按本清单完成一轮 `design_system.pen` 修订并重导 `design/exports/v2/` 全部 11 屏：侧边栏改顶部导航、四项统计 + Recipe Coverage + 最佳下一瓶、Because You Have 匹配单元名 + 来源副文案、难度冲突消除、配料行 owned 标记、评分拆分（策展分 / 个人评分）、Availability 新文案、筛选 chips 补齐、卡片收藏按钮、主名/次要别名分层、确认密码框、密码规则对齐 PRD、Log Your Pour 日期控件、Add Bottle owned/wishlist 选择、全部设计注释文字清除（勘误：09 屏下拉项漏删一处「（hover）」，已在 10.1.1 的第二轮修订中清除）、token 板与交互板同步 §2 新值（text-gold / control-border / 2px focus-ring）。

### 10.1 尚余事项

| 项 | 说明 |
|---|---|
| 图片素材 | 当前全部使用纯 paper-deep 占位——正式配方图/酒瓶图待 Public V1 内容阶段按 prd/01 §6 覆盖率门槛补齐 |
| 02/03/04 内容板无导航壳 | 900px 内容示意板，全局壳规格以 01 屏顶部导航为准；如需带壳完整稿，扩为 1440 屏时补 |
| 移动端配方详情 sticky action | 归入 §10.2 缺失屏一并补 |

### 10.1.1 2026-07-12 第二轮评审修订（已完成并重导 01/03/04/05/06/07/09 七屏）

- 05 移动首页：三卡横排 → **2×2 四卡**，补 Recipe Coverage 45%（prd/04 §2/§4）。
- 09 交互板：删除下拉项「（hover）」注释；「下次少放美思」由 tag chip 改为笔记示例文字，chips 收敛到品饮字典 8 词（平衡 balanced 选中 / 偏苦 / 清爽，prd/06 §4.3）。
- 07 登录：移除「记住我」勾选，「忘记密码？」保留右对齐。
- 03 配方库：移除与卡片同屏矛盾的「No recipes match」空状态（空状态归 §10.2 待补屏）；Can Make chip 改未选中默认态（消除与 Missing 1 卡的矛盾）。
- 04 桌面酒柜：All Types 改选中态（accent），Owned/Wishlist/Recently Added 改默认态（消除与 Wishlist 项同屏的矛盾）。
- 06 移动酒柜：列表行补 more 菜单；筛选行补 Recently Added chip；Owned chip 改默认态。
- 01 桌面首页：At a Glance 四行加行尾 chevron 可点击暗示。

尚余（不阻塞实现，实现以 PRD/design.md 为准）：

| 项 | 说明 |
|---|---|
| 03/04 网格密度 | 900px 板 4 列仅为画稿示意，规格是 768–1023px 2 列（§6 列数规则）；扩 1440 屏时按 4 列重排 |

### 10.2 缺失设计（待补屏）

Favorites、History、Profile、邮件确认、重置密码、访客首页、各空状态、移动端配方库、移动端配方详情、404 / loading、768–1024px（桌面内容布局 + Bottom Tab）形态。
