# Claude Design 提示词（复制下方全文使用）

---

## 主提示词

你是一位资深 Product UI Designer + Frontend Design System Engineer。请帮我优化 DailyPotion 的 Web App UI 设计。

**产品背景**
DailyPotion 是一个「家庭酒柜 + 鸡尾酒配方推荐」Web 应用：用户记录自己酒柜里的酒（如 Roku Gin），应用按基酒匹配推荐现在能调的鸡尾酒；有配方库（浏览/筛选/搜索/图文详情）、收藏与调酒打分记录、每日推荐一杯（Daily Pour）。中英双语，移动端优先，同时适配桌面。

**既定风格方向**
Modern Editorial Home Bar：米色纸张质感、衬线字体和复古酒单气质作为品牌识别；同时通过现代卡片布局、清晰数据模块、真实鸡尾酒图片、产品化导航和状态反馈，让它像一个家庭酒柜管理 Web App，而不是一张静态酒单。

风格参考：Aesop × Notion Calendar × Apple Books × 现代生活方式杂志。不要做成深色酒吧、neon、老菜单 PDF 或过度装饰。

**核心 token**
完整 design token 以 `design.md` 为唯一权威定义。必须保留 paper / ink / accent / gold / success 等核心 token，并使用新增的 hover、selected、success-soft、shadow、image-overlay token。禁止硬编码色值、字号、间距、圆角或阴影。

**请重点优化**
1. 首页从静态酒单升级为 Web App Dashboard：导航/侧边栏、Today’s Daily Pour、Cabinet Snapshot、Because You Have Roku Gin 推荐、Recently Added 或 Continue Mixing。
2. Recipe Detail 不只是文章页，要像可执行调酒流程：真实图片、配料、步骤、Availability、Log Your Pour、Favorite、Rating、Bartender Tip。
3. Recipes 页面像现代内容浏览页：搜索、filter chips、sort、图片卡片、rating、Can Make/Missing/Favorite 状态。
4. My Cabinet 是工具页：信息更密集，包含 search bottles、filters、Add Bottle、Bottle card/list。
5. Mobile 单独设计：Bottom Tab 为 Home / Recipes / Cabinet / Favorites / Profile；Home 有 compact Daily Pour、snapshot cards、horizontal carousel；Cabinet 是 list-first layout + floating Add button。

**视觉要求**
- 页面背景是干净浅纸色，可有非常轻微 paper texture。
- 卡片使用 paper-raised + border；关键模块才使用 subtle shadow。
- 优先使用真实 cocktail / bottle 图片，不要只用图标占位。
- 金色只用于 kicker、细线、少量 icon。
- 勃艮第红只用于主操作、active nav、selected filter。
- 橄榄绿只用于 Can Make / Owned / Success。
- Hover / active / selected 状态必须明确。
- 中英文双语展示要自然，不要让 display serif 过度装饰所有文字。

**输出**
请输出：
1. 完整 token 表，与 `design.md` 一致。
2. 桌面 Home Dashboard、Recipe Detail、Recipes Grid、My Cabinet。
3. Mobile Home、Mobile Cabinet，可补 Mobile Recipe Detail。
4. 每屏布局要点与关键组件规格。

---

## 逐屏迭代提示词

- “首页再提升产品感：让 Cabinet Snapshot 更像可操作数据模块，而不是说明文字。”
- “Recipe Detail 的 Ingredients / Instructions 再强化执行流程，Availability 和 Log Your Pour 要更清楚。”
- “Recipes Grid 增加 Can Make / Missing / Favorite 的不同状态对比。”
- “My Cabinet 桌面端更密集，移动端保持 list-first，不要卡片墙。”
- “把所有非 token 色值收敛到 design.md。”

---

## 收尾提示词

请把最终方案总结为：① 完整 token 表 ② 每屏布局要点清单 ③ 关键组件（导航/按钮/徽章/卡片/chip/Tab/空状态）的样式规格 ④ 与旧 Vintage Cocktail Menu 方向相比的差异。
