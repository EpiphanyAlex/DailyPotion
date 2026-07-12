# DailyPotion PRD · Home Dashboard（04）

| | |
|---|---|
| 优先级 | P0 |
| 依赖 | [01-data-model.md](01-data-model.md)、[02-matching-engine.md](02-matching-engine.md) |
| 设计稿 | `design/exports/v2/01-desktop-dashboard.png`、`design/exports/v2/05-mobile-home.png` |
| 总览 | [00-overview.md](00-overview.md) |

## 1. 目标

首页负责回答核心循环中的「今天调什么」：用户打开产品即看到当日确定性推荐（Daily Pour）、酒柜统计（能调 N 款、Missing Just One 可解锁 M 款）与基于自有酒瓶的推荐，驱动「挑一款调 → 记录 → 发现差一瓶 → 添加新酒瓶」的循环持续转动。本文件定义 Home Dashboard（路由 `/{locale}`，路由表与权限矩阵见[总览](00-overview.md)）的行为与数据逻辑。

## 2. 页面结构

- 首页是 Dashboard，不是静态酒单。
- **≥1280px**：Daily Pour hero 与右侧 At a Glance 统计栏并排（hero 左、统计栏右，见设计稿 01）→ 下方 Because You Have X → Recently Added Bottles。
- **768–1279px**：hero 全宽，统计降为 hero 下方的 **2×2 四卡网格**，其余模块顺序同上。
- **<768px 移动端**：紧凑卡片版（compact Daily Pour、**2×2 snapshot cards（四项统计，含 Recipe Coverage）**、横向配方 carousel）。
- 本文件只写行为与数据逻辑；视觉规格（颜色/字体/间距/状态）一律以 `design.md` 为准，布局对齐 meta 表中的设计稿。

## 3. Today's Daily Pour（hero）

- 每日为用户确定性推荐一款配方，当天内刷新不变。算法见[匹配引擎](02-matching-engine.md)的 dailyPour 小节。
- 展示：配方图、名称（主名 + 可选次要别名，显示策略见[国际化](09-i18n-and-global-states.md) §2.4）、描述、flavor tags、时长/难度/ABV、状态（Can Make 或 Missing 列表）。
- 操作：View Recipe（去[配方详情](06-recipe-detail.md)）、Save（收藏切换）。

## 4. Cabinet Snapshot（4 项统计，双形态）

| 卡片 | 定义 |
|---|---|
| Bottles Owned | `user_bottles` 中 `status = owned` 的数量 |
| Cocktails You Can Make | 可调配方数（[匹配引擎](02-matching-engine.md) canMake 小节） |
| Missing Just One | 只差 1 种匹配单元即可解锁的配方数（[匹配引擎](02-matching-engine.md) missing 与统计小节） |
| Recipe Coverage（配方覆盖率） | 可调配方数 ÷ 公开配方总数，四舍五入为百分比。**不得命名为 Cabinet Completion**——该指标衡量的是可调配方占比，不是酒柜完成度 |

`user_bottles` 表结构见[数据模型](01-data-model.md)。

- **形态**（同一组件两种呈现，见 §2）：≥1280px 为 hero 右侧统计栏——kicker「At a Glance」+ 四行（label 左、数字右）；<1280px（含移动端）为 2×2 数据卡网格。
- **四项全部可点击**（卡与统计行均是明确入口，需有 hover 反馈）：Bottles Owned → [Cabinet](07-my-cabinet.md)；Cocktails You Can Make → `/recipes?filter=can-make`；Missing Just One → `/recipes?filter=missing-one`（筛选态呈现与清除见[配方库](05-recipes-library.md)）；Recipe Coverage → `/recipes`（配方库总览）。
- CTA：Go to Cabinet（[我的酒柜](07-my-cabinet.md)）。

### 4.1 最佳下一瓶（Missing Just One 卡扩展区）

Missing Just One 只给数字不闭环——必须告诉用户**该补哪一瓶**。当 `bestNextType`（[匹配引擎](02-matching-engine.md) §5.1）非 null 时展示扩展区：

- 文案：「最佳下一瓶：{匹配单元名}」+「可解锁 {N} 款配方」。
- 位置随形态：统计栏形态在统计行下方作内嵌子卡（见设计稿 01）；四卡形态在网格下方作全宽横条（见设计稿 05）。语义上都是 Missing Just One 指标的扩展。
- CTA：**Add to Cabinet / Wishlist**——打开 Add Bottle modal 并按 `bestNextType` 返回的**精确匹配单元**预筛选（`initialSpiritTypeId`，只预选到分类不够——用户添加同分类的其他利口酒并不能解锁承诺的配方；机制见[我的酒柜](07-my-cabinet.md) §6），用户可选 owned 或 wishlist 保存。
- 与空酒柜态 Start with X 快捷入口的区别：Start with X 只预选**分类**（`initialCategory`），本扩展区预选**精确匹配单元**。
- `bestNextType` 为 null（无 Missing Just One 配方）时不展示扩展区，只显示统计数字。

## 5. Because You Have X（横向推荐）

- X = 用户 owned 酒瓶中**解锁可调配方数最多**的一瓶所对应的匹配单元（并列取最近添加），选瓶与选配方规则见[匹配引擎](02-matching-engine.md)的 becauseYouHave 小节。
- **标题用匹配单元名**（如 "Because You Have Gin"），副文案注明来源瓶（如「来自你的 Roku Gin」）——匹配按类型计算，标题写具体瓶名会误导用户（语义规则见[匹配引擎](02-matching-engine.md) becauseYouHave 小节）。
- 展示 5 张配方卡：图片、名称（主名 + 可选次要别名，显示策略见[国际化](09-i18n-and-global-states.md) §2.4）、评分（V1 为官方策展分，规则见[匹配引擎](02-matching-engine.md)评分与热度小节）、Can Make/Missing 状态、收藏按钮。

## 6. Recently Added Bottles

- 用户最近添加的 owned 酒瓶（最多 6 个），点击去[我的酒柜](07-my-cabinet.md)。

## 7. 空酒柜状态

- 酒柜为空时，Snapshot 与推荐区收起，显示空状态卡：「Add your first bottle」+ Start with Gin / Whisky / Rum 快捷入口（点击打开 Add Bottle modal 并预选该**分类**筛选（`initialCategory`）；Add Bottle modal 的完整规格见[我的酒柜](07-my-cabinet.md)）。

## 8. 未登录状态

- Daily Pour 显示全库策展版（[匹配引擎](02-matching-engine.md) dailyPour 小节的访客分支）。
- Snapshot 区替换为注册引导卡（三步路径文案 + Sign up CTA；三步路径「注册 → 添加第一瓶酒 → 看能调什么」的定义见 [Auth](03-auth.md)）。
- 推荐区显示 Popular 配方。

## 9. 验收标准

- 同一用户同一天内多次刷新，Daily Pour 不变；次日变化。
- 添加/移除酒瓶后返回首页，4 个统计数字即时正确。
- Missing Just One ≥ 1 时，「最佳下一瓶」展示的匹配单元与解锁数正确；点击 CTA 打开的 Add Bottle modal 已按该**精确匹配单元**预筛选（结果只含该类型的瓶，手动添加表单类型已预选）；添加该瓶后统计与扩展区即时更新。
- ≥1280px 统计栏与 <1280px 四卡两种形态下，四项统计均可点击进入对应列表页。
- Because You Have X 标题为匹配单元名，副文案含来源瓶名。
- 空酒柜、未登录两种状态按上述规则渲染，无残缺模块。
